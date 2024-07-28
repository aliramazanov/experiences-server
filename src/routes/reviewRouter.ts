import express from "express";
import ReviewController from "../controllers/reviewController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router
  .route("/")
  .get(protect, ReviewController.getAllReviews)
  .post(protect, ReviewController.createReview);

export default router;
