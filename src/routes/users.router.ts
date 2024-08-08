import express from "express";
import AuthController from "../controllers/auth.controller.js";
import UserController from "../controllers/user.controller.js";
import protect from "../middlewares/protect.middleware.js";
import {
  resizeProfilePhoto,
  uploadUserPhoto,
} from "../utils/multer-file-ops.js";

const router = express.Router();

router.use(protect);

router.get("/me", UserController.getMe, UserController.getUser);

router.patch(
  "/my-profile",
  uploadUserPhoto,
  resizeProfilePhoto,
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
