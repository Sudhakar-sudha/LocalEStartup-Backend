const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// 📌 Add Item to Cart

exports.addToCart = async (req, res) => {
  try {
    const { user, items } = req.body;
    
    if (!user || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid request data!" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user });

    if (!cart) {
      cart = new Cart({ user, items: [], totalPrice: 0 });
    }

    for (let item of items) {
      const { product, quantity } = item;

      // Fetch product details
      const getProduct = await Product.findById(product);
      if (!getProduct) {
        return res.status(404).json({ message: `Product ${product} not found!` });
      }

      let existingItem = cart.items.find((cartItem) => cartItem.product.toString() === product);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product, quantity, price: getProduct.price });
      }
    }

    // Recalculate total price
    cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);

    await cart.save();
    res.status(200).json({ message: "Items added to cart", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// 📌 Get Cart Items
exports.getCartItems = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.params.userId }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart is empty!" });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




// 📌 Remove Item from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found!" });

    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 