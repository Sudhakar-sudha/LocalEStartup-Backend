const Freelancer = require("../models/Freelancer");

// Add a new freelancer
const addFreelancer = async (req, res) => {
  try {
    // Check if email already exists
    const existingFreelancer = await Freelancer.findOne({ email: req.body.email });
    if (existingFreelancer) {
      return res.status(400).json({ message: "Email already registered as a freelancer" });
    }

    // Save new freelancer
    const newFreelancer = new Freelancer(req.body);
    await newFreelancer.save();

    res.status(201).json(newFreelancer);
  } catch (error) {
    res.status(500).json({ message: "Error saving freelancer", error });
  }
};


// Get all freelancers
const getFreelancers = async (req, res) => {
  try {
    const freelancers = await Freelancer.find().sort({ createdAt: -1 });
    res.status(200).json(freelancers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching freelancers", error });
  }
};


// Delete freelancer by ID
const deleteFreelancer = async (req, res) => {
  try {
    await Freelancer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Freelancer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting freelancer", error });
  }
};

module.exports = {
  addFreelancer,
  getFreelancers,
  deleteFreelancer,
};
