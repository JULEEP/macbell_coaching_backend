// models/Holiday.js
import mongoose from 'mongoose';

const holidaySchema = new mongoose.Schema({
  fromDate: {
    type: Date,
  },
  toDate: {
    type: Date,
  },
  holidayName: {
    type: String,
  },
  holidayMessage: {
    type: String,
  }
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', holidaySchema);
export default Holiday
