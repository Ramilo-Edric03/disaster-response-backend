const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins (change for security)
  },
});

app.use(cors());
app.get("/", (req, res) => res.send("Disaster Response Backend is Running"));

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("sendLocation", (data) => {
    io.emit("receiveLocation", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
