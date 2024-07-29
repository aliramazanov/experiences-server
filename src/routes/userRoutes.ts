import express from "express";
import protect from "../middlewares/protect.js";
import UserController from "../controllers/userController.js";

const router = express.Router();

router.get("/me", protect, UserController.getMe, UserController.getUser);
router.get("/all-users", protect, UserController.getAllUsers);
router.patch("/my-profile", protect, UserController.updateMyDetails);
router.delete("/my-profile", protect, UserController.deleteMyProfile);

export default router;
