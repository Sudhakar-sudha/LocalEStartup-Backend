const Trainer = require("../models/Trainer");

// Add a new trainer with email check
const addTrainer = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email already exists
    const existingTrainer = await Trainer.findOne({ email });
    if (existingTrainer) {
      return res
        .status(400)
        .json({ message: "You are already registered as a trainer" });
    }

    // Create new trainer
    const newTrainer = new Trainer(req.body);
    await newTrainer.save();
    res.status(201).json({ message: "Trainer added successfully", newTrainer });
  } catch (error) {
    res.status(500).json({ message: "Error saving trainer", error });
  }
};

// Get all trainers
const getTrainers = async (req, res) => {
  try {
    const trainers = await Trainer.find().sort({ createdAt: -1 });
    res.status(200).json(trainers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching trainers", error });
  }
};

// Delete trainer by ID
const deleteTrainer = async (req, res) => {
  try {
    await Trainer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Trainer deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting trainer", error });
  }
};

module.exports = {
  addTrainer,
  getTrainers,
  deleteTrainer,
};
