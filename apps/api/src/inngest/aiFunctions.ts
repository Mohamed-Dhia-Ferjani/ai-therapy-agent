import { logger } from "src/utils/looger.js";
import { inngest } from "./index.js";
import Groq from "groq-sdk";
import { ChatSession } from "src/models/Chat.js";

console.log("Gemini key present?", process.env.GEMINI_API_KEY);

let groqClient: Groq | null = null;

export function getGenAI() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set");
    }

    groqClient = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  return groqClient;
}

export async function getGroqChatCompletion(
  role: "user" | "assistant",
  prompt: string,
) {
  const groq = getGenAI();
  return groq.chat.completions.create({
    messages: [
      {
        role,
        content: prompt,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}
// Function to handle chat message processing
// ! this start here
export const processChatMessage = inngest.createFunction(
  {
    id: "process-chat-message",
  },
  { event: "therapy/session.message" },
  async ({ event, step }) => {
    const {
      sessionId,
      message,
      role,
      history,
      memory = {
        userProfile: {
          emotionalState: [],
          riskLevel: 0,
          preferences: {},
        },
        sessionContext: {
          conversationThemes: [],
          currentTechnique: null,
        },
      },
      goals = [],
      systemPrompt,
    } = event.data;

    logger.info("Processing chat message", {
      message,
      historyLength: history?.length,
      sessionId,
    });

    // -------------------------------------------------------
    // 1️⃣ ANALYSIS STEP
    // -------------------------------------------------------
    const analysis = await step.run("analyze-message", async () => {
      try {
        const prompt = `
Analyze this therapy message and return ONLY valid JSON.

Message: ${message}
Context: ${JSON.stringify({ memory, goals })}

Required JSON structure:
{
  "emotionalState": "string",
  "themes": ["string"],
  "riskLevel": number,
  "recommendedApproach": "string",
  "progressIndicators": ["string"]
}`;

        const response = await getGroqChatCompletion(role, prompt);
        const text = response.choices?.[0]?.message?.content || "";

        // remove accidental markdown
        const clean = text.replace(/```json|```/g, "").trim();

        return JSON.parse(clean);
      } catch (err) {
        logger.error("Analysis failed, returning fallback", err);
        return {
          emotionalState: "neutral",
          themes: [],
          riskLevel: 0,
          recommendedApproach: "supportive",
          progressIndicators: [],
        };
      }
    });

    // -------------------------------------------------------
    // 2️⃣ UPDATE MEMORY STEP
    // -------------------------------------------------------
    const updatedMemory = await step.run("update-memory", async () => {
      try {
        if (analysis.emotionalState) {
          memory.userProfile.emotionalState.push(analysis.emotionalState);
        }

        if (analysis.themes) {
          memory.sessionContext.conversationThemes.push(...analysis.themes);
        }

        if (typeof analysis.riskLevel === "number") {
          memory.userProfile.riskLevel = analysis.riskLevel;
        }

        return memory;
      } catch (err) {
        logger.error("Memory update failed", err);
        return memory; // fallback keep old memory
      }
    });

    // -------------------------------------------------------
    // 3️⃣ GENERATE RESPONSE STEP
    // -------------------------------------------------------
    const aiResponse = await step.run("generate-response", async () => {
      try {
        const prompt = `
${systemPrompt}

Based on the following data, generate a supportive therapeutic response:

Message: ${message}
Analysis: ${JSON.stringify(analysis)}
Memory: ${JSON.stringify(updatedMemory)}
Goals: ${JSON.stringify(goals)}

The response must:
1. Address emotions
2. Use useful therapeutic techniques
3. Show empathy
4. Maintain professional boundaries
5. Prioritize user safety
`;

        const response = await getGroqChatCompletion(role, prompt);
        return response.choices?.[0]?.message?.content || "";
      } catch (err) {
        logger.error("Response generation failed", err);
        return "I'm here with you. Can you tell me more about what you're feeling right now?";
      }
    });

    // -------------------------------------------------------
    // 4️⃣ SAVE TO DATABASE — USER + ASSISTANT
    // -------------------------------------------------------
    const saveResult = await step.run("save-session-message", async () => {
      try {
        const session = await ChatSession.findOne({ sessionId }).exec();

        if (!session) {
          logger.error("Session not found", { sessionId });
          throw new Error("Session not found");
        }

        // Save USER message
        session.messages.push({
          role: role || "user",
          content: message,
          // metadata: {
          //   type: "user_message",
          //   timestamp: new Date().toISOString(),
          // },
        });

        // Save ASSISTANT response
        session.messages.push({
          role: "assistant",
          content: aiResponse,
          // metadata: {
          //   type: "assistant_response",
          //   analysis,
          //   memory: updatedMemory,
          //   timestamp: new Date().toISOString(),
          // },
        });

        const result = await session.save();
        return result;
      } catch (err) {
        logger.error("Failed to save session message", err);
        throw err; // allow Inngest retry
      }
    });

    logger.info("Message saved successfully", { saveResult });

    // -------------------------------------------------------
    // 5️⃣ RETURN FINAL OBJECT
    // -------------------------------------------------------
    return {
      response: aiResponse,
      analysis,
      updatedMemory,
    };
  },
);

//! this end here

// Function to analyze therapy session content
export const analyzeTherapySession = inngest.createFunction(
  { id: "analyze-therapy-session" },
  { event: "therapy/session.created" },
  async ({ event, step }) => {
    try {
      // Get the session content
      const sessionContent = await step.run("get-session-content", async () => {
        return event.data.notes || event.data.transcript;
      });

      // Analyze the session using Gemini
      const analysis = await step.run("analyze-with-gemini", async () => {
        const prompt = `Analyze this therapy session and provide insights:
        Session Content: ${sessionContent}
        
        Please provide:
        1. Key themes and topics discussed
        2. Emotional state analysis
        3. Potential areas of concern
        4. Recommendations for follow-up
        5. Progress indicators
        
        Format the response as a JSON object.`;
        const response = await getGroqChatCompletion(event.data.role, prompt);

        const text = response.choices?.[0]?.message?.content?.trim() || "";

        return JSON.parse(text);
      });

      // Store the analysis
      await step.run("store-analysis", async () => {
        // Here you would typically store the analysis in your database
        logger.info("Session analysis stored successfully");
        return analysis;
      });

      // If there are concerning indicators, trigger an alert
      if (analysis.areasOfConcern?.length > 0) {
        await step.run("trigger-concern-alert", async () => {
          logger.warn("Concerning indicators detected in session analysis", {
            sessionId: event.data.sessionId,
            concerns: analysis.areasOfConcern,
          });
          // Add your alert logic here
        });
      }

      return {
        message: "Session analysis completed",
        analysis,
      };
    } catch (error) {
      logger.error("Error in therapy session analysis:", error);
      throw error;
    }
  },
);

// Function to generate personalized activity recommendations
export const generateActivityRecommendations = inngest.createFunction(
  { id: "generate-activity-recommendations" },
  { event: "mood/updated" },
  async ({ event, step }) => {
    try {
      // Get user's mood history and activity history
      const userContext = await step.run("get-user-context", async () => {
        // Here you would typically fetch user's history from your database
        return {
          recentMoods: event.data.recentMoods,
          completedActivities: event.data.completedActivities,
          preferences: event.data.preferences,
        };
      });

      // Generate recommendations using Gemini
      const recommendations = await step.run(
        "generate-recommendations",
        async () => {
          const prompt = `Based on the following user context, generate personalized activity recommendations:
        User Context: ${JSON.stringify(userContext)}
        
        Please provide:
        1. 3-5 personalized activity recommendations
        2. Reasoning for each recommendation
        3. Expected benefits
        4. Difficulty level
        5. Estimated duration
        
        Format the response as a JSON object.`;

          const response = await getGroqChatCompletion(event.data.role, prompt);
          const resultText = response.choices?.[0]?.message?.content || "";

          return JSON.parse(resultText);
        },
      );

      // Store the recommendations
      await step.run("store-recommendations", async () => {
        // Here you would typically store the recommendations in your database
        logger.info("Activity recommendations stored successfully");
        return recommendations;
      });

      return {
        message: "Activity recommendations generated",
        recommendations,
      };
    } catch (error) {
      logger.error("Error generating activity recommendations:", error);
      throw error;
    }
  },
);

// Add the functions to the exported array
export const functions = [
  processChatMessage,
  analyzeTherapySession,
  generateActivityRecommendations,
];
