const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  linkedIn: { type: String, required: true },
  github: { type: String, required: true },
  skills: { type: [String], default: [] },
  domains: { type: [String], default: [] },
  personality: {
    label: { type: String, default: null },
    vector: {
      energy: Number,
      planning: Number,
      collaboration: Number
    }
  },
  reputation: {
    completedProjects: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);