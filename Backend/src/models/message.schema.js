import mongoose from "mongoose";
import crypto from "crypto";

const msgSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "payment","document"],
      default: "text",
    },
    message: {
      type: String,
      default: "", // iv:encryptedData
    },
    files: [
      {
        url: String,       // Cloudinary URL
        public_id: String, // Cloudinary public_id
        type: { type: String }, // image, video, audio, document
      },
    ],
    payment: {
      amount: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
      status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
      },
      transactionId: { type: String },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ], // For soft delete
  },
  { timestamps: true }
);

// 32-byte key generate
function getKey() {
  return crypto
    .createHash("sha256")
    .update(String(process.env.SECRET_KEY || "default_secret"))
    .digest()
    .subarray(0, 32);
}

// Encrypt
msgSchema.statics.encryptData = function (text) {
  if (!text) return "";
  const algorithm = "aes-256-cbc";
  const key = getKey();
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  return iv.toString("hex") + ":" + encrypted;
};

// Decrypt
msgSchema.statics.decryptData = function (encryptedText) {
  if (!encryptedText || !encryptedText.includes(":")) return encryptedText;
  const [ivHex, encrypted] = encryptedText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const key = getKey();

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

// 🔹 Encrypt before save (only text messages)
msgSchema.pre("save", function (next) {
  if (this.message && !this.message.includes(":") && this.messageType === "text") {
    this.message = mongoose.models.Message.encryptData(this.message);
  }
  next();
});

// 🔹 Decrypt after fetch automatically
msgSchema.methods.getDecryptedMessage = function () {
  if (this.messageType === "text") {
    return mongoose.models.Message.decryptData(this.message);
  }
  return this.message;
};

// 🔹 Static helper to decrypt multiple messages
msgSchema.statics.decryptMessages = function (messages) {
  return messages.map((msg) => {
    const obj = msg.toObject();
    if (obj.messageType === "text") {
      obj.message = mongoose.models.Message.decryptData(obj.message);
    }
    return obj;
  });
};

const Message = mongoose.model("Message", msgSchema);
export default Message;
