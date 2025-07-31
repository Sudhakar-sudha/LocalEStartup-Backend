const mongoose = require("mongoose");

const trainerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    skills: { type: String, required: true },
    education: { type: String },
    message: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trainer", trainerSchema);
