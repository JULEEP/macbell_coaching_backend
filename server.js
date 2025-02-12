import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDatabase from './db/connectDatabase.js';
import AdminRoutes from './Routes/AdminRoutes.js';
import TeacherRoutes from './Routes/TeacherRoutes.js';
import StudentRoutes from './Routes/StudentRoutes.js';
import ParentRoutes from './Routes/ParentRoutes.js';
import busRoutes from './Routes/busRoutes.js';
import { calculateDistance } from "./utils/calculateDistance.js";
import Bus from './Models/Bus.js';
import { Server } from 'socket.io';  // Import Socket.IO

dotenv.config();

const app = express();

// Create an HTTP server with Express app
const server = http.createServer(app);

// Set up Socket.IO with the HTTP server
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // Your frontend URL
        methods: ["GET", "POST"]
    }
});

// Export `io` to use in other files
export { io };

app.use(cors({
    origin: ['http://localhost:3000', 'https://school-manage-zeta.vercel.app', 'https://educare-coaching.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Database connection
connectDatabase();

app.use('/api/admin', AdminRoutes);
app.use('/api/teacher', TeacherRoutes);
app.use('/api/students', StudentRoutes);
app.use('/api/parent', ParentRoutes);
app.use("/api/bus", busRoutes);

// Default route
app.get("/", (req, res) => {
    res.json({ message: "Hello from Server" });
});

// Set interval for bus location updates and checking
setInterval(async () => {
    const buses = await Bus.find({});

    buses.forEach(bus => {
        bus.route.forEach(stop => {
            const distance = calculateDistance(
                bus.currentLocation.lat, bus.currentLocation.lng,
                stop.lat, stop.lng
            );

            if (distance < 200) {
                const message = `🚍 Bus ${bus.busNumber} is near ${stop.stopName}`;
                
                // ✅ Emit notification via Socket.IO
                io.emit("bus-alert", message); // This will emit the notification
            }
        });
    });
}, 4000);

// Start the server with Socket.IO
const port = process.env.PORT || 6000;
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
