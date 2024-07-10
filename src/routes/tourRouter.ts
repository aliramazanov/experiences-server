import express from "express";
import TourController from "../controllers/tourController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router.route("/tour-stats").get(TourController.getTourStats);

router.route("/monthly-plan/:year").get(TourController.getMonthlyPlan);

router
  .route("/")
  .get(TourController.getAllTours)
  .post(protect, TourController.createTour);

router
  .route("/:id")
  .get(TourController.getTour)
  .patch(
    protect,
    TourController.restrictRoles("admin", "lead"),
    TourController.updateTour
  )
  .delete(
    protect,
    TourController.restrictRoles("admin"),
    TourController.deleteTour
  );

export default router;
