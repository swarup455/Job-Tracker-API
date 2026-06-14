import User from "../models/user.model";
import { Response } from "express";
import { AuthRequest, LoginUserBody, RegisterUserBody, ResetPasswordBody, UpdateUserBody } from "../types";
import { generateToken, TokenPayload } from "../utils/generateToken";
import redis from "../config/redis";

export const registerUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { fullName, email, password } = req.body as RegisterUserBody;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(409)
                .json(
                    {
                        status: 409,
                        message: "User with this email already exists!"
                    }
                )
        }
        const user = await User.create({
            name: fullName,
            email,
            password,
        });
        const newUser = await User.findById(user._id).select("-password");

        return res
            .status(201)
            .json(
                {
                    status: 201,
                    data: newUser,
                    message: "User created successfully!!"
                }
            )
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const loginUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { email, password } = req.body as LoginUserBody;

        if (!email || !password) {
            return res
                .status(400)
                .json(
                    {
                        status: 400,
                        message: "All fields are required!"
                    }
                )
        }

        const key = `login_attempts:${email}`;
        const attempts = await redis.incr(key);

        if (attempts === 1) {
            await redis.expire(key, 15 * 60);
        }

        if (attempts > 5) {
            const ttl = await redis.ttl(key);
            return res.status(429).json({
                status: 429,
                message: `Too many login attempts!! Try again in ${Math.ceil(ttl / 60)} minutes.`
            });
        }

        const user = await User.findOne({ email }).select("+password");;
        if (!user) {
            return res
                .status(404)
                .json(
                    {
                        status: 404,
                        message: "User not found!"
                    }
                )
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: 401, message: "Invalid credentials!" });
        }
        const payload: TokenPayload = {
            name: user?.name,
            email: user?.email
        }
        const { token, expiresIn } = await generateToken(payload);
        const safeUser = await User.findById(user._id).select("-password");

        return res
            .status(200)
            .cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 1 * 24 * 60 * 60 * 1000
            })
            .json(
                {
                    status: 200,
                    data: { user: safeUser, expiresIn },
                    message: "User logged in successfully!"
                }
            )
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const getUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;

        if (!user) {
            return res
                .status(404)
                .json(
                    {
                        status: 404,
                        data: user,
                        message: "User not found!"
                    }
                )
        }
        return res
            .status(200)
            .json(
                {
                    status: 200,
                    data: user,
                    message: "User fetched successfully!"
                }
            )
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const resetPassword = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;
        const { currentPassword, newPassword } = req?.body as ResetPasswordBody;
        if (!user) {
            return res
                .status(401)
                .json({
                    status: 401,
                    message: "Unauthorized access!!"
                })
        }
        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({
                    status: 400,
                    message: "All fields are required!!"
                })
        }
        const currentUser = await User.findById(user?._id).select("+password");;
        if (!currentUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found!!"
            });
        }
        const isPasswordValid = await currentUser.comparePassword(currentPassword);

        if (!isPasswordValid) {
            return res
                .status(404)
                .json({
                    status: 404,
                    message: "Invalid password!!"
                })
        }
        currentUser.password = newPassword;
        await currentUser.save();

        return res.status(200).json({
            status: 200,
            message: "Password reset successfully!!"
        });

    } catch (error) {
        console.error(error);
        return res
            .status(500)
            .json(
                {
                    success: false,
                    message: "Internal Server Error"
                }
            );
    }
}

export const updateUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized access!!"
            });
        }

        const { name, resume } = req.body as UpdateUserBody;

        if (!name && !resume) {
            return res.status(400).json({
                status: 400,
                message: "At least one field is required to update!!"
            });
        }

        const updatedUser = await User.findByIdAndUpdate(
            user?._id,
            { ...(name && { name }), ...(resume && { resume }) },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found!!"
            });
        }

        return res.status(200).json({
            status: 200,
            data: updatedUser,
            message: "User updated successfully!!"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const deleteAccount = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user;

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "Unauthorized access!!"
            });
        }

        const { password } = req.body as { password: string };

        if (!password) {
            return res.status(400).json({
                status: 400,
                message: "Password is required!!"
            });
        }

        const currentUser = await User.findById(user?._id).select("+password");

        if (!currentUser) {
            return res.status(404).json({
                status: 404,
                message: "User not found!!"
            });
        }

        const isPasswordValid = await currentUser.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                status: 401,
                message: "Invalid password!!"
            });
        }

        await User.findByIdAndDelete(user?._id);

        return res
            .status(200)
            .clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
            .json({
                status: 200,
                message: "Account deleted successfully!!"
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const logoutUser = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        return res
            .status(200)
            .clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            })
            .json({
                status: 200,
                message: "User logged out successfully!!"
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}