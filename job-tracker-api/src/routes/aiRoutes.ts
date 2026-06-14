import { Router } from "express";
import {
    summarizeJobDescription,
    analyzeJobApplication,
    generateSkillRoadmap,
    generateInterviewQuestions,
    detectJobScam,
    generateApplicationMessage
} from "../controllers/aiController";
import { protect } from "../middlewares/authMiddleware";

const router = Router();

router.post("/summarize-jd", protect, summarizeJobDescription);
router.post("/analyze-application", protect, analyzeJobApplication);
router.post("/skill-roadmap", protect, generateSkillRoadmap);
router.post("/interview-questions", protect, generateInterviewQuestions);
router.post("/scam-detection", protect, detectJobScam);
router.post("/generate-message", protect, generateApplicationMessage);

export default router;