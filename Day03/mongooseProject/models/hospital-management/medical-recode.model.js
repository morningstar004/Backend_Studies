import mongoose from "mongoose";

const medicalReportSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
    },
    report: {
        type: String,
        required: true,
    }
},{timestamps: true})

export const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema)