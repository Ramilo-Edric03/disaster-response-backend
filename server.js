const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    "https://disaster-response-frontend.vercel.app",
    "http://localhost:3000" // Include this if testing locally
];

const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"]
    }
});

app.use(cors({ origin: allowedOrigins }));

let locations = {};
let requests = [];

io.on("connection", (socket) => {
    console.log("User connected", socket.id);
    
    socket.on("sendLocation", (data) => {
        locations[socket.id] = data;
        io.emit("receiveLocation", locations);
    });
    
    socket.on("requestHelp", (data) => {
        requests.push(data);
        io.emit("newHelpRequest", requests);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);
        delete locations[socket.id];
        io.emit("receiveLocation", locations);
    });
});

server.listen(3000, () => {
    console.log("Server running on port 3000");
});
