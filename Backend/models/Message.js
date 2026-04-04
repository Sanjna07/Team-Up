const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" }, // Optional for private chat
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Optional for community chat
  type: { type: String, enum: ["community", "personal"], required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Message", MessageSchema);
