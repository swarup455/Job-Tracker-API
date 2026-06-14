import { Response } from "express";
import { AuthRequest, ScamDetectionBody } from "../types";
import { extractTextFromFile } from "../utils/extractText";
import User from "../models/user.model";
import {
    summarizeJDChain,
    analyzeApplicationChain,
    skillRoadmapChain,
    interviewQuestionsChain,
    jobScamChain,
    applicationMessageChain
} from "../langchain/langchainChains";
import { generateCacheKey } from "../utils/generateCacheKey";
import redis from "../config/redis";

export const uploadResume = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const resume = req?.file;
        const user = req?.user;

        if (!user) {
            return res
                .status(401)
                .json({
                    status: 401,
                    message: "User not found!"
                })
        }
        if (!resume) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Resume file is required"
                });
        }
        const resumeText = await extractTextFromFile(resume);
        const uploadedResume = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    resume: resumeText,
                }
            },
            { new: true }
        );

        return res.status(201).json({
            status: 201,
            data: uploadedResume,
            message: "Successfully uploaded resume!"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const summarizeJobDescription = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found!" });
        }

        const currentUser = await User.findById(user._id);
        if (!currentUser) {
            return res.status(401).json({ status: 401, message: "current user not found!" });
        }

        const resume = currentUser?.resume;
        if (!resume) {
            return res.status(404).json({ status: 404, message: "Upload resume first to get proper analysis!!" });
        }

        const jobDescription = req?.file;
        if (!jobDescription) {
            return res.status(400).json({
                success: false,
                message: "Upload Job description first!!",
            });
        }

        const jobDescriptionText = await extractTextFromFile(jobDescription);

        const cacheKey = generateCacheKey("jd-summary", user._id.toString(), jobDescriptionText.slice(0, 50));
        const cached = await redis.get(cacheKey);
        if (cached) {
            const parsed = JSON.parse(cached);
            return res.status(200).json({
                status: 200,
                cached: true,
                data: parsed.jdSummary,
                message: "Job description summarized successfully!"
            });
        }
        const result = await summarizeJDChain.invoke({ jobDescription: jobDescriptionText });

        await redis.setex(
            cacheKey,
            300,
            JSON.stringify({
                resumeContent: resume,
                jdSummary: result,
            })
        );

        return res.status(200).json({
            status: 200,
            data: result,
            message: "Job description summarized successfully!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const analyzeJobApplication = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found!" });
        }

        const { jobDescriptionText }: { jobDescriptionText: string } = req.body;
        if (!jobDescriptionText) {
            return res.status(400).json({
                success: false,
                message: "Job description is required",
            });
        }

        const jdCacheKey = generateCacheKey("jd-summary", user._id.toString(), jobDescriptionText.slice(0, 50));
        const jdCached = await redis.get(jdCacheKey);

        if (!jdCached) {
            return res.status(404).json({
                status: 404,
                message: "Please summarize the job description first or Again!"
            });
        }

        const analysisCacheKey = generateCacheKey("jd-analysis", user._id.toString(), jobDescriptionText.slice(0, 50));
        const analysisCached = await redis.get(analysisCacheKey);

        if (analysisCached) {
            return res.status(200).json({
                status: 200,
                cached: true,
                data: JSON.parse(analysisCached),
                message: "Application analyzed successfully!"
            });
        }

        const { resumeContent, jdSummary } = JSON.parse(jdCached);

        const result = await analyzeApplicationChain.invoke({
            resume: resumeContent,
            jobDescription: JSON.stringify(jdSummary),
        });

        await redis.setex(analysisCacheKey, 300, JSON.stringify(result));

        return res.status(200).json({
            status: 200,
            cached: false,
            data: result,
            message: "Application analyzed successfully!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const generateSkillRoadmap = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found!" });
        }

        const { jobDescriptionText }: { jobDescriptionText: string } = req.body;
        if (!jobDescriptionText) {
            return res.status(400).json({
                success: false,
                message: "Job description is required",
            });
        }

        const analysisCacheKey = generateCacheKey("jd-analysis", user._id.toString(), jobDescriptionText.slice(0, 50));
        const analysisCached = await redis.get(analysisCacheKey);

        if (!analysisCached) {
            return res.status(404).json({
                status: 404,
                message: "Please analyze the job application first!"
            });
        }

        const roadmapCacheKey = generateCacheKey("skill-roadmap", user._id.toString(), jobDescriptionText.slice(0, 50));
        const roadmapCached = await redis.get(roadmapCacheKey);

        if (roadmapCached) {
            return res.status(200).json({
                status: 200,
                cached: true,
                data: JSON.parse(roadmapCached),
                message: "Skill roadmap generated successfully!"
            });
        }

        const { missingSkills } = JSON.parse(analysisCached);

        if (!missingSkills || missingSkills.length === 0) {
            return res.status(200).json({
                status: 200,
                data: { roadmap: [] },
                message: "No missing skills found — you're a great match!"
            });
        }

        const result = await skillRoadmapChain.invoke({
            missingSkills: missingSkills.join(", "),
        });

        await redis.setex(roadmapCacheKey, 300, JSON.stringify(result));

        return res.status(200).json({
            status: 200,
            cached: false,
            data: result,
            message: "Skill roadmap generated successfully!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const generateInterviewQuestions = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found!" });
        }

        const { jobDescriptionText }: { jobDescriptionText: string } = req.body;
        if (!jobDescriptionText) {
            return res.status(400).json({
                success: false,
                message: "Job description is required",
            });
        }

        const jdCacheKey = generateCacheKey("jd-summary", user._id.toString(), jobDescriptionText.slice(0, 50));
        const jdCached = await redis.get(jdCacheKey);

        if (!jdCached) {
            return res.status(404).json({
                status: 404,
                message: "Please summarize the job description first!"
            });
        }

        const questionsCacheKey = generateCacheKey("interview-questions", user._id.toString(), jobDescriptionText.slice(0, 50));
        const questionsCached = await redis.get(questionsCacheKey);

        if (questionsCached) {
            return res.status(200).json({
                status: 200,
                cached: true,
                data: JSON.parse(questionsCached),
                message: "Interview questions generated successfully!"
            });
        }

        const { resumeContent, jdSummary } = JSON.parse(jdCached);

        const result = await interviewQuestionsChain.invoke({
            resume: resumeContent,
            jobDescription: JSON.stringify(jdSummary),
        });

        await redis.setex(questionsCacheKey, 300, JSON.stringify(result));

        return res.status(200).json({
            status: 200,
            cached: false,
            data: result,
            message: "Interview questions generated successfully!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const detectJobScam = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found!" });
        }

        const { company, jobDescription, jobLink }: ScamDetectionBody = req.body;

        if (!jobDescription || jobDescription.trim().length < 20) {
            return res.status(400).json({
                success: false,
                message: "Job description is required and must be meaningful",
            });
        }

        const cacheKey = generateCacheKey("job-scam", user._id.toString(), jobDescription.slice(0, 50));
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.status(200).json({
                status: 200,
                cached: true,
                data: JSON.parse(cached),
                message: "Scam analysis completed successfully!"
            });
        }

        const result = await jobScamChain.invoke({
            company: company ?? "Not provided",
            jobLink: jobLink ?? "Not provided",
            jobDescription,
        });

        await redis.setex(cacheKey, 300, JSON.stringify(result));

        return res.status(200).json({
            status: 200,
            cached: false,
            data: result,
            message: "Scam analysis completed successfully!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const generateApplicationMessage = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        if (!user) {
            return res.status(401).json({ status: 401, message: "User not found!" });
        }

        const { type, company, role, recipientName }: GenerateMessageBody = req.body;

        if (!type || !company || !role) {
            return res.status(400).json({
                success: false,
                message: "type, company, and role are required",
            });
        }

        const cacheKey = generateCacheKey("application-message", user._id.toString(), type, company, role);
        const cached = await redis.get(cacheKey);

        if (cached) {
            return res.status(200).json({
                status: 200,
                cached: true,
                data: cached,
                message: "Application message generated successfully!"
            });
        }

        const result = await applicationMessageChain.invoke({
            type,
            company,
            role,
            recipientName: recipientName ?? "Hiring Manager",
        });

        await redis.setex(cacheKey, 300, result);

        return res.status(200).json({
            status: 200,
            cached: false,
            data: result,
            message: "Application message generated successfully!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}