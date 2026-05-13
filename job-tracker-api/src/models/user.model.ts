import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
    name: string;
    email: string;
    password: string;
    resume: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument>(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name cannot exceed 50 characters"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"],
            select: false,
        },
        resume: {
            type: String,
            default: "",
            maxlength: [10000, "Resume text cannot exceed 10000 characters"],
        },
    },
    {
        timestamps: true,
    }
);

// Hash password before saving
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare passwords
userSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
};

// Strip sensitive fields from responses
userSchema.set("toJSON", {
    transform: (_doc, ret) => {
        const { password, __v, ...rest } = ret;
        return rest;
    },
});

const User = mongoose.model<IUserDocument>("User", userSchema);

export default User;