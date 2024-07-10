import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);

router.post("/forgot-password", AuthController.forgot);
router.post("/reset-password", AuthController.signup);

export default router;
