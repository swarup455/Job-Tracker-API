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

const router = Router();

router.post("/create", protect, createJob);
router.get("/get-jobs", protect, getJobs);
router.get("/get-job-byId", protect, getJobById);
router.put("/update", protect, updateJob);
router.delete("/delete", protect, deleteJob);
router.post("/get-stats", protect, getJobStats);

export default router