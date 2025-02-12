import mongoose from 'mongoose';

const examScheduleSchema = new mongoose.Schema({
  examTitle: String,
  class: String,
  section: String,
  subject: String,
  examDate: Date,
  startTime: String,
  endTime: String,
  examTime: String,
  examType: {
    type: String,
    enum: ['Mid-Term', 'Final', 'Quiz', 'Unit Test'], // You can add more types as per your requirements
  },
  examCenter: String,
  isAdmitCardGenerated: {
    type: Boolean,
    default: false, // Default value to false
  },
}, { timestamps: true });

const Exam = mongoose.model('ExamSchedule', examScheduleSchema);

export default Exam;
