import express from "express";
import AuthController from "../controllers/authController.js";
import protect from "../middlewares/protect.js";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);

router.post("/forgot-password", AuthController.forgot);
router.patch("/reset-password/:token", AuthController.reset);
router.patch("/update-password/", protect, AuthController.update);

export default router;
