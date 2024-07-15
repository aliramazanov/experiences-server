import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  max: 100,
  windowMs: 30 * 60 * 1000,
  message: "Too many requests, please try again in half an hour",
});

export default limiter;
