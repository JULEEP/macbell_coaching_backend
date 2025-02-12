import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
    busNumber: { 
        type: String,
        unique: true // Ensures busNumber is still unique
    },
    currentLocation: {
        lat: { type: Number }, // latitude is now optional
        lng: { type: Number }  // longitude is now optional
    },
    route: [
        {
            stopName: { type: String }, // stopName is now optional
            lat: { type: Number },      // stop latitude is now optional
            lng: { type: Number },      // stop longitude is now optional
            arrivalTime: { type: String } // arrivalTime is now optional
        }
    ],
    locationHistory: [
        {
            lat: { type: Number }, // latitude is now optional
            lng: { type: Number }, // longitude is now optional
            timestamp: { type: Date, default: Date.now } // timestamp is still added automatically
        }
    ]
}, { timestamps: true }); // Timestamps for createdAt and updatedAt

const Bus = mongoose.model("Bus", BusSchema);
export default Bus;
