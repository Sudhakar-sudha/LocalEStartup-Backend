const express = require("express");
const router = express.Router();
const feedbackController = require("../controllers/localestartupfeedbackController");

router.post("/", feedbackController.addFeedback);
router.get("/", feedbackController.getFeedback); // optional

router.delete("/:id", feedbackController.deleteFeedback);
module.exports = router;
