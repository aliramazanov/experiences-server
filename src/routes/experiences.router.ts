import express from "express";
import AuthController from "../controllers/auth.controller.js";
import ExperienceController from "../controllers/experience.controller.js";
import protect from "../middlewares/protect.middleware.js";
import {
  resizeExperienceImages,
  uploadExperienceImages,
} from "../utils/multer-file-ops.js";
import reviewRouter from "./reviews.router.js";

const router = express.Router();
router.use(protect);

router.route("/experience-stats").get(ExperienceController.getExperienceStats);

router.get(
  "/experiences-in/:distance/center/:latlong/unit/:value",
  ExperienceController.getExperiencesWithinRadius
);

router.get(
  "/distances/:latlong/unit/:value",
  ExperienceController.getDistancesOfExperiences
);

router
  .route("/monthly-plan/:year")
  .get(
    AuthController.restrictRoles("admin", "lead", "guide"),
    ExperienceController.getMonthlyPlan
  );

router
  .route("/")
  .get(ExperienceController.getAllExperiences)
  .post(
    AuthController.restrictRoles("admin", "lead"),
    ExperienceController.createExperience
  );

router
  .route("/:id")
  .get(ExperienceController.getExperience)
  .patch(
    AuthController.restrictRoles("admin", "lead"),
    uploadExperienceImages,
    resizeExperienceImages,
    ExperienceController.updateExperience
  )
  .delete(
    AuthController.restrictRoles("admin"),
    ExperienceController.deleteExperience
  );

router.use("/:experience-id/reviews", reviewRouter);

export default router;
