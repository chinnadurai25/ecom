// server.js
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config();


const app = express();
const fs = require("fs");
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* ================= MONGODB ================= */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

/* ================= SCHEMAS ================= */

// USER
const addressSchema = new mongoose.Schema({
  label: String,
  address: String,
  isDefault: Boolean,
});

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  isAdmin: { type: Boolean, default: false },
  addresses: [addressSchema],
});

const User = mongoose.model("User", userSchema);

// CATEGORY
const categorySchema = new mongoose.Schema({
  name: { type: String, unique: true },
});
const Category = mongoose.model("Category", categorySchema);

// PRODUCT
const productSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  description: String,
  image: String,
  averageRating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
});
const Product = mongoose.model("Product", productSchema);

// ORDER
const orderSchema = new mongoose.Schema({
  productName: String,
  productId: String,
  quantity: Number,
  price: Number,
  userEmail: String,
  userName: String,
  status: { type: String, default: "Ordered" },
  createdAt: { type: Date, default: Date.now },
});

orderSchema.index({ createdAt: -1 });
const Order = mongoose.model("Order", orderSchema);

// CART
const cartSchema = new mongoose.Schema({
  userEmail: String,
  productId: String,
  name: String,
  unitPrice: Number,
  price: Number,
  img: String,
  qty: { type: Number, default: 1 },
});
const Cart = mongoose.model("Cart", cartSchema);

// WISHLIST
const wishlistSchema = new mongoose.Schema({
  userEmail: String,
  productId: String,
  name: String,
  price: Number,
  image: String,
});
const Wishlist = mongoose.model("Wishlist", wishlistSchema);

// REVIEW
const reviewSchema = new mongoose.Schema({
  productId: String,
  userEmail: String,
  userName: String,
  rating: Number,
  comment: String,
  images: [String],
  createdAt: { type: Date, default: Date.now },
});
const Review = mongoose.model("Review", reviewSchema);

// CUSTOMER SUPPORT
// CUSTOMER SUPPORT CHAT
const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["user", "admin"] },
  text: String,
  image: String,
  timestamp: { type: Date, default: Date.now },
});

const supportSchema = new mongoose.Schema({
  userEmail: String,
  userName: String,
  subject: String, // First message snippet
  messages: [messageSchema],
  lastUpdated: { type: Date, default: Date.now },
});
const Support = mongoose.model("Support", supportSchema);

/* ================= IMAGE UPLOAD ================= */
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

/* ================= AUTH ================= */
const verifyAdmin = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token" });
    const decoded = jwt.verify(token, "SECRET_KEY");
    if (!decoded.isAdmin) return res.status(403).json({ message: "Admin only" });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ... (Existing Login/Signup routes remain unchanged) ...

/* ================= SUPPORT CHAT ================= */

// START NEW CHAT (USER)
app.post("/support/start", upload.single("image"), async (req, res) => {
  try {
    const { userEmail, userName, message } = req.body;
    const initialMessage = {
      sender: "user",
      text: message,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    };

    const support = await Support.create({
      userEmail,
      userName,
      subject: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
      messages: [initialMessage],
    });
    res.json(support);
  } catch (err) {
    res.status(500).json({ message: "Failed to start chat" });
  }
});

// GET USER CHATS
app.get("/support/user/:email", async (req, res) => {
  try {
    const chats = await Support.find({ userEmail: req.params.email }).sort({ lastUpdated: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// GET ALL CHATS (ADMIN)
app.get("/support/admin", verifyAdmin, async (req, res) => {
  try {
    const chats = await Support.find().sort({ lastUpdated: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch chats" });
  }
});

// SEND MESSAGE (BOTH USER & ADMIN)
app.put("/support/:id/message", upload.single("image"), async (req, res) => {
  try {
    const { sender, text } = req.body; // sender: 'user' or 'admin'
    const newMessage = {
      sender,
      text,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    };

    await Support.findByIdAndUpdate(req.params.id, {
      $push: { messages: newMessage },
      lastUpdated: new Date(),
    });

    res.json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message" });
  }
});

// DELETE CHAT (ADMIN)
app.delete("/admin/support/:id", verifyAdmin, async (req, res) => {
  try {
    await Support.findByIdAndDelete(req.params.id);
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete chat" });
  }
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// SIGNUP
app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashed });
    res.json({ message: "Signup successful" });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Email already exists" });
    }
    console.error("Signup Error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      "SECRET_KEY",
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

/* ================= CART ================= */

app.get("/cart/:email", async (req, res) => {
  try {
    const cart = await Cart.find({ userEmail: req.params.email });
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch cart" });
  }
});

app.post("/cart", async (req, res) => {
  try {
    const { userEmail, productId, name, price, img, qty } = req.body;

    let item = await Cart.findOne({ userEmail, productId });
    if (item) {
      item.qty += qty;
      await item.save();
    } else {
      item = await Cart.create({ userEmail, productId, name, price, img, qty });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to add to cart" });
  }
});

app.post("/cart/update-qty", async (req, res) => {
  try {
    const { userEmail, productId, qty } = req.body;
    await Cart.findOneAndUpdate({ userEmail, productId }, { qty });
    res.json({ message: "Quantity updated" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update quantity" });
  }
});

app.delete("/cart/:email/:productId", async (req, res) => {
  try {
    await Cart.findOneAndDelete({
      userEmail: req.params.email,
      productId: req.params.productId
    });
    res.json({ message: "Item removed from cart" });
  } catch (err) {
    res.status(500).json({ message: "Failed to remove from cart" });
  }
});

/* ================= ADMIN ================= */

// CATEGORY
app.post("/admin/category", verifyAdmin, async (req, res) => {
  try {
    const category = await Category.create({ name: req.body.name });
    res.json(category);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "Category already exists" });
    }
    res.status(500).json({ message: "Failed to create category" });
  }
});

app.get("/categories", async (req, res) => {
  try {
    res.json(await Category.find());
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// PRODUCT
app.post("/admin/product", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const product = await Product.create({
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to create product" });
  }
});

app.delete("/admin/product/:id", verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product" });
  }
});

app.put("/admin/product/:id", verifyAdmin, upload.single("image"), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Failed to update product" });
  }
});

// ✅ ADMIN ORDERS (ALL ORDERS, NO LIMIT)
app.get("/admin/orders", verifyAdmin, async (req, res) => {
  try {
    const query = {};

    if (req.query.from && req.query.to) {
      query.createdAt = {
        $gte: new Date(req.query.from),
        $lte: new Date(req.query.to + "T23:59:59"),
      };
    }

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


app.put("/admin/orders/:id", verifyAdmin, async (req, res) => {
  await Order.findByIdAndUpdate(req.params.id, { status: req.body.status });
  res.json({ message: "Status updated" });
});

/* ================= USER ================= */

// PRODUCTS
app.get("/products", async (req, res) => res.json(await Product.find()));
app.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: "Invalid product ID or server error" });
  }
});
// PRODUCTS BY CATEGORY
app.get("/products/category/:category", async (req, res) => {
  try {
    const category = req.params.category;

    const products = await Product.find({
      category: { $regex: new RegExp(`^${category}$`, "i") } // case-insensitive
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ORDERS
app.post("/orders", async (req, res) => {
  try {
    const order = await Order.create(req.body);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
});

app.get("/orders/:email", async (req, res) => {
  res.json(await Order.find({ userEmail: req.params.email }));
});

/* ================= REVIEWS ================= */

// GET REVIEWS FOR A PRODUCT
app.get("/reviews/:productId", async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// POST A NEW REVIEW
app.post("/reviews", upload.array("images", 5), async (req, res) => {
  try {
    const { productId, userEmail, userName, rating, comment } = req.body;

    // Save images if any
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    // Create review
    const review = await Review.create({
      productId,
      userEmail,
      userName,
      rating: Number(rating),
      comment,
      images
    });

    // Update Product averageRating and ratingCount
    const allReviews = await Review.find({ productId });
    const count = allReviews.length;
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / count;

    await Product.findByIdAndUpdate(productId, {
      averageRating: avg,
      ratingCount: count
    });

    res.json(review);
  } catch (err) {
    console.error("Review Error:", err);
    res.status(500).json({ message: "Failed to submit review" });
  }
});

/* ================= SUPPORT ================= */

// SUBMIT SUPPORT REQUEST
app.post("/support", upload.single("image"), async (req, res) => {
  try {
    const { userEmail, userName, message } = req.body;
    const support = await Support.create({
      userEmail,
      userName,
      message,
      image: req.file ? `/uploads/${req.file.filename}` : "",
    });
    res.json({ message: "Support request submitted", support });
  } catch (err) {
    res.status(500).json({ message: "Failed to submit request" });
  }
});

// GET SUPPORT REQUESTS (ADMIN)
app.get("/admin/support", verifyAdmin, async (req, res) => {
  try {
    const requests = await Support.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch support requests" });
  }
});

// ADMIN REPLY
app.put("/admin/support/:id/reply", verifyAdmin, async (req, res) => {
  try {
    await Support.findByIdAndUpdate(req.params.id, {
      reply: req.body.reply,
      replyAt: new Date(),
    });
    res.json({ message: "Reply sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send reply" });
  }
});

// GET USER SUPPORT HISTORY
app.get("/support/history/:email", async (req, res) => {
  try {
    const history = await Support.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

/* ================= SERVER ================= */

