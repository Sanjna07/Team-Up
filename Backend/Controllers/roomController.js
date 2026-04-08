const Room = require("../models/Room");
const { syncRoom, syncRoomJoin } = require("../services/syncService");

exports.createRoom = async (req, res) => {
  try {
    const { name, domain, createdBy, inviteLink, members } = req.body;

    const newRoom = new Room({
      name,
      membersCount: members ? members.length + 1 : 1, // +1 for the creator
      domain,
      createdBy,
      inviteLink,
      members: members ? [...members, createdBy] : [createdBy],
    });

    const savedRoom = await newRoom.save();
    
    // Sync to Neo4j
    await syncRoom(savedRoom);
    // Sync the creator joining the room
    await syncRoomJoin(createdBy, savedRoom._id);
    if (members && members.length > 0) {
      for (const mId of members) {
        await syncRoomJoin(mId, savedRoom._id);
      }
    }

    res.status(201).json(savedRoom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRooms = async (req, res) => {
  try {
    const rooms = await Room.find().populate("createdBy", "name profileImage");
    res.status(200).json(rooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate("createdBy", "name profileImage")
      .populate("members", "name profileImage personality");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.status(200).json(room);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.leaveRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Remove user from members array
    room.members = room.members.filter(id => id.toString() !== userId);
    room.membersCount = room.members.length;

    await room.save();
    res.status(200).json({ message: "Left room successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinRoom = async (req, res) => {
  try {
    const { roomId, userId } = req.body;
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Check if user is already a member
    if (room.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    room.members.push(userId);
    room.membersCount = room.members.length;

    await room.save();
    
    // Sync to Neo4j
    await syncRoomJoin(userId, roomId);

    res.status(200).json({ message: "Joined room successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
