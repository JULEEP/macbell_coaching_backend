import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema({
  class: {
    type: String,
  },
  subject: {
    type: String,
  },
  section: {
    type: String,
  },
  homeworkDate: {
    type: Date,
  },
  submissionDate: {
    type: Date,
  },
  marks: {
    type: Number,
  },
  file: {
    type: String,  // Store file path or URL for the attached file
  },
  description: {
    type: String,
  },
  class: { type: String },
    subject: { type: String },
    section: { type: String },
    homeworkDate: { type: Date },
    submissionDate: { type: Date },
    marks: { type: Number },  // Total marks for the homework
    marksObtained: { type: Number, default: 0 },  // Marks obtained by the student
    description: { type: String },
    homeworkTitle: { type: String }, // Added homeworkTitle
    status: { type: String, enum: ['Not Submitted', 'Submitted'], default: 'Not Submitted' }, // Status of homework
    homeworkBy: {type: String},
    submissions: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
        status: { type: String, default: "Pending" },
        submissionDate: Date,
      },
    ],
}, { timestamps: true });

const Homework = mongoose.model('Homework', homeworkSchema);

export default Homework;
