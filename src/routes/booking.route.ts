import express from "express";
import AuthController from "../controllers/auth.controller.js";
import BookingController from "../controllers/booking.controller.js";
import protect from "../middlewares/protect.middleware.js";

const router = express.Router();

router.use(protect);

router.use(AuthController.restrictRoles("admin", "lead"));

router
  .route("/")
  .get(BookingController.getAllBookings)
  .post(BookingController.createBooking);

router
  .route("/:id")
  .get(BookingController.getBooking)
  .patch(BookingController.updateBooking)
  .delete(BookingController.deleteBooking);

export default router;
