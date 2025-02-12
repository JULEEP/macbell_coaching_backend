import mongoose from "mongoose";

const { Schema, model } = mongoose;

const meetingSchema = new Schema(
  {
    meetingLink: { type: String, },
    class: { type: String, },
    section: { type: String, },
    meetingTime: { type: Date, }, // Stores both date and time
    subject: { type: String, },
    agenda: { type: String },
    location: { type: String },
    date: {
      type: String,
    },
    time: {
      type: String,
    },
    link: {
      type: String,
    },
  },
  { timestamps: true }
);

const Meeting = model("Meeting", meetingSchema);

export default Meeting;
