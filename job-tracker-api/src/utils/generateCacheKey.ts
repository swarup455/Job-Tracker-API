export const generateCacheKey = (
    prefix: string,
    userId: string,
    ...parts: string[]
): string => {
    return `${prefix}:${userId}:${parts.join(":")}`;
};