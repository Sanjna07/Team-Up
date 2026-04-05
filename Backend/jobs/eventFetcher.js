const cron = require("node-cron");
const Event = require("../models/Event");
const { fetchEventsFromSerper } = require("../services/serperServices");

exports.startEventFetcher = () => {
  // runs every hour (0 * * * *)
  cron.schedule("0 * * * *", async () => {
    await exports.runManualFetch();
  });
};

exports.runManualFetch = async () => {
  console.log("Fetching events via Serper...");

  try {
    const events = await fetchEventsFromSerper();

    if (events && events.length > 0) {
      for (const event of events) {
        try {
          await Event.updateOne(
            { link: event.link },
            { $set: event },
            { upsert: true }
          );
        } catch (err) {
          console.error("Error updating event:", err.message);
        }
      }
      console.log(`Successfully processed ${events.length} events ✅`);
    } else {
      console.log("No events found to update.");
    }

    // remove expired events
    await Event.deleteMany({
      registrationDeadline: { $lt: new Date() }
    });

  } catch (error) {
    console.error("Fetcher error:", error);
  }
};
