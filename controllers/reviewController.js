const Review = require("../models/reviewModel");
const Product = require("../models/productModel");

// 📌 Add Review
exports.addReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    const review = new Review({
      user: userId,
      product: productId,
      rating,
      comment,
    });

    await review.save();

    // Update product ratings
    const product = await Product.findById(productId);
    product.reviews.push(review._id);
    await product.save();

    res.status(201).json({ message: "Review added", review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Get Reviews of a Product
exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate("user");
    res.status(200).json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Delete Review
exports.deleteReview = async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
