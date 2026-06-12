import { Request } from "express";

export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    resume?: string;
    createdAt: Date;
}

export interface RegisterUserBody {
    fullName: string;
    email: string;
    password: string;
}

export interface LoginUserBody {
    email: string;
    password: string;
}

export interface ResetPasswordBody {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateUserBody {
    name?: string;
    resume?: string;
}

export interface UpdateJobBody {
    jobId?: string;
    status?: JobStatus;
    followUpSent?: boolean;
    notes?: string
}

export type JobStatus = "Applied" | "Interview" | "Offer" | "Rejected";
export type JobSource = "LinkedIn" | "Naukri" | "Wellfound" | "Other";

export interface JobBody {
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

export interface AuthPayload {
    _id: string,
    name: string;
    email: string;
}

export interface AuthRequest extends Request {
    user?: AuthPayload;
}