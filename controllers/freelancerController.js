const Freelancer = require("../models/Freelancer");

// Add a new freelancer
const addFreelancer = async (req, res) => {
  try {
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

module.exports = {
  addFreelancer,
  getFreelancers,
};
