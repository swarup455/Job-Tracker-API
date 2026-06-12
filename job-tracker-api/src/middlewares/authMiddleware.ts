import { Response, NextFunction } from "express";
import { AuthRequest, AuthPayload } from "../types";
import jwt from "jsonwebtoken";

export const protect = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        const token = req.cookies?.token;

        if (!token) {
            res.status(401).json({
                status: 401,
                message: "Unauthorized access!!"
            });
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;

        if (!decoded) {
            res.status(401).json({
                status: 401,
                message: "Invalid token!!"
            });
            return;
        }

        req.user = decoded;
        next();

    } catch (error) {
        console.error(error);
        res.status(401).json({
            status: 401,
            message: "Invalid or expired token!!"
        });
    }
}