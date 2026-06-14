import { body } from "express-validator";

export const registerValidator = [
    body("fullName")
        .trim()
        .notEmpty().withMessage("Full name is required")
        .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Please enter a valid email")
        .normalizeEmail(),
    body("password")
        .notEmpty().withMessage("Password is required"),
];

export const resetPasswordValidator = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required"),
    body("newPassword")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 6 }).withMessage("New password must be at least 6 characters"),
];

export const updateUserValidator = [
    body("name")
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),
    body("resume")
        .optional()
        .isString()
        .isLength({ max: 10000 }).withMessage("Resume text cannot exceed 10000 characters"),
];

export const deleteAccountValidator = [
    body("password")
        .notEmpty().withMessage("Password is required"),
];