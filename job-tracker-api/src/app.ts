import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
import aiRoutes from "./routes/aiRoutes";
import { startReminderCron } from "./jobs/reminderCron";
import "./config/redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api/v1/ai", aiRoutes);

app.get("/", (req, res) => {
    res.json({ message: "Job Tracker API is running!" });
});

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
startReminderCron();

export default app;