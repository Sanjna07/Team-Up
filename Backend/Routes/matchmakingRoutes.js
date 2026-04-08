const express = require("express");
const router = express.Router();
const { getRecommendations } = require("../controllers/matchmakingController");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/matchmaking?domains=WebDev,AI&skills=React,Node
router.get("/", authMiddleware, getRecommendations);

module.exports = router;
