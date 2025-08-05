import jwt from "jsonwebtoken"
import userModel from "../models/user.schema.js"
import config from "../config/config.js"
import redis from "./redis.service.js"
export const Isauth = async (req, res, next) => {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ error: "Unauthorized access, please login first" });
        }
        const isTokenBlackListed = await redis.get(`blacklist:${token}`);
        if (isTokenBlackListed) {
            return res.status(401).json({ error: "Token is blacklisted. Please login again." });
        }
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (!decoded || !decoded._id) {
            return res.status(401).json({ error: "Invalid token, please login again" });
        }
        let userData = await redis.get(`user:${decoded._id}`);
        let user;
        if (userData) {
            user = JSON.parse(userData);
        } else {
            user = await userModel.findById(decoded._id).select("-password");
            if (!user) {
                return res.status(401).json({ error: "User not found, unauthorized" });
            }
            await redis.set(`user:${decoded._id}`, JSON.stringify(user));
        }
        req.user = user;
        req.tokenData = { token, ...decoded };
        next();
    } catch (error) {
        console.error("Authentication error:", error.message);
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
