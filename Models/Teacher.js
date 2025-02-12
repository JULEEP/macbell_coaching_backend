// Teacher Schema
import mongoose from "mongoose";
const teacherSchema = new mongoose.Schema({
  name: { type: String },
  subject: { type: [String] },
  email: { type: String, unique: true },
  contactNumber: { type: String },
  class: { type: String },
  section: { type: String },
  teacher: { type: String },
  address: String,
  lastExperience: String,
  age: Number,
  phone: String,
  gender: String,
  education: String,
  photo: String,
  password: String,
  refreshToken: String,
  joiningDate: Date,
  schedule: [
    {
      day: { type: String },
      time: { type: String },
      class: { type: String }
    }
  ],
  attendance: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      attendanceStatus: {
        type: String,
        enum: ['Present', 'Absent', 'On Leave'], // Customize for teachers
        default: 'Absent',
      },
    },
  ],
  subjects: [
    {
      class: { type: String },
      section: { type: String },
      subject: { type: String },
    },
  ],
  leaves: [
  {
      startDate: {
          type: Date,
      },
      endDate: {
          type: Date,
      },
      reason: {
          type: String,
      },
      leaveType: { type: String },
      status: {
          type: String,
          enum: ['Pending', 'Approved', 'Rejected'],
          default: 'Pending',
      },
  },
],
  assignedHomework: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Homework' }],
  mymeeting: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meeting"
  }],

  role: { type: String, default: 'Teacher' }
}, { timestamps: true });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher