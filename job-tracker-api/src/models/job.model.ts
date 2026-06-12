import mongoose, { Document, Schema } from "mongoose";
import { JobStatus, JobSource } from "../types";

export interface IJobDocument extends Document {
    userId: mongoose.Types.ObjectId;
    company: string;
    role: string;
    source: JobSource;
    jobLink?: string;
    status: JobStatus;
    appliedAt: Date;
    followUpSent: boolean;
    notes?: string;
}

const jobSchema = new Schema<IJobDocument>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
            maxlength: [100, "Company name cannot exceed 100 characters"],
        },
        role: {
            type: String,
            required: [true, "Role is required"],
            trim: true,
            maxlength: [100, "Role cannot exceed 100 characters"],
        },
        source: {
            type: String,
            enum: ["LinkedIn", "Naukri", "Wellfound", "Other"],
            required: [true, "Source is required"],
        },
        jobLink: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ["Applied", "Interview", "Offer", "Rejected"],
            default: "Applied",
        },
        appliedAt: {
            type: Date,
            default: Date.now,
        },
        followUpSent: {
            type: Boolean,
            default: false,
        },
        notes: {
            type: String,
            maxlength: [1000, "Notes cannot exceed 1000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
jobSchema.index({ userId: 1, status: 1 });
jobSchema.index({ userId: 1, source: 1 });
jobSchema.index({ userId: 1, company: 1 });

const Job = mongoose.model<IJobDocument>("Job", jobSchema);

export default Job;