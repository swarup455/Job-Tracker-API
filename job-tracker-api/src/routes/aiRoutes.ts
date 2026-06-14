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
import { upload } from "../middlewares/upload.middleware";
import { aiRateLimiter } from "../middlewares/rateLimitMiddleware";
import { generateMessageValidator, jobDescriptionTextValidator, scamDetectionValidator } from "../validators/aiValidator";
import { validate } from "../middlewares/validateMiddleware";

const router = Router();

router.post("/summarize-jd", protect, aiRateLimiter(), upload.single("jobDescription"), summarizeJobDescription);
router.post("/analyze-application", protect, aiRateLimiter(), jobDescriptionTextValidator, validate, analyzeJobApplication);
router.post("/skill-roadmap", protect, aiRateLimiter(), jobDescriptionTextValidator, validate, generateSkillRoadmap);
router.post("/interview-questions", protect, aiRateLimiter(), jobDescriptionTextValidator, validate, generateInterviewQuestions);
router.post("/scam-detection", protect, aiRateLimiter(), scamDetectionValidator, validate, detectJobScam);
router.post("/generate-message", protect, aiRateLimiter(), generateMessageValidator, validate, generateApplicationMessage);

export default router;