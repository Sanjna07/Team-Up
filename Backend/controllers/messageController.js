const Message = require("../models/Message");

exports.saveMessage = async (data) => {
  try {
    const { sender, content, room, receiver, type } = data;
    const newMessage = new Message({
      sender: sender._id || sender,
      content,
      room: (type === "community" && room !== 'general') ? room : null,
      receiver: type === "personal" ? receiver : null,
      type
    });
    return await newMessage.save();
  } catch (err) {
    console.error("Error saving message:", err);
    return null;
  }
};

exports.getCommunityMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    // If roomId is 'general', find messages with room: null
    const query = roomId === 'general' ? { room: null, type: "community" } : { room: roomId, type: "community" };
    const messages = await Message.find(query)
      .populate("sender", "name profileImage")
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPersonalMessages = async (req, res) => {
  try {
    const { userId, otherId } = req.params;
    const messages = await Message.find({
      type: "personal",
      $or: [
        { sender: userId, receiver: otherId },
        { sender: otherId, receiver: userId }
      ]
    })
    .populate("sender", "name profileImage")
    .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
