import { Response, NextFunction } from "express";
import redis from "../config/redis";
import { AuthRequest } from "../types";

export const aiRateLimiter = (
    maxRequests: number = 5,
    windowSeconds: number = 60
) => {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const identifier = req.user?._id?.toString() || req.ip;
            const key = `rate-limit:ai:${identifier}`;

            const current = await redis.incr(key);

            if (current === 1) {
                await redis.expire(key, windowSeconds);
            }

            if (current > maxRequests) {
                const ttl = await redis.ttl(key);
                return res.status(429).json({
                    success: false,
                    message: `Too many AI requests. Try again in ${ttl} seconds.`,
                });
            }

            next();
        } catch (error) {
            console.error("Rate limiter error:", error);
            next();
        }
    };
};