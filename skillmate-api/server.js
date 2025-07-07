require("dotenv").config(); // ✅ Load .env before anything else

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const { Server } = require("socket.io");
const fetch = require("node-fetch");
const clientPromise = require("./lib/mongodb");

console.log("📦 MONGODB_URI from env:", process.env.MONGODB_URI);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// ------------------ Memory Fallback (dev only) ------------------
let messages = [];        // Only used if DB fails
let feedbackList = [];    // Temporary feedback storage
let notifications = [];   // Temporary notification storage
let onlineUsers = {};     // { username: socketId }

// ------------------ WebSocket: Private Chat ------------------
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("register", (username) => {
    onlineUsers[username] = socket.id;
    console.log(`✅ ${username} registered with socket ID ${socket.id}`);
  });

  socket.on("private_message", async ({ from, to, content }) => {
    const message = {
      from,
      to,
      content,
      timestamp: new Date().toISOString(),
    };

    // Save message to DB
    try {
      const client = await clientPromise;
      const db = client.db(); // default DB
      await db.collection("messages").insertOne(message);
      console.log("💾 Message saved to DB");
    } catch (err) {
      console.error("❌ MongoDB error - message fallback to memory:", err);
      messages.push(message);
    }

    // Send message to recipient if online
    if (onlineUsers[to]) {
      io.to(onlineUsers[to]).emit("private_message", message);
    }

    // Send notification
    try {
      await fetch("http://localhost:4000/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user: to, message: `New message from ${from}` }),
      });
      console.log("🔔 Notification API sent");
    } catch (err) {
      console.error("❌ Notification API failed:", err);
    }
  });

  socket.on("disconnect", () => {
    for (const user in onlineUsers) {
      if (onlineUsers[user] === socket.id) {
        delete onlineUsers[user];
      }
    }
    console.log("🔴 Socket disconnected:", socket.id);
  });
});

// ------------------ REST APIs ------------------

// GET: all feedback
app.get("/api/feedback", (req, res) => {
  res.json({ feedback: feedbackList });
});

// POST: add feedback
app.post("/api/feedback", (req, res) => {
  const { user, message } = req.body;
  if (!user || !message) {
    return res.status(400).json({ error: "User and message are required." });
  }

  const feedback = { user, message, timestamp: new Date().toISOString() };
  feedbackList.push(feedback);
  res.status(201).json({ success: true, feedback });
});

// POST: notify a user
app.post("/api/notify", (req, res) => {
  const { user, message } = req.body;
  if (!user || !message) {
    return res.status(400).json({ error: "User and message are required." });
  }

  const notification = {
    user: user.toUpperCase(),
    message,
    timestamp: new Date().toISOString(),
  };

  notifications.push(notification);
  res.status(201).json({ success: true, notification });
});

// GET: get notifications for a user
app.get("/api/notifications", (req, res) => {
  const user = req.query.user;
  if (!user) {
    return res.status(400).json({ error: "User query param is required." });
  }

  const userNotifications = notifications.filter(
    (n) => n.user === user.toUpperCase()
  );

  res.json({ notifications: userNotifications });
});

// Health check
app.get("/", (req, res) => {
  res.send("✅ Skillmate API is running");
});

// ------------------ Start Server ------------------
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
app.post("/api/messages/read", async (req, res) => {
  const { from, to } = req.body;
  try {
    const client = await clientPromise;
    const db = client.db();
    await db.collection("messages").updateMany(
      { from, to, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error marking read:", err);
    res.status(500).json({ error: "Failed to update messages" });
  }
});

// GET: unread count for a user
app.get("/api/unread", async (req, res) => {
  const { user } = req.query;
  if (!user) return res.status(400).json({ error: "User is required" });

  try {
    const client = await clientPromise;
    const db = client.db();

    const pipeline = [
      { $match: { to: user, read: false } },
      { $group: { _id: "$from", count: { $sum: 1 } } }
    ];

    const unreadCounts = await db.collection("messages").aggregate(pipeline).toArray();

    res.json({ unread: unreadCounts });
  } catch (err) {
    console.error("❌ Unread fetch error:", err);
    res.status(500).json({ error: "Failed to fetch unread counts" });
  }
});
