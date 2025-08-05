import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
const userSchema = new mongoose.Schema(
    {

        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [30, "Username must be at most 30 characters"], // 🔼 Changed from 16 to 30
        },
        firstName: {
            type: String,
            required: [true, "First name is required"],
            trim: true,
            maxlength: 50,
        },

        lastName: {
            type: String,
            required: [true, "Last name is required"],
            trim: true,
            maxlength: 50,
        },
        bio: {
            type: String,
            default: "Write your Bio"
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                "Please enter a valid email",
            ],
        },
        phone: {
            type: String,
            select: false,
            trim: true,
            match: [/^[0-9]{10}$/, "Phone number must be 10 digits"]
        },
        profileImage: {
            type: String,
            default: "./user_image.png"
        },
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        resetPasswordOTP: String,
        resetPasswordOTPExpire: Date,

    }, { timestamps: true, }
)


//Password hashing

userSchema.statics.hashPassword = async function (password) {
    if (!password) throw new Error("Password is required");
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}




//Password Compare 
userSchema.methods.comparePassword = async function (password) {
    if (!password) throw new Error("Password is required");
    return await bcrypt.compare(password, this.password)
}



// Genrate Token 
userSchema.methods.generateToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
        },
        config.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const User = mongoose.model("User", userSchema);
export default User;
