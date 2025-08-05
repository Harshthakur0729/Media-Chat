import express from "express";
import { allUser, forgotPassword, resetPassword, userCreate, userLogin, userLogout, userProfile, userUpdate } from "../controllers/user.controller.js";
import { Isauth } from "../utils/authentication.js";
import { upload } from "../utils/imageUpload.js";
const router = express.Router();
router.route("/user/register").post(upload.single("profileImage"), userCreate);
router.route("/user/login").post(userLogin);
router.route("/user/logout").post(Isauth, userLogout);
router.route("/user/forgot-password").post(forgotPassword);
router.route("/user/reset-password").post(resetPassword);
router.route("/user/all/users").get(allUser)
router.route("/user/profile").get(Isauth, userProfile);
router.route("/user/update/profile").put(upload.single("profileImage"), Isauth, userUpdate);


export default router;
