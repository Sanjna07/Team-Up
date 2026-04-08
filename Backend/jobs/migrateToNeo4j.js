require("dotenv").config();
const mongoose = require("mongoose");
const { initNeo4j, closeNeo4j } = require("../config/neo4j");
const { syncUser, syncRoom, syncRoomJoin, syncFriendship } = require("../services/syncService");
const User = require("../models/User");
const Room = require("../models/Room");

const runMigration = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected. Initializing Neo4j...");
    await initNeo4j();
    
    console.log("Fetching all Users from MongoDB...");
    const users = await User.find({});
    console.log(`Found ${users.length} users. Syncing...`);
    
    // Sync Users (which also generates the Gemini embedding)
    for (const user of users) {
      process.stdout.write(`Syncing user ${user.name}... `);
      await syncUser(user);
    }
    
    console.log("\nSyncing Friendships...");
    for (const user of users) {
      if (user.friends && user.friends.length > 0) {
        for (const friendId of user.friends) {
          // This creates undirected relationships, so it works perfectly.
          await syncFriendship(user._id, friendId);
        }
      }
    }
    
    console.log("\nFetching all Rooms from MongoDB...");
    const rooms = await Room.find({});
    console.log(`Found ${rooms.length} rooms. Syncing...`);
    
    for (const room of rooms) {
      process.stdout.write(`Syncing room ${room.name}... `);
      await syncRoom(room);
      
      // Sync members
      if (room.members && room.members.length > 0) {
        for (const memberId of room.members) {
          await syncRoomJoin(memberId, room._id);
        }
      }
    }
    
    console.log("\nMigration completed successfully!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    await closeNeo4j();
    process.exit(0);
  }
};

runMigration();
