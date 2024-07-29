import express from "express";
import ReviewController from "../controllers/reviewController.js";
import protect from "../middlewares/protect.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(protect, ReviewController.getAllReviews)
  .post(protect, ReviewController.setIds, ReviewController.createReview);

router
  .route("/:id")
  .patch(ReviewController.updateReview)
  .delete(ReviewController.deleteReview);

export default router;
