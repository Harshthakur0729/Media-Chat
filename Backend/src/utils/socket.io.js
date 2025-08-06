import { Server } from "socket.io";
import Message from "../models/message.schema.js";

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.ORIGIN || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  let onlineUser = new Map(); // userId -> socketId

  const broadcastOnlineUsers = () => {
    io.emit("onlineUsers", Array.from(onlineUser.keys()));
  };

  io.on("connection", (socket) => {
    console.log("✅ New client connected:", socket.id);

    // User joins
    socket.on("join", (userId) => {
      onlineUser.set(userId, socket.id);
      broadcastOnlineUsers();
      io.emit("userOnline", userId);
    });

    // Send message
    socket.on("sendMessage", async (msgData) => {
      const { sender, receiver, messageType = "text", message = "", files = [], tempId } = msgData;

      // 1️⃣ Optimistic Emit to Sender (instant UI update)
      const tempMessage = {
        tempId: tempId || Date.now(),
        sender,
        receiver,
        messageType,
        message,
        files,
        createdAt: new Date(),
        isTemp: true,
      };
      socket.emit("receiverMessage", tempMessage); // sender UI instant update

      try {
        // 2️⃣ Save to DB
        const newMessage = new Message({ sender, receiver, messageType, message, files });
        const savedMessage = await newMessage.save();
        const decryptedMessage = Message.decryptData(savedMessage.message);

        const messageToSend = {
          _id: savedMessage._id,
          sender,
          receiver,
          messageType,
          message: decryptedMessage,
          files: savedMessage.files || [],
          createdAt: savedMessage.createdAt,
          isTemp: false,
          tempId: tempMessage.tempId,
        };

        // 3️⃣ Send to receiver
        const receiverSocket = onlineUser.get(receiver.toString());
        if (receiverSocket) {
          io.to(receiverSocket).emit("receiverMessage", messageToSend);
        }

        // 4️⃣ Update sender with real ID
        socket.emit("messageSent", { status: "success", message: messageToSend });
      } catch (error) {
        console.error("❌ Error saving message:", error);
        socket.emit("messageError", { error: "Failed to send message" });
      }
    });



    // 🟢 Real-time Edit
    socket.on("editMessage", async ({ msgId, message }) => {
      try {
        const updatedMsg = await Message.findByIdAndUpdate(
          msgId,
          { message, isEdited: true },
          { new: true }
        );

        if (!updatedMsg) return;

        const decryptedMsg = Message.decryptData(updatedMsg.message);
        const messageToSend = {
          ...updatedMsg.toObject(),
          message: decryptedMsg,
        };

        // ✅ Send to receiver realtime
        const receiverSocket = onlineUser.get(updatedMsg.receiver.toString());
        if (receiverSocket) {
          io.to(receiverSocket).emit("messageEdited", messageToSend);
        }

        // ✅ Also notify sender (for UI sync)
        socket.emit("messageEdited", messageToSend);
      } catch (error) {
        console.error("❌ Edit message error:", error);
      }
    });
    // 🟢 Real-time Delete for Everyone
    socket.on("deleteMessage", async ({ msgId }) => {
      try {
        const deletedMsg = await Message.findByIdAndDelete(msgId);
        if (!deletedMsg) return;

        const receiverSocket = onlineUser.get(deletedMsg.receiver.toString());
        if (receiverSocket) {
          io.to(receiverSocket).emit("messageDeleted", msgId);
        }

        // Ack sender
        socket.emit("messageDeleted", msgId);
      } catch (err) {
        console.log("❌ Delete error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Disconnected:", socket.id);

      let disconnectedUserId = null;
      for (const [userId, socketId] of onlineUser.entries()) {
        if (socketId === socket.id) {
          onlineUser.delete(userId);
          disconnectedUserId = userId;
          break;
        }
      }

      if (disconnectedUserId) {
        broadcastOnlineUsers();
        io.emit("userOffline", disconnectedUserId);
      }
    });
  });
}

export default initSocket;
