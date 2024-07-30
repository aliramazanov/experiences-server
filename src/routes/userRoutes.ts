import express from "express";
import protect from "../middlewares/protect.js";
import UserController from "../controllers/userController.js";
import AuthController from "../controllers/authController.js";
import multer from "multer";

const router = express.Router();

const upload = multer({ dest: "public/img/users/" });

router.use(protect);

router.get("/me", UserController.getMe, UserController.getUser);

router.patch(
  "/my-profile",
  upload.single("photo"),
  UserController.updateMyDetails
);

router.delete("/my-profile", UserController.deleteMyProfile);

router.use(AuthController.restrictRoles("admin"));

router.get("/all-users", UserController.getAllUsers);

router
  .route("/:id")
  .get(UserController.getUser)
  .patch(UserController.updateUser)
  .delete(UserController.deleteUser);

export default router;
