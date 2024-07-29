import express from "express";
import ReviewController from "../controllers/reviewController.js";
import protect from "../middlewares/protect.js";
import AuthController from "../controllers/authController.js";

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
