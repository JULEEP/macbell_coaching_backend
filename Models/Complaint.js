import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student", // Referring to the Student model
      },
    complaintBy: { type: String }, // Name of the complainer
    complaintType: { type: String }, // Type of the complaint
    complaintSource: { type: String }, // Source of complaint
    phone: { type: String }, // Optional
    date: { type: Date, default: Date.now }, // Date of complaint
    actionsTaken: { type: String }, // Actions taken
    assigned: { type: String }, // Assigned to
    description: { type: String }, // Complaint description
    title: { type: String }, // Complaint description

  },
  { timestamps: true }
);

const ComplaintModel = mongoose.model('Complaint', complaintSchema);

export default ComplaintModel;
