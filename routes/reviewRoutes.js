const express = require("express");
const { addReview, getReviewsByProduct, deleteReview } = require("../controllers/reviewController");

const router = express.Router();

router.post("/add", addReview);
router.get("/:productId", getReviewsByProduct);
router.delete("/:id", deleteReview);

module.exports = router;
