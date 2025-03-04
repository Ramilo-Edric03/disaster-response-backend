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

    // Send all active requests immediately to the new volunteer
    socket.emit("updateRequests", requests);

    // Handle new help requests
    socket.on("sendRequest", (data) => {
        console.log("New request received:", data);
        requests.push(data);
        io.emit("updateRequests", requests); // Send updated request list to all volunteers
    });

    // Handle volunteer accepting a request
    socket.on("acceptRequest", (data) => {
        console.log("Request accepted:", data);
        
        // Remove the accepted request from the list
        requests = requests.filter(req => req.lat !== data.lat || req.lng !== data.lng);
        
        // Notify all users that the request was accepted
        io.emit("requestAccepted", data);
        
        // Send updated request list to all volunteers
        io.emit("updateRequests", requests);
    });

    // Handle live volunteer location updates
    socket.on("volunteerLocationUpdate", (data) => {
        console.log("Live volunteer location update:", data);

        // Broadcast volunteer's updated location only to the requester
        io.emit("updateVolunteerLocation", data);
    });

    // Handle clearing all requests
    socket.on("clearRequests", () => {
        console.log("All requests cleared by a volunteer.");
        requests = []; // Clear requests from memory
        io.emit("updateRequests", requests); // Notify all users
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
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

