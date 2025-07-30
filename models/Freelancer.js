const mongoose = require("mongoose");

const freelancerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    skills: { type: String, required: true },
    experience: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Freelancer", freelancerSchema);
