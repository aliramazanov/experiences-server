import express from "express";
import ReviewController from "../controllers/review.controller.js";
import protect from "../middlewares/protect.middleware.js";
import AuthController from "../controllers/auth.controller.js";

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(ReviewController.getAllReviews)
  .post(
    AuthController.restrictRoles("user"),
    ReviewController.setIds,
    ReviewController.createReview
  );

router
  .route("/:id")
  .get(ReviewController.getReview)
  .patch(
    AuthController.restrictRoles("user", "admin"),
    ReviewController.updateReview
  )
  .delete(AuthController.restrictRoles("user"), ReviewController.deleteReview);

export default router;
