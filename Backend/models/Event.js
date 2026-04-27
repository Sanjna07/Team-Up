const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: String,
    link: { type: String, unique: true },
    description: String,
    registrationDeadline: Date,
    source: String,
    location: { type: String, default: "Unknown" }
  },
  { timestamps: true }
);

eventSchema.index({ registrationDeadline: 1 });

module.exports = mongoose.model("Event", eventSchema);
