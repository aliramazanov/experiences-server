import express from "express";
import protect from "../middlewares/protect";
import UserController from "../controllers/userController";

const router = express.Router();

router.get("/all-users", protect, UserController.getAllUsers);
router.patch("/my-profile", protect, UserController.updateMyDetails);
router.delete("/my-profile", protect, UserController.deleteMyProfile);

export default router;
