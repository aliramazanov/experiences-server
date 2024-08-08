import express from "express";
import morgan from "morgan";
import errorController from "./middlewares/error.middleware.js";
import experienceRouter from "./routes/experiences.router.js";
import userRouter from "./routes/users.router.js";
import reviewRouter from "./routes/reviews.router.js";
import authRouter from "./routes/authentication.router.js";
import helmet from "helmet";
import hpp from "hpp";
import { parse } from "secure-json-parse";
import cors from "cors";

import ApplicationError from "./utils/application-errors-handler.js";
import limiter from "./middlewares/rate-limiter.js";

const app = express();

app.use(
  express.json({
    limit: "20kb",
    verify: (_req, _res, buf) => {
      if (buf && buf.length) {
        try {
          parse(buf.toString());
        } catch (e) {
          throw new Error("Invalid payload");
        }
      }
    },
  })
);

app.use(cors({ origin: "*" }));
app.use(morgan("dev"));
app.use(helmet());
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);
app.use("/api", limiter);

app.use("/api/v1/experience", experienceRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/review", reviewRouter);

app.all("*", (req, _res, next) => [
  next(
    new ApplicationError(`Can't find ${req.originalUrl} on this server!`, 404)
  ),
]);

app.use(errorController);

export default app;
