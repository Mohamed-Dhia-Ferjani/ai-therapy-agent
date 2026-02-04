import type { Request, Response } from "express";
import { Types } from "mongoose";
import { getGenAI, getGroqChatCompletion } from "src/inngest/aiFunctions.js";
import { inngest } from "src/inngest/index.js";
import { ChatSession, type IChatSession } from "src/models/Chat.js";
import { User } from "src/models/User.js";
import { logger } from "src/utils/looger.js";
import { v4 as uuidv4 } from "uuid";

export const createChatSession = async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      return res
        .status(401)
        .json({ message: "Unauthorized - User not authenticated" });
    }

    const userId = new Types.ObjectId(req.user.id);
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const sessionId = uuidv4();
    const session = new ChatSession({
      sessionId,
      userId,
      startTime: new Date(),
      status: "active",
      messages: [],
    });
    await session.save();
    res.status(201).json({
      message: "Chat session created successfully",
      sessionId: session.sessionId,
    });
  } catch (error) {
    logger.error("Error creating chat session:", error);
    res.status(500).json({
      message: "Error creating chat session",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getChatSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = new Types.ObjectId(req.user.id);

    const session = await ChatSession.findById({ sessionId });
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json(session);
  } catch (error) {
    logger.error("Failed to get chat session:", error);
    res.status(500).json({ error: "Failed to get chat session" });
  }
};

export const getSessionHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = new Types.ObjectId(req.user.id);

    const session = (await ChatSession.findById(
      sessionId,
    ).exec()) as IChatSession;
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.json({
      messages: session.messages,
      startTime: session.createdAt,
      status: session.status,
    });
  } catch (error) {
    logger.error("Error fetching session history:", error);
    res.status(500).json({ message: "Error fetching session history" });
  }
};

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const { role, content } = req.body;
    const userId = new Types.ObjectId(req.user.id);
    if (!role || !content || typeof sessionId !== "string") {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const session = await ChatSession.findOne({ sessionId }).exec();

    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }
    if (session.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await inngest.send({
      name: "therapy/session.message",
      data: {
        sessionId,
        message: content,
        history: session.messages,
        role: role,
      },
    });

    const updatedSession = await ChatSession.findOne({ sessionId }).exec();

    res.status(200).json(updatedSession?.messages || []);
  } catch (error) {
    logger.error("Error sending message:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};
