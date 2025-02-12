import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

socket.on("connect", () => {
    console.log("✅ Connected to WebSocket Server");
});

socket.on("bus-alert", (message) => {
    console.log("📢 Notification Received:", message);
});

socket.on("disconnect", () => {
    console.log("❌ Disconnected from WebSocket Server");
});
