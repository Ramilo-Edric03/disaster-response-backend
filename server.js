const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
let requests = [];

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("sendRequest", (data) => {
        requests.push({ ...data, id: socket.id });
        io.emit("updateRequests", requests);
        console.log("New help request:", data);
    });

    socket.on("acceptRequest", ({ requestId, volunteerLat, volunteerLng }) => {
        const request = requests.find(req => req.id === requestId);
        if (request) {
            io.emit("matchRequest", { 
                lat: request.lat, 
                lng: request.lng, 
                volunteerLat, 
                volunteerLng 
            });
            requests = requests.filter(req => req.id !== requestId);
            io.emit("updateRequests", requests);
            console.log("Request accepted, route will be drawn.");
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        requests = requests.filter(req => req.id !== socket.id);
        io.emit("updateRequests", requests);
    });
});

app.get("/", (req, res) => {
    res.send("Disaster Response WebSocket Server is Running!");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
