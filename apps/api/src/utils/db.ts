import mongoose from "mongoose";
import { logger } from "./looger.js";

export const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    console.log("this is the uri:", MONGODB_URI);
    // console.log(MONGODB_URI);
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    await mongoose.connect(MONGODB_URI);
    logger.info("Connected to MongoDB Atlas");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
