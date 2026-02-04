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
import authRouter from "./routes/auth.js";
import chatRouter from "./routes/chat.js";
import http from "http";
import { attachWebSocketServer } from "./websocket/server.js";
dotenv.config();
const app = express();

const server = http.createServer(app);
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

const { broadcastMatchCreated } = attachWebSocketServer(server);

app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan("dev")); // HTTP request logger
app.use(
  "/api/inngest",
  serve({ client: inngest, functions: inngestFunctions }),
);

app.use("/auth", authRouter);
app.use("/chat", chatRouter);

app.get("/api/chat", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start the server

    app.listen(PORT, HOST, () => {
      const baseUrl =
        HOST === "0.0.0.0"
          ? `http://localhost${PORT}`
          : `http://${HOST}:${PORT}`;
      logger.info(`Server is running on ${baseUrl}`);
      logger.info(`Server is running on port ${PORT}`);
      logger.info(
        `Websocket Server is running on ${baseUrl.replace("http", "ws")}/ws`,
      );
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
