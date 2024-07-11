import express from "express";
import morgan from "morgan";
import errorController from "./middlewares/errMiddleware.js";
import tourRouter from "./routes/tourRouter.js";
import authRouter from "./routes/authRouter.js";

import ApplicationError from "./utils/error.js";

const app = express();

app.use(express.json());

app.use(morgan("dev"));

app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/auth", authRouter);

app.all("*", (req, _res, next) => [
  next(
    new ApplicationError(`Can't find ${req.originalUrl} on this server!`, 404)
  ),
]);

app.use(errorController);

export default app;
