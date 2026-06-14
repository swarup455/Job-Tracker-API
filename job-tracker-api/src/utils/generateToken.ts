import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export interface TokenPayload {
    _id: string,
    name: string;
    email: string;
}

export interface GeneratedToken {
    token: string;
    expiresIn: string;
}

export const generateToken = async (
    payload: TokenPayload,
    secret: string = process.env.JWT_SECRET as string,
    options: SignOptions = {}
): Promise<GeneratedToken> => {
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    const defaultOptions: SignOptions = {
        expiresIn: "1d",
        algorithm: "HS256",
        ...options,
    };

    const token = jwt.sign(payload, secret, defaultOptions);

    return {
        token,
        expiresIn: defaultOptions.expiresIn as string,
    };
};

export const verifyToken = (
    token: string,
    secret: string = process.env.JWT_SECRET as string
): JwtPayload | string => {
    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }
    return jwt.verify(token, secret);
};