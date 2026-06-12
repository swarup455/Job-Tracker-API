import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import jobRoutes from "./routes/jobRoutes";
// import aiRoutes from "./routes/ai.routes";
// import { errorMiddleware } from "./middlewares/error.middleware";
import "./config/redis";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// all routes are written here
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
// app.use("/api/ai", aiRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({ message: "Job Tracker API is running!" });
});

// Error middleware (always last)
// app.use(errorMiddleware);

// Start server
const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();

export default app;