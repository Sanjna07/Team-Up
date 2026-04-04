const express = require("express");
const router = express.Router();
const { getCommunityMessages, getPersonalMessages } = require("../Controllers/messageController");

router.get("/community/:roomId", getCommunityMessages);
router.get("/personal/:userId/:otherId", getPersonalMessages);

module.exports = router;
