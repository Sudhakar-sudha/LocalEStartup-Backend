const express = require("express");
const router = express.Router();
const freelancerController = require("../controllers/freelancerController");

// Add new freelancer
router.post("/", freelancerController.addFreelancer);

// Get all freelancers
router.get("/", freelancerController.getFreelancers);

module.exports = router;
