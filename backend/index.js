import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import "./db/config.js";
import User from "./db/User.js";
import Product from "./db/Product.js";
import Cart from "./db/Cart.js";
import Order from "./db/Order.js";
import Upload, { PaymentUpload } from "./middleware/upload.js";
import { isAdmin } from "./middleware/isAdmin.js";
import { verifyTokenMiddleWare } from "./middleware/verifyTokenMiddleWare.js";

dotenv.config();

const app = express();

// ================= MANUAL CORS =================
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:3000",
    "https://e-commerce-frontend-liard-two.vercel.app",
    "https://e-commerce-frontend-9wo6uz2vh-hassam-tariqs-projects.vercel.app"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

app.use(express.json());

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

// ❌ FIX #1 (IMPORTANT): DO NOT disable uploads
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Backend is running ✅" });
});

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, adminKey } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User exists" });

    let role = "user";

    if (adminKey) {
      if (adminKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin key" });
      }
      role = "admin";
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });

    const userObj = user.toObject();
    delete userObj.password;

    const token = jwt.sign(
      { _id: userObj._id, role: userObj.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const userObj = user.toObject();
    delete userObj.password;

    const token = jwt.sign(
      { _id: userObj._id, role: userObj.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= PRODUCTS =================
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= SINGLE PRODUCT =================
app.get("/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ADD PRODUCT =================
app.post(
  "/add-product",
  verifyTokenMiddleWare,
  isAdmin,
  Upload.single("image"),
  async (req, res) => {
    console.log("FILE:", req.file);
    try {
      const product = await Product.create({
        ...req.body,
        image: req.file?.path,
        userId: req.user._id,
      });

      res.status(201).json({ success: true, data: product });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ================= UPDATE PRODUCT =================
app.put(
  "/product/:id",
  verifyTokenMiddleWare,
  isAdmin,
  Upload.single("image"),
  async (req, res) => {
    try {
      const updateData = { ...req.body };

      if (req.file) {
        updateData.image = req.file.path;
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, message: "Product updated", data: product });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ================= DELETE PRODUCT =================
app.delete(
  "/product/:id",
  verifyTokenMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);

      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      res.json({ success: true, message: "Product deleted successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ================= CART =================
app.get("/cart", verifyTokenMiddleWare, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");
    res.json({ success: true, data: cart?.items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ORDERS =================
app.get("/admin/orders", verifyTokenMiddleWare, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/my-orders", verifyTokenMiddleWare, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= PAYMENT UPLOAD (FIXED) =================
app.post(
  "/order/upload-payment/:id",
  verifyTokenMiddleWare,
  PaymentUpload.single("image"),
  async (req, res) => {
    console.log("FILE:", req.file);
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not allowed" });
      }

      // ✅ FIX: Cloudinary URL saved directly
      order.paymentScreenshot = req.file?.path;

      order.paymentStatus = "submitted";

      await order.save();

      res.json({ success: true, data: order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default app;