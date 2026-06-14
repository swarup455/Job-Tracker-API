import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

interface JobReminder {
    company: string;
    role: string;
    appliedAt: Date;
    status: string;
}

export const sendFollowUpReminderEmail = async (
    to: string,
    name: string,
    jobs: JobReminder[]
): Promise<void> => {
    const jobRows = jobs
        .map(
            (job) => `
        <tr>
            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; color: #1a1a1a;">${job.company}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; color: #555;">${job.role}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px; color: #555;">${new Date(job.appliedAt).toLocaleDateString()}</td>
            <td style="padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 14px;">
                <span style="background: #f0f0f0; color: #333; padding: 4px 10px; border-radius: 12px; font-size: 12px;">${job.status}</span>
            </td>
        </tr>`
        )
        .join("");

    const html = `
    <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; padding: 32px;">
        <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 8px;">Time for a follow-up, ${name} 👋</h2>
        <p style="color: #666; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
            It's been 7 days since you applied to these roles. A quick follow-up email can keep you on the recruiter's radar.
        </p>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
            <thead>
                <tr style="background: #fafafa;">
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase;">Company</th>
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase;">Role</th>
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase;">Applied On</th>
                    <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #999; text-transform: uppercase;">Status</th>
                </tr>
            </thead>
            <tbody>
                ${jobRows}
            </tbody>
        </table>
        <p style="color: #999; font-size: 12px; margin-top: 24px; text-align: center;">
            Sent by Job Application Tracker
        </p>
    </div>`;

    await transporter.sendMail({
        from: `"Job Tracker Reminders" <${process.env.EMAIL_USER}>`,
        to,
        subject: "📌 Follow-up reminder — 7 days since your application",
        html,
    });
};