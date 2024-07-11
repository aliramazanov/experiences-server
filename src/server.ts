import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import checkEnvVariables from "./utils/checkenv.js";

dotenv.config({ path: "./config.env" });

const db = process.env.uri;
const port = process.env.port || 3000;

const startServer = () => {
  checkEnvVariables();

  console.log("Server is starting...");
  return new Promise<void>((resolve, reject) => {
    const connectToDatabase = async () => {
      try {
        await mongoose.connect(db as string);
        console.log("Database connection established");
        resolve();
      } catch (error: Error | any) {
        console.error("Database connection failed: ", error.message);
        reject(error);
      }
    };

    connectToDatabase();
  });
};

startServer()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((error: Error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });
