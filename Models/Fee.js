// Fee Schema
import mongoose from "mongoose";
const feeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student", // Referring to the Student model
  },
  feesType: {
    type: String,
    enum: ["Tuition", "Exam", "Admission", "Transport", "Monthly", "Other"], // You can extend the fee types as needed
  },
  invoiceNumber: {
    type: String,
  },
  status: {
    type: String,
    enum: ["Pending", "Paid", "Partial"], // Fee status options
    default: "Pending",
  },
  amount: {
    type: Number,
    min: 0, // Amount must be non-negative
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0, // Paid amount must be non-negative
  },
  paymentMethod: {
    type: String,
    default: "None", // Default is no payment method
  },
  paidDate: {
    type: Date,
    default: null, // This will be null if no payment has been made
  },
  pendingPayment: {
    type: Number,
    default: function () {
      return this.amount - this.paidAmount;
    },
    min: 0, // Pending payment cannot be negative
  },
  
  }, { timestamps: true });
  
  const Fee = mongoose.model('Fee', feeSchema);
  export default Fee
