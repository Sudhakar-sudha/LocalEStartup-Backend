const express = require("express");
const router = express.Router();
const trainerController = require("../controllers/trainerController");

// Add new trainer
router.post("/", trainerController.addTrainer);

// Get all trainers
router.get("/", trainerController.getTrainers);


router.delete("/:id", trainerController.deleteTrainer);
module.exports = router;
