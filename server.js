const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());

/* 🔥 MongoDB Connection */
mongoose.connect("mongodb+srv://Senorita:hritik@cluster0.cexezgl.mongodb.net/chatapp?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB Connected 🔥"))
  .catch(err => console.log("DB ERROR:", err.message));

/* 🔥 Message Schema */
const messageSchema = new mongoose.Schema({
  username: String,
  group: String,
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model("Message", messageSchema);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  }
});
let onlineUsers = {};
app.get("/", (req, res) => {
  res.send("Server running 🚀");
});

io.on("connection", (socket) => {

  console.log("User connected:", socket.id);

  socket.on("joinGroup", async ({ username, group }) => {

  socket.join(group);
  console.log(`${username} joined ${group}`);

  // 🟢 Add user to online list
  onlineUsers[socket.id] = { username, group };

  // 🟢 Send updated online users list
  const groupUsers = Object.values(onlineUsers)
    .filter(user => user.group === group)
    .map(user => user.username);
    // 🔵 Typing event
    socket.on("typing", ({ username, group }) => {
    socket.to(group).emit("typing", username);
    });

// 🔴 Stop typing
    socket.on("stopTyping", ({ group }) => {
    socket.to(group).emit("stopTyping");
    });
    io.to(group).emit("onlineUsers", groupUsers);

  // 🔥 Load previous messages
  const messages = await Message.find({ group }).sort({ createdAt: 1 });
  socket.emit("previousMessages", messages);

  socket.to(group).emit("message", {
    username: "System",
    text: `${username} joined the chat`
  });
});

  socket.on("sendMessage", async ({ username, group, text }) => {

    const newMessage = new Message({
      username,
      group,
      text
    });

    await newMessage.save();

    io.to(group).emit("message", { username, text });
  });

  socket.on("disconnect", () => {

  const user = onlineUsers[socket.id];

  if (user) {
    const group = user.group;

    delete onlineUsers[socket.id];

    const groupUsers = Object.values(onlineUsers)
      .filter(u => u.group === group)
      .map(u => u.username);

    io.to(group).emit("onlineUsers", groupUsers);
  }

  console.log("User disconnected:", socket.id);
  });

});
app.get("/clear-chat", async (req, res) => {
  await Message.deleteMany({});
  res.send("All chats cleared 🔥");
});
app.get("/clear-chat", async (req, res) => {
  try {
    await Message.deleteMany({});
    res.send("All chats cleared 🔥");
  } catch (err) {
    res.send("Error: " + err.message);
  }
});
server.listen(8000, "0.0.0.0", () => {
  console.log("Server running on port 8000");
});