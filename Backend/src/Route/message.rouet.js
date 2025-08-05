import express from "express";
import {
    getConversation,
    deleteMessageForMe,
    deleteMessageForEveryone,
    clearChat,
    editMessage,
    sendMessage,
} from "../controllers/message.controller.js";
import { Isauth } from "../utils/authentication.js";
import { uploadChatFiles } from "../utils/imageUpload.js";

const router = express.Router();

router.get("/conversation/:senderId/:receiverId", Isauth, getConversation);
router.post("/upload/files", Isauth, uploadChatFiles.array("files", 10), sendMessage)
router.delete("/delete/me/:messageId", Isauth, deleteMessageForMe);
router.delete("/delete/everyone/:messageId", Isauth, deleteMessageForEveryone);
router.delete("/clear/:otherUserId", Isauth, clearChat);
router.put("/edit/message/:id", Isauth, editMessage);

export default router;
