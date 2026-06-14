import { Router } from "express";
import {
    uploadResume,
    summarizeJobDescription,
    analyzeJobApplication,
    generateSkillRoadmap,
    generateInterviewQuestions,
    detectJobScam,
    generateApplicationMessage
} from "../controllers/aiController";
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/upload.middleware";
import { aiRateLimiter } from "../middlewares/rateLimitMiddleware";
import { generateMessageValidator } from "../validators/aiValidator";
import { validate } from "../middlewares/validateMiddleware";

const router = Router();

router.post("/upload-resume", protect, upload.single("resume"), uploadResume);
router.post("/summarize-jd", protect, aiRateLimiter(), upload.single("jobDescription"), summarizeJobDescription);
router.post("/analyze-application", protect, aiRateLimiter(), upload.single("jobDescription"), analyzeJobApplication);
router.post("/skill-roadmap", protect, aiRateLimiter(), upload.single("jobDescription"), generateSkillRoadmap);
router.post("/interview-questions", protect, aiRateLimiter(), upload.single("jobDescription"), generateInterviewQuestions);
router.post("/scam-detection", protect, aiRateLimiter(), upload.single("jobDescription"), detectJobScam);
router.post("/generate-message", protect, aiRateLimiter(), generateMessageValidator, validate, generateApplicationMessage);

export default router;