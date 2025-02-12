import mongoose from 'mongoose';

// Student Schema
const studentSchema = new mongoose.Schema({
  name: { type: String },
  dob: { type: Date },
  address: { type: String },
  class: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
  type: {
    type: String,
  },
  attendance: [
    {
      date: { type: Date },
      status: { type: String, enum: ['Present', 'Absent', 'Late'], default: 'Present' }
    }
  ],
  fees: [{
    feesType: String,
    invoiceNumber: String,
    status: String,
    amount: Number,
    paidAmount: Number,
    paymentMethod: String,
    paidDate: Date,
    pendingPayment: Number,
  }],
  role: { type: String, default: 'Student' },
  academicYear: {
    type: String
  },
  class: {
    type: String
  },
  section: {
    type: String
  },
  admissionNumber: {
    type: String
  },
  admissionDate: {
    type: Date
  },
  roll: {
    type: String
  },
  group: {
    type: String
  },
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  gender: {
    type: String
  },
  dateOfBirth: {
    type: Date
  },
  religion: {
    type: String
  },
  caste: {
    type: String
  },
  studentPhoto: {
    type: String
  },
  emailAddress: {
    type: String
  },
  phoneNumber: {
    type: String
  },
  currentAddress: {
    type: String
  },
  permanentAddress: {
    type: String
  },
  bloodGroup: {
    type: String
  },
  category: {
    type: String
  },
  height: {
    type: String
  },
  weight: {
    type: String
  },

  groupName: {
    type: String,
  },
  academicYear: {
    type: String,
    default: ''
  },
  studentClass: {
    type: String,
    default: ''
  },
  section: {
    type: String,
    default: ''
  },
  admissionNumber: {
    type: String,
    unique: true,
    default: ''
  },
  admissionDate: {
    type: Date,
    default: null
  },
  roll: {
    type: String,
    default: ''
  },
  group: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  gender: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  religion: {
    type: String,
    default: ''
  },
  caste: {
    type: String,
    default: ''
  },
  studentPhoto: {
    type: String, // Assuming it's a file path or URL
    default: ''
  },
  email: {
    type: String,
    match: [/\S+@\S+\.\S+/, 'Please enter a valid email address'],
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  fatherName: {
    type: String,
    default: ''
  },
  motherName: {
    type: String,
    default: ''
  },
  guardianName: {
    type: String,
    default: ''
  },
  fatherOccupation: {
    type: String,
    default: ''
  },
  motherOccupation: {
    type: String,
    default: ''
  },
  guardianPhone: {
    type: String,
    default: ''
  },
  documentType: {
    type: String,
    default: ''
  },
  documentNumber: {
    type: String,
    default: ''
  },
  issueDate: {
    type: Date,
    default: null
  },
  expirationDate: {
    type: Date,
    default: null
  },
  previousSchoolName: {
    type: String,
    default: ''
  },
  gradeCompleted: {
    type: String,
    default: ''
  },
  schoolAddress: {
    type: String,
    default: ''
  },
  schoolContact: {
    type: String,
    default: ''
  },
  additionalInfo: {
    type: String,
    default: ''
  },
  customField1: {
    type: String,
    default: ''
  },
  randomPassword: {
    type: String, // Plain text password (if using random password generation)
  },
  refreshToken: {
    type: String,
  },
  attendance: [
    {
        date: {
            type: Date,
        },
        attendanceStatus: {
            type: String,
            enum: ['Present', 'Absent', 'Late'], // Add more if needed
        },
        subject: {
          type: String,
        },
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
marks: [
  {
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
  },
],
  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student', // Assuming you already have a 'Student' model
    }
  ],
  examSchedule: [
    {
        subject: {
            type: String,
        },
        examDate: {
            type: Date,
        },
        examTime: {
            type: String,
        },
        examType: {
            type: String,
            enum: ['Mid-Term', 'Final', 'Quiz', 'Unit Test'], // You can add more types as per your requirements
        },
        isAdmitCardGenerated: {
          type: Boolean,
          default: false, // Default value to false
        },
        
    },
],
admitCard: {
  admitGenerated: { type: Boolean, default: false },
  issueDate: { type: Date },
},
subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject', default: [] }],  // Ensuring subjects is always an array
transport: { type: mongoose.Schema.Types.ObjectId, ref: 'Transport' }, // Reference to the Transport model
 // Parent information (an array of parent objects)
 myParents: [
  {
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parent' },
    name: String,
    email: String,
    phone: String,
    occupation: String,
    relationship: String,  // e.g. Father, Mother, Guardian
  }
],
complaints: [
  { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" } // Reference to complaints against the student
],


}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student 