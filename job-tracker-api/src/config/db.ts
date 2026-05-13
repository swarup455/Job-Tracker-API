import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
    try {
        const mongoURI = process.env.MONGO_URI as string;

        if (!mongoURI) {
            throw new Error("MONGO_URI is not defined in .env file");
        }

        await mongoose.connect(mongoURI);
        console.log("MongoDB connected successfully");

    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
};