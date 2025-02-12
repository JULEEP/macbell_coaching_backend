import express from 'express';
import Bus from '../Models/Bus.js';
import { calculateDistance } from "../utils/calculateDistance.js";
import { io } from "../server.js";  // Import io from server.js (server-side WebSocket)

// Initialize router
const router = express.Router();

router.post("/update-location", async (req, res) => {
    const { busNumber, lat, lng, route } = req.body;

    if (!busNumber || lat === undefined || lng === undefined) {
        return res.status(400).json({ error: "Bus number, latitude, and longitude are required" });
    }

    try {
        const bus = await Bus.findOneAndUpdate(
            { busNumber },
            { 
                $set: { currentLocation: { lat, lng }, route },
                $push: { locationHistory: { lat, lng, timestamp: new Date() } }
            },
            { new: true, upsert: true }
        );

        res.json({ message: "Bus location updated!", bus });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});



// 🟢 Get Bus Current Location
router.get("/location/:busNumber", async (req, res) => {
    const bus = await Bus.findOne({ busNumber: req.params.busNumber });

    if (!bus) return res.status(404).json({ error: "Bus not found!" });

    res.json({ busNumber: bus.busNumber, location: bus.currentLocation });
});

router.get("/check-bus-notifications/:busNumber", async (req, res) => {
    const { busNumber } = req.params;
    const bus = await Bus.findOne({ busNumber });

    if (!bus) return res.status(404).json({ error: "Bus not found!" });

    let notifications = [];
    let currentTime = new Date(); // Current time

    const BUS_SPEED_METERS_PER_SEC = 7; // Approx. 25 km/h
    const MIN_DELAY_MINUTES = 2; // Minimum delay per stop

    const { lat, lng } = bus.currentLocation; // Current location of the bus

    for (let index = 0; index < bus.route.length; index++) {
        const stop = bus.route[index];

        const distance = calculateDistance(
            lat, lng, // Bus current location
            stop.lat, stop.lng, // Stop coordinates
            false // Distance in meters
        );

        let estimatedTime = new Date(currentTime);

        if (distance > 0) {
            const travelTimeInSeconds = Math.floor(distance / BUS_SPEED_METERS_PER_SEC);
            estimatedTime.setSeconds(estimatedTime.getSeconds() + travelTimeInSeconds);
        }

        estimatedTime.setMinutes(estimatedTime.getMinutes() + (index * MIN_DELAY_MINUTES));

        // ✅ Bus reached the stop
        const arrivalMessage = `🚍 Bus ${bus.busNumber} arrived at ${stop.stopName} at ${estimatedTime.toLocaleTimeString()}.`;
        io.emit("bus-alert", arrivalMessage);
        notifications.push(arrivalMessage);

        // ✅ Predict the next stop arrival time
        if (index < bus.route.length - 1) {
            const nextStop = bus.route[index + 1];

            const nextDistance = calculateDistance(
                stop.lat, stop.lng, // Current stop coordinates
                nextStop.lat, nextStop.lng, // Next stop coordinates
                false // Distance in meters
            );

            const nextEstimatedTime = new Date(estimatedTime);
            const travelTimeToNextStopInSeconds = Math.floor(nextDistance / BUS_SPEED_METERS_PER_SEC);
            nextEstimatedTime.setSeconds(nextEstimatedTime.getSeconds() + travelTimeToNextStopInSeconds);

            const nextMessage = `🚍 Bus ${bus.busNumber} will arrive at ${nextStop.stopName} at ${nextEstimatedTime.toLocaleTimeString()}.`;
            io.emit("bus-alert", nextMessage);
            notifications.push(nextMessage);
        }
    }

    res.json({ notifications });
});


router.get("/get-all-buses", async (req, res) => {
    try {
        // Retrieve all buses
        const buses = await Bus.find();

        if (buses.length === 0) {
            return res.status(404).json({ error: "No buses found" });
        }

        // Send the list of buses in the response
        res.json({ message: "All bus data retrieved successfully", buses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});





export default router;
