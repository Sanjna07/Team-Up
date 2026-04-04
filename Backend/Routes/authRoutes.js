const express = require("express");
const router = express.Router();
const { register , login, getProfile, updateProfile, deleteProfile, getAllUsers, sendFriendRequest, acceptFriendRequest, declineFriendRequest, getFriends } = require("../Controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.delete("/profile", authMiddleware, deleteProfile);
router.get("/users", getAllUsers);
router.post("/friend-request", sendFriendRequest);
router.post("/friend-request/accept", acceptFriendRequest);
router.post("/friend-request/decline", declineFriendRequest);
router.get("/friends/:userId", getFriends);

module.exports = router;