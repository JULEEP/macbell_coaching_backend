
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  leaveType: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    default: 'Pending',  // Default status set to 'Pending'
  },
});

const Leave = mongoose.model('Leave', leaveSchema);

export default Leave;
