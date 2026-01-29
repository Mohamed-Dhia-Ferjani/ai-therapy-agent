import mongoose from "mongoose";

let cached: typeof mongoose | null = null;

export const connectDB = async (MONGODB_URI: string) => {
  try {
    if (cached) {
      return cached;
    }
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    const conn = await mongoose.connect(MONGODB_URI);
    cached = conn;
    console.log("Connected to MongoDB Atlas");
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
