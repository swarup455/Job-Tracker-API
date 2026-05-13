import { Request } from "express";

// User Types
export interface IUser {
    _id: string;
    name: string;
    email: string;
    password: string;
    resume: string;
    createdAt: Date;
}

// Job Types
export type JobStatus = "Applied" | "Interview" | "Offer" | "Rejected";
export type JobSource = "LinkedIn" | "Naukri" | "Wellfound" | "Other";

export interface IJob {
    _id: string;
    userId: string;
    company: string;
    role: string;
    source: JobSource;
    jobLink?: string;
    status: JobStatus;
    appliedAt: Date;
    lastUpdatedAt: Date;
    followUpSent: boolean;
    notes?: string;
}

// Auth Types
export interface IAuthPayload {
    userId: string;
    email: string;
}

// Extending Express Request to include user
export interface IAuthRequest extends Request {
    user?: IAuthPayload;
}