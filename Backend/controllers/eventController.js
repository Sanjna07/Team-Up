const Event = require("../models/Event");

exports.getUpcomingEvents = async (req, res) => {
  try {
    const events = await Event.find({
      $or: [
        { registrationDeadline: { $gte: new Date() } },
        { registrationDeadline: null }
      ]
    })
      .sort({ registrationDeadline: 1 })
      .limit(100);

    res.json({
      success: true,
      data: events
    });

  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ success: false });
  }
};
