import { body } from "express-validator";

export const scamDetectionValidator = [
    body("jobDescription")
        .trim()
        .notEmpty().withMessage("Job description is required")
        .isLength({ min: 20 }).withMessage("Job description must be at least 20 characters"),
    body("company").optional().isString(),
    body("jobLink").optional().isURL().withMessage("jobLink must be a valid URL"),
];

export const generateMessageValidator = [
    body("type")
        .notEmpty().withMessage("type is required")
        .isIn(["linkedin", "cold-email", "whatsapp", "referral"]).withMessage("Invalid message type"),
    body("company").trim().notEmpty().withMessage("company is required"),
    body("role").trim().notEmpty().withMessage("role is required"),
    body("recipientName").optional().isString(),
];

export const jobDescriptionTextValidator = [
    body("jobDescriptionText")
        .trim()
        .notEmpty().withMessage("jobDescriptionText is required")
        .isLength({ min: 20 }).withMessage("Must be at least 20 characters"),
];