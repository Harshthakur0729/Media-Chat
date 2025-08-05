import Message from "../models/message.schema.js";
import { v2 as cloudinary } from "cloudinary";

export const getConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.params;

    const messages = await Message.find({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
      deletedBy: { $ne: senderId }, // Filter soft-deleted msgs for this user
    }).sort({ createdAt: 1 });

    const decryptedMsgs = Message.decryptMessages(messages);

    res.status(200).json({ messages: decryptedMsgs });
  } catch (error) {
    console.error("Conversation fetch error:", error);
    res.status(500).json({ error: "Failed to fetch conversation" });
  }
};


export const sendMessage = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const senderId = req.user._id;
    const { receiverId, message } = req.body;

    if (!receiverId) {
      return res.status(400).json({ error: "receiverId is required" });
    }

    let messageType = "text";
    let filesArray = [];

    if (req.files && req.files.length > 0) {
      filesArray = req.files.map((file) => {
        const typeCategory = file.mimetype.startsWith("image")
          ? "image"
          : file.mimetype.startsWith("video")
            ? "video"
            : file.mimetype.startsWith("audio")
              ? "audio"
              : "document";

        return {
          url: file.path, // Cloudinary URL
          public_id: file.filename || file.originalname || Date.now().toString(),
          type: typeCategory,
        };
      });

      messageType = filesArray[0].type;
    }

    // Create the message document
    const msg = await Message.create({
      sender: senderId,
      receiver: receiverId,
      messageType,
      message: message || "",
      files: filesArray,
    });

    // **Decrypt message text before sending**  
    // (Assuming you have a decrypt function like Message.decryptData)
    let decryptedMessage = msg.message;
    if (typeof Message.decryptData === "function") {
      decryptedMessage = Message.decryptData(msg.message);
    }

    // Construct a plain message object for frontend (sender and receiver)
    const messageForFrontend = {
      ...msg.toObject(),
      message: decryptedMessage,
      sender: { _id: senderId }, // populate as needed
      receiver: { _id: receiverId },
    };

    // Emit message to receiver via socket room  
    if (req.io) {
      // ✅ Emit message to receiver instantly
      req.io?.to(receiverId.toString()).emit("receiverMessage", populatedMsg);

    }

    // Respond to sender with decrypted, populated message
    return res.status(201).json({
      msg: "Message sent",
      message: messageForFrontend,
    });
  } catch (error) {
    console.error("Send message error:", error.message);
    return res.status(500).json({ error: "Failed to send message" });
  }
};






export const deleteMessageForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id; // Auth middleware se aayega

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    // Agar already deleted nahi hua to push karo
    if (!message.deletedBy.includes(userId)) {
      message.deletedBy.push(userId);
      await message.save();
    }

    res.status(200).json({ success: true, message: "Message deleted for you" });
  } catch (error) {
    console.error("Delete-for-me error:", error);
    res.status(500).json({ error: "Failed to delete message for you" });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user._id;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Only sender can delete for everyone" });
    }

    // ✅ Delete files from Cloudinary if any
    if (message.files && message.files.length > 0) {
      for (let file of message.files) {
        try {
          await cloudinary.uploader.destroy(file.public_id, {
            resource_type:
              file.type === "video"
                ? "video"
                : file.type === "audio"
                  ? "video" // audio bhi video category me aata hai
                  : "image",
          });
        } catch (err) {
          console.error("Cloudinary delete error:", err.message);
        }
      }
    }

    await message.deleteOne();

    res.status(200).json({ success: true, message: "Message deleted for everyone" });
  } catch (error) {
    console.error("Delete-for-everyone error:", error);
    res.status(500).json({ error: "Failed to delete message for everyone" });
  }
};


export const clearChat = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const userId = req.user._id;

    await Message.deleteMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    });

    res.status(200).json({ success: true, message: "Chat cleared successfully" });
  } catch (error) {
    console.error("Clear chat error:", error);
    res.status(500).json({ error: "Failed to clear chat" });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user?._id || req.userId;
    // Validation
    if (!id) return res.status(400).json({ msg: "Message ID is required" });
    if (!message) return res.status(400).json({ msg: "New message text is required" });
    if (!userId) return res.status(401).json({ msg: "User not authenticated" });

    // Check message exist
    const msg = await Message.findById(id);
    if (!msg) return res.status(404).json({ msg: "Message not found" });

    // Only sender can edit
    if (msg.sender.toString() !== userId.toString()) {
      return res.status(403).json({ msg: "Not allowed to edit this message" });
    }

    // Update message
    msg.message = message;
    msg.isEdited = true;
    await msg.save();

    return res.status(200).json({
      msg: "Message updated successfully",
      updatedMessage: msg
    });

  } catch (error) {
    console.error("Edit message error:", error.message);
    return res.status(500).json({ msg: "Server error", error: error.message });
  }
};



