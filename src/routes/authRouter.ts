import express from "express";
import Authentication from "../controllers/authController.js";

const router = express.Router();

router.post("/signup", Authentication.signup);

export default router;
