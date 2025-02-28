const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (change this for security)
        methods: ["GET", "POST"]
    }
});

app.use(cors());

let locations = {}; // Store requester & volunteer locations

// Handle WebSocket connections
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Listen for location updates from the frontend
    socket.on("sendLocation", (data) => {
        const { role, lat, lng } = data;
        locations[role] = { lat, lng };

        console.log(`${role} updated location:`, lat, lng);

        // Broadcast the location to all users
        io.emit("receiveLocation", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

// Default API route
app.get("/", (req, res) => {
    res.send("Disaster Response WebSocket Server is Running!");
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
