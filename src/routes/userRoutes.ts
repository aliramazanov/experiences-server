import express from "express";
import protect from "../middlewares/protect";
import UserController from "../controllers/userController";

const router = express.Router();

router.get("/all-users", protect, UserController.getAllUsers);
router.patch("/my-details", protect, UserController.updateMyDetails);

export default router;
