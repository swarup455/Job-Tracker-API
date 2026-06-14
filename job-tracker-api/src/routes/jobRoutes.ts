import { Router } from "express";
import {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
    getJobStats,
} from "../controllers/jobController";
import { protect } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/validateMiddleware";
import {
    createJobValidator,
    updateJobValidator,
    jobIdValidator,
    getJobsValidator,
} from "../validators/jobValidator";

const router = Router();

router.post("/create", protect, createJobValidator, validate, createJob);
router.get("/stats", protect, getJobStats);
router.get("/", protect, getJobsValidator, validate, getJobs);
router.get("/:id", protect, jobIdValidator, validate, getJobById);
router.put("/:id", protect, updateJobValidator, validate, updateJob);
router.delete("/:id", protect, jobIdValidator, validate, deleteJob);

export default router;