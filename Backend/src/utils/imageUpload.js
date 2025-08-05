import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});



//Profile Image Upload
const profileStorage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "User_Profile",
        format: file.mimetype.split("/")[1], // jpg, png, webp
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
});

export const upload = multer({
    storage: profileStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpeg, .png, .webp files allowed!"), false);
        }
        cb(null, true);
    },
});

// Chat Files Upload

const chatStorage = new CloudinaryStorage({

    cloudinary,
    params: async (req, file) => ({
        folder: "Chat_Folder",
        resource_type: "auto",
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    })
})

export const uploadChatFiles = multer({
    storage: chatStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
    fileFilter: (req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp",
            "video/mp4", "video/mkv", "video/webm",
            "audio/mpeg", "audio/mp3", "audio/wav",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error('File type not allowed!'), false)
        }
        cb(null, true)
    }

}) 