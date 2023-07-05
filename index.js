//node server to handle socket.io connection
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const chats = require("./data/data");
const ConnectDB = require("./config/db");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

var corsOptions = {
  // origin: "*",
  origin: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "https://rkchatapp.netlify.app/",
  ],
  credentials: true,
};

// const io = require('socket.io')(8000)
dotenv.config();
const app = express();
const userRoutes = require("./Routes/userRoutes");
const fileRoutes = require("./Routes/fileRoutes");
const chatRoutes = require("./Routes/chatRoutes");
const messageRoutes = require("./Routes/messageRoutes");
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT, (req, res) => {
  console.log(`app is listening at port ${PORT}`);
});

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "https://rkchatapp.netlify.app/",
    ],
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
  socket.on("setup", (userData) => {
    socket.join(userData._id);
    socket.emit("connected");
  });
  socket.on("join chat", (room) => {
    socket.join(room);
    console.log("user has joined the room" + room);
  });
  socket.on("new message", (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.map((user) => {
      if (user._id == newMessageReceived?.sender?._id) {
      } else {
        socket.in(user._id).emit("message received", newMessageReceived);
      }
    });
  });
  socket.on("typing", (room) => {
    socket.in(room).emit("typing");
  });
  socket.on("stop typing", (room) => {
    socket.in(room).emit("stop typing");
  });
});

ConnectDB();

app.use(express.json()); // to accept json data
app.use(morgan("dev")); // to display hit url in terminal
app.use(cors(corsOptions)); // to accept request from origin specified in cor options

app.use("/users", userRoutes);
app.use("/files", fileRoutes);
app.use("/chats", chatRoutes);
app.use("/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("welcome !!!");
});

app.use(notFound);

app.use(errorHandler);
