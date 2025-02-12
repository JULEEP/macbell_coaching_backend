// Model (Assuming Mongoose is being used)
import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema({
    assignmentTitle: { type: String, },
    subject: { type: String, },
    class: { type: String },
    section: { type: String },
    dueDate: { type: Date },
    description: { type: String },
    file: {
        type: String,  // Store file path or URL for the attached file
    },
     // New Field: Student Submissions
  submissions: [
    {
      studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
      submittedDate: { type: Date, default: Date.now },
      status: { type: String, enum: ["Pending", "Submitted"], default: "Pending" }
    }
  ],
}, { timestamps: true });

const Assignment = mongoose.model('Assignment', AssignmentSchema);
export default Assignment
