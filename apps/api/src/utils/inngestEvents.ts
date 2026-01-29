import { inngest } from "src/inngest/index.js";
import { logger } from "./looger.js";

// Add more event sending functions as needed
export const sendMoodUpdateEvent = async (moodData: any) => {
  try {
    await inngest.send({
      name: "mood/updated",
      data: {
        userId: moodData.userId,
        mood: moodData.mood,
        timestamp: new Date().toISOString(),
        context: moodData.context,
        activities: moodData.activities,
        notes: moodData.notes,
        ...moodData,
      },
    });
    logger.info("Mood update event sent successfully");
  } catch (error) {
    logger.error("Failed to send mood update event:", error);
    throw error;
  }
};
