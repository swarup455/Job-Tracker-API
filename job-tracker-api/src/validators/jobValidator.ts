import { body, param, query } from "express-validator";

export const createJobValidator = [
    body("company")
        .trim()
        .notEmpty().withMessage("Company is required")
        .isLength({ max: 100 }).withMessage("Company name cannot exceed 100 characters"),
    body("role")
        .trim()
        .notEmpty().withMessage("Role is required")
        .isLength({ max: 100 }).withMessage("Role cannot exceed 100 characters"),
    body("source")
        .notEmpty().withMessage("Source is required")
        .isIn(["LinkedIn", "Naukri", "Wellfound", "Other"]).withMessage("Invalid source"),
    body("status")
        .notEmpty().withMessage("Status is required")
        .isIn(["Applied", "Interview", "Offer", "Rejected"]).withMessage("Invalid status"),
    body("appliedAt")
        .notEmpty().withMessage("Applied date is required")
        .isISO8601().withMessage("appliedAt must be a valid date"),
    body("jobLink")
        .optional()
        .trim()
        .isURL().withMessage("jobLink must be a valid URL"),
    body("notes")
        .optional()
        .isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
    body("followUpSent")
        .optional()
        .isBoolean().withMessage("followUpSent must be a boolean"),
];

export const updateJobValidator = [
    param("id")
        .isMongoId().withMessage("Invalid job ID"),
    body("status")
        .optional()
        .isIn(["Applied", "Interview", "Offer", "Rejected"]).withMessage("Invalid status"),
    body("followUpSent")
        .optional()
        .isBoolean().withMessage("followUpSent must be a boolean"),
    body("notes")
        .optional()
        .isLength({ max: 1000 }).withMessage("Notes cannot exceed 1000 characters"),
];

export const jobIdValidator = [
    param("id")
        .isMongoId().withMessage("Invalid job ID"),
];

export const getJobsValidator = [
    query("status")
        .optional()
        .isIn(["Applied", "Interview", "Offer", "Rejected"]).withMessage("Invalid status"),
    query("source")
        .optional()
        .isIn(["LinkedIn", "Naukri", "Wellfound", "Other"]).withMessage("Invalid source"),
    query("sortBy")
        .optional()
        .isIn(["createdAt", "updatedAt", "appliedAt", "company", "role"]).withMessage("Invalid sortBy field"),
    query("order")
        .optional()
        .isIn(["asc", "desc"]).withMessage("order must be 'asc' or 'desc'"),
    query("page")
        .optional()
        .isInt({ min: 1 }).withMessage("page must be a positive integer"),
    query("limit")
        .optional()
        .isInt({ min: 1, max: 100 }).withMessage("limit must be between 1 and 100"),
];