import config from "../config/config.js";
import userModel from "../models/user.schema.js"
import redis from "../utils/redis.service.js";
import cookies from "cookie-parser"
import nodemailer from "nodemailer"
//Register User
export const userCreate = async (req, res) => {
    try {
        const { username, firstName, lastName, email, phone, password } = req.body;
        if (!username || !firstName || !lastName || !email || !phone || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExist = await userModel.findOne({ email });
        if (userExist) return res.status(400).json({ message: "User already exists" });

        const hashing = await userModel.hashPassword(password);

        const user = await userModel.create({
            username,
            firstName,
            lastName,
            bio: "Write your Bio",
            email,
            phone,
            password: hashing,
            profileImage: req.file?.path || ""  // Cloudinary returns .path
        });

        if (!user) return res.status(400).json({ error: "User creation failed" });

        const userData = user.toObject();
        delete userData.password;

        res.status(201).json({ message: "User registered successfully", user: userData });
    } catch (error) {
        console.error("Register route error:", error);
        res.status(500).send("Server is not responding");
    }
};
//Login User
export const userLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // Validate input
        if (!identifier || !password) {
            return res.status(400).json({ message: "Username/Email and Password required" });
        }

        // Find user by username OR email
        const user = await userModel.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        // If user not found
        if (!user) {
            return res.status(404).json({ message: "User does not exist." });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid password." });
        }
        const token = user.generateToken();
        res.cookie("token", token);

        delete user._doc.password;

        res.status(200).json({ success: true, message: "Login successful", user, token });

    } catch (error) {
        console.error("Register route error:", error); // full error terminal me dikhega
        res.status(500).json({ message: error.message || "Server error" });
    }

};

//Logout User
export const userLogout = async (req, res) => {
    try {
        const { token, exp } = req.tokenData;
        const timeRemainingForToken = exp * 1000 - Date.now();
        const expiresInSeconds = Math.max(1, Math.floor(timeRemainingForToken / 1000));
        await redis.set(`blacklist:${token}`, true, "EX", expiresInSeconds);
        res.clearCookie("token");
        return res.status(200).json({ message: "User logged out successfully" });
    } catch (error) {
        console.error("Logout error:", error.message);
        return res.status(500).json({ error: "Server error during logout" });
    }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
    try {
        const { username, email } = req.body;

        // Step 1: Validate input
        if (!username || !email) {
            return res.status(400).json({ message: "Username and Email are required." });
        }

        // Step 2: Find user
        const user = await userModel.findOne({ username, email });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Step 3: Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.resetPasswordOTP = otp;
        user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 min
        await user.save();

        // Step 4: Configure Nodemailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.EMAIL_USER,
                pass: config.EMAIL_PASS,
            },
        });

        // Step 5: Send Email
        await transporter.sendMail({
            from: config.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
        });

        // Step 6: Send success response
        res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: error.message || "Server Error" });
    }
};

// Reset Password
export const resetPassword = async (req, res) => {
    try {
        const { username, otp, newPassword } = req.body;
        const user = await userModel.findOne({ username });
        if (!user) return res.status(404).json({ message: "User is not found" })
        if (user.resetPasswordOTP !== otp) return res.status(400).json({ message: "Invalied OTP" });
        if (Date.now() > user.resetPasswordOTPExpire) return res.status(400).json({ message: "OTP Expired" });
        const isSamePassword = await user.comparePassword(newPassword);
        if (isSamePassword) return res.status(400).json({ message: "New password cannot be same as old password." });
        const hashing = await userModel.hashPassword(newPassword);
        user.password = hashing;
        user.resetPasswordOTP = undefined;
        user.resetPasswordOTPExpire = undefined;
        await user.save();
        res.json({ message: "Password reset successful" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
}

// User Profile 
export const userProfile = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id)
            .select("firstName lastName username email phone bio profileImage");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User Profile",
            user
        });
    } catch (error) {
        console.error("Profile fetch error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Update Profile & Password
export const userUpdate = async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const { oldPassword, newPassword } = req.body;

        // Update Profile Fields
        const fields = ["firstName", "lastName", "username", "email", "phone", "bio"];
        fields.forEach(field => {
            if (req.body[field] !== undefined) {
                user[field] = req.body[field];
            }
        });

        // Handle profile image
        if (req.file) {
            user.profileImage = req.file.path; // or cloudinary URL
        }

        // Handle Password Change
        if (newPassword) {
            if (!oldPassword) {
                return res.status(400).json({ message: "Old password required to change password" });
            }

            const isMatch = await user.comparePassword(oldPassword);
            if (!isMatch) {
                return res.status(400).json({ message: "Old password is incorrect" });
            }

            user.password = await userModel.hashPassword(newPassword);
        }

        await user.save();

        res.status(200).json({
            message: "Profile updated successfully",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                username: user.username,
                email: user.email,
                phone: user.phone,
                bio: user.bio,
                profileImage: user.profileImage
            }
        });

    } catch (error) {
        console.error("Update error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// All User
export const allUser = async (req, res) => {
    try {
        const users = await userModel.find().select("-password");
        if (!users) return res.status(404).json({ message: "Users not found" })
        return res.status(200).json({ success: true, count: users.length, users, });
    } catch (error) {
        console.error("All User Fetch Error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message,
        });
    }
}