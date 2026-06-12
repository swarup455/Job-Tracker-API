import redis from "../config/redis";
import { Response } from "express";
import { AuthRequest, JobBody, UpdateJobBody } from "../types";
import Job from "../models/job.model";
import mongoose from "mongoose";

export const createJob = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { company, role, source, jobLink, status, appliedAt, followUpSent, notes } = req.body as JobBody;
        const user = req?.user;

        if (!user) {
            return res
                .status(401)
                .json(
                    {
                        status: 401,
                        message: "User not found!"
                    }
                )
        }

        if (!company || !role || !source || !status || !appliedAt) {
            return res
                .status(400)
                .json(
                    {
                        status: 400,
                        message: "All fields are required!"
                    }
                )
        }

        const createNewJob = await Job.create({
            userId: user?._id,
            company,
            role,
            source,
            jobLink,
            status,
            appliedAt,
            followUpSent,
            notes
        })

        await redis.del(`stats:${user._id}`);

        const keys = await redis.keys(`jobs:${user._id}:*`);
        if (keys.length) {
            await redis.del(...keys);
        }

        return res
            .status(201)
            .json({
                status: 201,
                data: createNewJob,
                message: "Job created successfully!"
            });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const updateJob = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { status, followUpSent, notes } = req?.body as UpdateJobBody;
        const jobId = req?.params?.id as string | undefined;
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "User not found!",
            });
        }

        if (status === undefined && followUpSent === undefined && notes === undefined) {
            return res.status(400).json({
                status: 400,
                message: "Atleast one field is required!",
            });
        }

        if (!jobId) {
            return res.status(400).json({
                status: 400,
                message: "JobId is required!",
            });
        }
        const currentJob = await Job.findOne({
            _id: jobId,
            userId: user._id,
        });
        if (!currentJob) {
            return res.status(404).json({
                status: 404,
                message: "Job is Invalid!!",
            });
        }

        if (status !== undefined) {
            currentJob.status = status;
        }
        if (followUpSent !== undefined) {
            currentJob.followUpSent = followUpSent;
        }
        if (notes !== undefined) {
            currentJob.notes = notes;
        }

        await currentJob.save();

        await redis.del(`stats:${user._id}`);
        await redis.del(`job:${user._id}:${jobId}`);

        const keys = await redis.keys(`jobs:${user._id}:*`);
        if (keys.length) {
            await redis.del(...keys);
        }

        return res.status(200).json({
            status: 200,
            data: currentJob,
            message: "Job is updated!!"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const deleteJob = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const jobId = req?.params?.id as string | undefined;
        const user = req?.user

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "User not found!",
            });
        }

        if (!jobId) {
            return res.status(400).json({
                status: 400,
                message: "JobId is required!",
            });
        }

        const deletedJob = await Job.findOneAndDelete({
            _id: jobId,
            userId: user._id,
        });

        if (!deletedJob) {
            return res.status(404).json({
                status: 404,
                message: "Job not found!",
            });
        }

        await redis.del(`stats:${user._id}`);
        await redis.del(`job:${user._id}:${jobId}`);

        const keys = await redis.keys(`jobs:${user._id}:*`);
        if (keys.length) {
            await redis.del(...keys);
        }

        return res.status(200).json({
            status: 200,
            message: "Job deleted successfully!",
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

//I will use redis on below controllers to improve performance

export const getJobs = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "User not found!",
            });
        }

        const {
            search,
            status,
            source,
            sortBy = "createdAt",
            order = "desc",
            page = "1",
            limit = "10",
        } = req.query;

        const cacheKey = `jobs:${user._id}:${search || "all"}:${status || "all"}:${source || "all"}:${sortBy}:${order}:${page}:${limit}`;

        const query: any = {
            userId: new mongoose.Types.ObjectId(user._id),
        };

        if (search) {
            query.$or = [
                {
                    company: {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    role: {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        if (status) {
            query.status = status;
        }

        if (source) {
            query.source = source;
        }

        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        const cachedJobs = await redis.get(cacheKey);
        if (cachedJobs) {
            return res.status(200).json(
                JSON.parse(cachedJobs)
            );
        }

        const jobs = await Job.find(query)
            .sort({
                [sortBy as string]: order === "asc" ? 1 : -1,
            })
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);

        const totalJobs = await Job.countDocuments(query);

        const responseData = {
            status: 200,
            data: jobs,
            pagination: {
                total: totalJobs,
                page: pageNumber,
                limit: limitNumber,
                totalPages: Math.ceil(totalJobs / limitNumber),
            },
        };

        await redis.setex(
            cacheKey,
            300,
            JSON.stringify(responseData)
        );

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getJobById = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "User not found!",
            });
        }

        const jobId = req?.params?.id as string | undefined;

        if (!jobId) {
            return res.status(400).json({
                status: 400,
                message: "Job ID is required!",
            });
        }

        const cacheKey = `job:${user._id}:${jobId}`;
        const cacheJob = await redis.get(cacheKey);

        if (cacheJob) {
            return res
                .status(200)
                .json(
                    JSON.parse(cacheJob)
                )
        }

        const currentJob = await Job.findOne({
            _id: jobId,
            userId: user._id
        });

        if (!currentJob) {
            return res.status(404).json({
                status: 404,
                message: "Job not found!",
            });
        }

        const responseData = {
            status: 200,
            data: currentJob,
            message: `Job found for jobId: ${jobId}`,
        }

        await redis.setex(
            cacheKey,
            300,
            JSON.stringify(responseData)
        )

        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

export const getJobStats = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const user = req?.user

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "User not found!",
            });
        }

        //redis implimentation
        const cacheKey = `stats:${user._id}`;
        const cachedStats = await redis.get(cacheKey);

        if (cachedStats) {
            return res.status(200).json(
                JSON.parse(cachedStats)
            );
        }

        const jobStats = await Job.aggregate(
            [
                {
                    $match: {
                        userId: new mongoose.Types.ObjectId(user._id)
                    },

                },
                {
                    $facet: {
                        sourceStats: [
                            {
                                $group: {
                                    _id: "$source",
                                    count: { $sum: 1 }
                                }
                            }
                        ],

                        statusStats: [
                            {
                                $group: {
                                    _id: "$status",
                                    count: { $sum: 1 }
                                }
                            }
                        ],

                        totalJobs: [
                            {
                                $count: "count"
                            }
                        ]
                    }
                }
            ]
        )

        const stats = jobStats[0];
        const responseData = {
            status: 200,
            data: {
                totalJobs: stats.totalJobs[0]?.count || 0,
                sourceStats: stats.sourceStats,
                statusStats: stats.statusStats,
            },
            message: "Job stats fetched successfully!",
        };
        await redis.setex(
            cacheKey,
            300,
            JSON.stringify(responseData)
        );
        return res.status(200).json(responseData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}