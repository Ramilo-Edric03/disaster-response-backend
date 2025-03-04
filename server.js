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

let requests = []; // Store active requests

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Handle new help requests
    socket.on("sendRequest", (data) => {
        console.log("New request received:", data);
        requests.push(data);
        io.emit("updateRequests", requests);
    });

    socket.emit("updateRequests", requests);

    // Handle volunteer accepting a request
    socket.on("acceptRequest", (data) => {
        console.log("Request accepted:", data);
        
        // Remove accepted request from list
        requests = requests.filter(req => req.lat !== data.lat || req.lng !== data.lng);
        
        // Notify requester that a volunteer is coming
        io.emit("requestAccepted", data);
    });

    // Handle live volunteer location updates
    socket.on("volunteerLocationUpdate", (data) => {
        console.log("Live volunteer location update:", data);
        io.emit("updateVolunteerLocation", data);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });

    socket.on("clearRequests", () => {
        console.log("All requests cleared by a volunteer.");
        requests = []; // Clear requests from memory
        io.emit("updateRequests", requests); // Broadcast update to all users
    });
    
    
});

// Default API route
app.get("/", (req, res) => {
    res.send("Disaster Response WebSocket Server is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

