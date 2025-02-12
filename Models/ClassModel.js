import mongoose from 'mongoose';

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      unique: true, // Ensures no duplicate class names
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Section', // References the Section model
      }
    ]
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

const ClassModel = mongoose.model('Class', classSchema);

export default ClassModel;
