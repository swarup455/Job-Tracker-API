import cron from "node-cron";
import User from "../models/user.model";
import Job from "../models/job.model";
import { sendFollowUpReminderEmail } from "../services/emailService";

export const startReminderCron = () => {
    cron.schedule("0 9 * * *", async () => {
        console.log("Running follow-up reminder cron job...");

        try {
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const dueJobs = await Job.find({
                status: "Applied",
                followUpSent: false,
                appliedAt: { $lte: sevenDaysAgo },
            }).populate("userId", "name email");

            if (!dueJobs.length) {
                console.log("No reminders due today.");
                return;
            }

            const jobsByUser = new Map<string, { user: any; jobs: any[] }>();

            for (const job of dueJobs) {
                const user = job.userId as any;
                if (!user?.email) continue;

                const key = user._id.toString();
                if (!jobsByUser.has(key)) {
                    jobsByUser.set(key, { user, jobs: [] });
                }
                jobsByUser.get(key)!.jobs.push(job);
            }

            for (const { user, jobs } of jobsByUser.values()) {
                await sendFollowUpReminderEmail(
                    user.email,
                    user.name,
                    jobs.map((j) => ({
                        company: j.company,
                        role: j.role,
                        appliedAt: j.appliedAt,
                        status: j.status,
                    }))
                );

                await Job.updateMany(
                    { _id: { $in: jobs.map((j) => j._id) } },
                    { $set: { followUpSent: true } }
                );

                console.log(`Reminder sent to ${user.email} for ${jobs.length} job(s)`);
            }
        } catch (error) {
            console.error("Reminder cron job error:", error);
        }
    });
};