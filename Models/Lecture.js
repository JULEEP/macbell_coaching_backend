import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    date: { type: Date },
    duration: { type: Number }, // Duration in minutes
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
    class: { type: String},
    section: { type: String},
    subject: { type: String },
    lectureMaterials: [{ type: String }], // URLs of lecture materials (PDFs, Videos, etc.)
    attendance: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendance' }],
    videoLink: { type: String }, // Link to recorded lecture
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
}, { timestamps: true });

const Lecture = mongoose.model('Lecture', lectureSchema);
export default Lecture;