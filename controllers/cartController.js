const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// 📌 Add Item to Cart

exports.addToCart = async (req, res) => {
  try {
    const { user, items } = req.body;
    console.log(user , items);
    if (!user || !items || items.length === 0) {
      return res.status(400).json({ message: "Invalid request data!" });
    }

    // Find the user's cart
    let cart = await Cart.findOne({ user });
    console.log("hi da ",cart);
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
    // cart.totalPrice = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
    cart.totalPrice = (() => {
      const total = cart.items.reduce((total, item) => total + item.quantity * item.price, 0);
      const decimalPart = total - Math.floor(total); // Extract decimal part
    
      return decimalPart > 0.49 ? Math.ceil(total) : Math.floor(total);
    })();
     
    await cart.save();
    res.status(200).json({ message: "Items added to cart", cart });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// 📌 Get Cart Items

exports.getCartItems = async (req, res) => {
  try {
    const userId = req.params.userId; // Get userId from URL params
    console.log("User ID:", userId);

    const cart = await Cart.findOne({ user:userId }).populate("items.product");

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", items: [] });
    }

    // Extracting necessary details
    const cartData = {
      _id: cart._id,
      user: cart.user.toString(),
      items: cart.items.map(item => ({
        productId: item.product?._id, // Ensure this is properly populated
        name: item.product?.name || "Unknown",
        price: item.price || 0,
        quantity: item.quantity || 1,
        image: item.product?.images?.[0] || "", // Handle missing image case
      })),
      totalPrice: cart.totalPrice || 0,
      discount: cart.discount || 0,
    };
    console.log("Cart Data:", cartData);
    res.status(200).json(cartData);
  } catch (err) {
    console.error("Error fetching cart:", err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};





// // 📌 Remove Item from Cart
exports.removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ message: "User ID and Product ID are required." });
    }

    console.log("Removing Product:", productId, "for User:", userId); // Debugging

    // 🛒 Find the user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    // 🔍 Find the index of the product in the cart
    const itemIndex = cart.items.findIndex((item) => item.product.toString() === productId);
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Product not found in cart!" });
    }

    // Get the price of the removed item
    const removedItem = cart.items[itemIndex];
    const removedItemTotalPrice = removedItem.price * removedItem.quantity;

    // 🗑 Remove product from cart
    cart.items.splice(itemIndex, 1);

    // 🔢 Update total price after removal
    cart.totalPrice = Math.max(0, cart.totalPrice - removedItemTotalPrice);

    // 💾 Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (err) {
    console.error("Error removing item from cart:", err);
    res.status(500).json({ message: err.message });
  }
};


// 📌 Delete Entire Cart
exports.deleteCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find and delete the cart
    const cart = await Cart.findOneAndDelete({ user: userId });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found!" });
    }

    res.status(200).json({ message: "Cart deleted successfully!" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

