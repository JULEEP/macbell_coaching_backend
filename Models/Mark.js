import mongoose from "mongoose";
const marksSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
    },
    subject: {
        type: String,
    },
    marksObtained: {
        type: Number,
    },
    totalMarks: {
        type: Number,
    },
    examDate: {
        type: Date,
    },
    examType: {
        type: String,
    },
    examName: {
        type: String,
    }
});

const Marks = mongoose.model('Marks', marksSchema);

export default Marks;
