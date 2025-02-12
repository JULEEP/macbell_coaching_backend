import mongoose from 'mongoose';

const transportRouteSchema = new mongoose.Schema({
  fare: {
    type: Number,
  },
  transportType: { type: String }, 
  route: { type: String },          
  pickupTime: { type: String },     
  dropTime: { type: String },       
  vehicle: { type: String },       
  routeTitle: { type: String, }, // Route ka naam
  driver: { 
    name: { type: String, }, // Driver ka naam
    mobileNumber: { type: String, } // Driver ka mobile number
  },  stops: [
    {
      stopName: { type: String, }, // Stop ka naam
      arrivalTime: { type: String, } // Stop pe bus kitne baje aayegi
    }
  ],
  date: { type: Date, } // Route ka date
}, { timestamps: true });

const Transport = mongoose.model('Transport', transportRouteSchema);

export default Transport;
