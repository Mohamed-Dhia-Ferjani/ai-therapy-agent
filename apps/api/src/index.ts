import dotenv from "dotenv";
import express from "express";
import type { Response, Request } from "express";
import { inngest } from "./inngest/index.js";
import { functions as inngestFunctions } from "./inngest/functions.js";
import { serve } from "inngest/express";
import { logger } from "./utils/looger.js";
import { connectDB } from "./utils/db.js";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
dotenv.config();
import authRouter from "./routes/auth.js";

const app = express();
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions }),
);

app.use("/auth", authRouter);

app.get("/api/chat", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Inngest endpoint available at http://localhost:${PORT}/api/inngest`,
      );
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
