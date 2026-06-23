import mongoose from "mongoose";

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    disgnosedWith: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    Address: {
      type: String,
      required: false,
    },
    BloodGroup: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["M", "F", "O"],
    },
  },
  { timestamps: true },
);

export const Patient = mongoose.model("Patient", patientSchema);
