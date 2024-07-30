import dotenv from "dotenv";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import checkEnvVariables from "./utils/checkenv.js";

dotenv.config({ path: "./config.env" });

const db = process.env.uri;
const port = process.env.port || 3000;

let server: http.Server;

const startServer = (): Promise<void> => {
  checkEnvVariables();

  console.log("Server is starting...");
  return new Promise<void>((resolve, reject) => {
    const connectToDatabase = async (): Promise<void> => {
      try {
        await mongoose.connect(db as string);
        console.log("Database connection established");
        resolve();
      } catch (error: any) {
        console.error("Database connection failed: ", error.message);
        reject(error);
      }
    };

    connectToDatabase();
  });
};

const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Closing server gracefully...`);
  if (server) {
    server.close(() => {
      console.log("HTTP server closed.");
      mongoose.connection.close().finally(() => {
        console.log("MongoDB connection closed.");
        process.exit(0);
      });
    });
  } else {
    mongoose.connection.close().finally(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  }
};

startServer()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });

    process.on("unhandledRejection", (error: any) => {
      console.error("Unhandled Rejection:", error.message);
      if (server) {
        server.close(() => {
          mongoose.connection.close().finally(() => process.exit(1));
        });
      } else {
        mongoose.connection.close().finally(() => process.exit(1));
      }
    });

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  })
  .catch((error: any) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
