import express from "express";
import ExperienceController from "../controllers/experienceController.js";
import protect from "../middlewares/protect.js";
import reviewRouter from "./reviewRouter.js";
import AuthController from "../controllers/authController.js";

const router = express.Router();
router.use(protect);

router.route("/experience-stats").get(ExperienceController.getExperienceStats);

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
    ExperienceController.updateExperience
  )
  .delete(
    AuthController.restrictRoles("admin"),
    ExperienceController.deleteExperience
  );

router.use("/:experience-id/reviews", reviewRouter);

export default router;
