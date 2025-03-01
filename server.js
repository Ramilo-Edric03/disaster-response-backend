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

    // Handle volunteer accepting a request
    socket.on("acceptRequest", (data) => {
        console.log("Request accepted:", data);
        
        // Remove accepted request from list
        requests = requests.filter(req => req.lat !== data.lat || req.lng !== data.lng);
        
        // Notify all volunteers about updated requests
        io.emit("updateRequests", requests);
        
        // Notify requester that a volunteer is coming
        io.emit("requestAccepted", data);
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
