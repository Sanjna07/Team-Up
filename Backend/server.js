const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust this in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/rooms", require("./routes/roomRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/matchmaking", require("./routes/matchmakingRoutes"));

const { startEventFetcher, runManualFetch } = require("./jobs/eventFetcher");
// start 24h cron job
startEventFetcher();

// Run an initial fetch if the database is empty or on startup to populate immediately
runManualFetch();



const { saveMessage } = require("./controllers/messageController");

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on("send_message", async (data) => {
    console.log("Message received:", data);
    const { room, sender, content, receiver, type } = data;

    // Save message to database
    const savedMsg = await saveMessage(data);
    const broadcastData = savedMsg ? {
      ...data,
      _id: savedMsg._id,
      createdAt: savedMsg.createdAt
    } : data;

    if (type === "community") {
      io.to(room).emit("receive_message", broadcastData);
    } else if (type === "personal") {
      // Send to both sender and receiver to keep them in sync
      io.to(receiver).emit("receive_message", broadcastData);
      io.to(sender._id || sender).emit("receive_message", broadcastData);
    }

    // Handle notifications
    if (receiver) {
      io.to(receiver).emit("notification", {
        from: sender,
        content: `New ${type} message from ${sender.name}`,
        type,
        roomId: type === "community" ? room : null,
        senderId: type === "personal" ? (sender._id || sender) : null
      });
    }
  });

  socket.on("send_friend_request", (data) => {
    const { fromUser, toId } = data;
    io.to(toId).emit("notification", {
      from: fromUser,
      content: `${fromUser.name} sent you a friend request!`,
      type: "friend_request",
      fromId: fromUser._id
    });
  });

  socket.on("accept_friend_request", (data) => {
    const { fromId, toUser } = data;
    io.to(fromId).emit("notification", {
      from: toUser,
      content: `${toUser.name} accepted your friend request!`,
      type: "friend_accepted"
    });
    // Also notify to refresh friends list
    io.to(fromId).emit("refresh_friends");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const { initNeo4j } = require("./config/neo4j");

// Connect DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    initNeo4j(); // Initialize Neo4j after MongoDB
  })
  .catch((err) => console.log(err));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
