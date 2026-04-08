const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, linkedIn, github, skills, domains } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      linkedIn,
      github,
      skills,
      domains
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d"
    });

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        domains: user.domains,
        linkedIn: user.linkedIn,
        github: user.github,
        profileImage: user.profileImage,
        personality: user.personality
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.sendFriendRequest = async (req, res) => {
  try {
    const { fromId, toId } = req.body;
    const toUser = await User.findById(toId);
    if (!toUser) return res.status(404).json({ message: "User not found" });

    // Check if request already exists
    const exists = toUser.friendRequests.find(req => req.from.toString() === fromId);
    if (exists) return res.status(400).json({ message: "Request already sent" });

    toUser.friendRequests.push({ from: fromId, status: "pending" });
    await toUser.save();

    res.status(200).json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.acceptFriendRequest = async (req, res) => {
  try {
    const { userId, fromId } = req.body;
    const user = await User.findById(userId);
    const fromUser = await User.findById(fromId);

    if (!user || !fromUser) return res.status(404).json({ message: "User not found" });

    // Update request status
    const request = user.friendRequests.find(req => req.from.toString() === fromId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.status = "accepted";

    // Add to friends list
    if (!user.friends.includes(fromId)) user.friends.push(fromId);
    if (!fromUser.friends.includes(userId)) fromUser.friends.push(userId);

    await user.save();
    await fromUser.save();

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.declineFriendRequest = async (req, res) => {
  try {
    const { userId, fromId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update request status to rejected
    const request = user.friendRequests.find(req => req.from.toString() === fromId);
    if (!request) return res.status(404).json({ message: "Request not found" });
    request.status = "rejected";

    await user.save();
    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).populate("friends", "name profileImage personality");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProfile = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "Password is required to delete account" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        personality: user.personality
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "name email profileImage personality");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, linkedIn, github, skills, domains, profileImage, personality } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.linkedIn = linkedIn || user.linkedIn;
    user.github = github || user.github;
    user.skills = skills || user.skills;
    user.domains = domains || user.domains;
    user.profileImage = profileImage || user.profileImage;
    
    if (personality?.label) {
      if (!user.personality) user.personality = {};
      user.personality.label = personality.label;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        domains: user.domains,
        linkedIn: user.linkedIn,
        github: user.github,
        profileImage: user.profileImage,
        personality: user.personality
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};