import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import checkEnvVariables from "./utils/checkenv.js";

dotenv.config({ path: "./config.env" });

const db = process.env.uri;
const port = process.env.port || 3000;

if (!db) {
  throw new Error("Database URI not specified in environment variables.");
}

let server: http.Server;

const startServer = async (): Promise<void> => {
  checkEnvVariables();

  console.log("Server is starting...");
  try {
    await mongoose.connect(db as string);
    console.log("Database connection established");
  } catch (error: any) {
    console.error("Database connection failed: ", error.message);
    throw error;
  }
};

const closeConnections = (): Promise<void> => {
  return new Promise((resolve) => {
    mongoose.connection.close().finally(() => {
      console.log("MongoDB connection closed.");
      resolve();
    });
  });
};

const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      closeConnections().finally(() => process.exit(0));
    });
  } else {
    closeConnections().finally(() => process.exit(0));
  }
};

startServer()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    process.on("unhandledRejection", (error: any) => {
      console.error("Unhandled Rejection:", error.stack || error.message);
      if (server) {
        server.close(() => {
          closeConnections().finally(() => process.exit(1));
        });
      } else {
        closeConnections().finally(() => process.exit(1));
      }
    });

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error: any) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
