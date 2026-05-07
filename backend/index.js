import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import "./db/config.js";
import User from "./db/User.js";
import Product from "./db/Product.js";
import Cart from "./db/Cart.js";
import Order from "./db/Order.js";
import Upload from "./middleware/upload.js";
import { isAdmin } from "./middleware/isAdmin.js";
import { verifyTokenMiddleWare } from "./middleware/verifyTokenMiddleWare.js";

dotenv.config();

const app = express();

// ================= CORS =================
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://e-commerce-frontend-liard-two.vercel.app"  // ✅ Replace with your actual frontend URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

// ================= REQUEST LOGGER =================
app.use((req, res, next) => {
  console.log("➡️", req.method, req.url);
  next();
});

app.use("/uploads", express.static("uploads"));

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
    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );

    res.json({ success: true, data: cart?.items || [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/cart/add", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      cart = await Cart.create({
        userId: req.user._id,
        items: [{ productId, quantity }],
      });
    } else {
      const item = cart.items.find(
        (i) => i.productId.toString() === productId
      );

      if (item) item.quantity += quantity;
      else cart.items.push({ productId, quantity });

      await cart.save();
    }

    res.json({ success: true, data: cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/cart/remove/:productId", verifyTokenMiddleWare, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (i) => i.productId.toString() !== req.params.productId
    );

    await cart.save();

    res.json({ success: true, data: cart.items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/cart/clear", verifyTokenMiddleWare, async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.user._id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= UPDATE CART QUANTITY =================
app.put("/cart/update/:productId", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    let cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(
      (i) => i.productId.toString() === req.params.productId
    );

    if (!item) return res.status(404).json({ message: "Item not found in cart" });

    item.quantity = quantity;
    await cart.save();

    res.json({ success: true, message: "Quantity updated", data: cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= UPLOAD PAYMENT SCREENSHOT =================
app.post(
  "/order/upload-payment/:id",
  verifyTokenMiddleWare,
  Upload.single("image"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not allowed" });
      }

      order.paymentScreenshot = req.file
        ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
        : "";

      order.paymentStatus = "submitted";
      order.notifications.push({
        message: "Payment screenshot uploaded",
        type: "payment",
      });

      await order.save();

      res.json({ success: true, message: "Payment uploaded successfully", data: order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

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

// ================= USER PROFILE =================
app.get("/user/profile", verifyTokenMiddleWare, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/user/profile", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, address },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= CHECKOUT =================
app.post("/order/checkout", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId: req.user._id }).populate(
      "items.productId"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }));

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      status: "pending",
      paymentStatus: "pending",
      notifications: [{ message: "Order placed successfully", type: "order" }],
    });

    await Cart.findOneAndDelete({ userId: req.user._id });

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ================= ADMIN PAYMENT APPROVAL =================
app.put(
  "/admin/order/payment/:id",
  verifyTokenMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const { action } = req.body;
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      if (action === "approve") {
        order.paymentStatus = "paid";
        order.status = "processing";
        order.notifications.push({ message: "Payment approved by admin", type: "payment" });
      }

      if (action === "reject") {
        order.paymentStatus = "failed";
        order.status = "cancelled";
        order.notifications.push({ message: "Payment rejected by admin", type: "payment" });
      }

      await order.save();

      res.json({ success: true, message: `Payment ${action}ed`, data: order });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// ================= EXPORT FOR VERCEL =================
export default app;