const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: true,
    },

    tokenNumber: {
      type: Number,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["waiting", "in-progress", "completed"],
      default: "waiting",
    },

    consultationStartTime: {
  type: Date,
},

consultationEndTime: {
  type: Date,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);