const express = require("express");
const router = express.Router();
const { createRoom, getRooms, getRoomById, leaveRoom, joinRoom } = require("../controllers/roomController");

router.post("/", createRoom);
router.get("/", getRooms);
router.post("/leave", leaveRoom);
router.post("/join", joinRoom);
router.get("/:id", getRoomById);

module.exports = router;
