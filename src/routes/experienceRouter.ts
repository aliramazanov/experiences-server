import express from "express";
import ExperienceController from "../controllers/experienceController.js";
import protect from "../middlewares/protect.js";
import reviewRouter from "./reviewRouter.js";

const router = express.Router();

router.route("/experience-stats").get(ExperienceController.getExperienceStats);

router.route("/monthly-plan/:year").get(ExperienceController.getMonthlyPlan);

router
  .route("/")
  .get(ExperienceController.getAllExperiences)
  .post(protect, ExperienceController.createExperience);

router
  .route("/:id")
  .get(ExperienceController.getExperience)
  .patch(
    protect,
    ExperienceController.restrictRoles("admin", "lead"),
    ExperienceController.updateExperience
  )
  .delete(
    protect,
    ExperienceController.restrictRoles("admin"),
    ExperienceController.deleteExperience
  );

router.use("/:experience-id/reviews", reviewRouter);

export default router;
