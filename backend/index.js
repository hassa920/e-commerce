import express from 'express'
import cors from 'cors'
import './db/config.js'
import User from './db/User.js'
import Product from './db/Product.js'
import Upload from './middleware/upload.js'
import mongoose from 'mongoose'
import { isAdmin } from './middleware/isAdmin.js'
import { verifyTokenMiddleWare } from './middleware/verifyTokenMiddleWare.js'
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Cart from './db/Cart.js'
import Order from './db/Order.js'
import bcrypt from 'bcryptjs';
dotenv.config();
const app = express();
const port = process.env.PORT || 8000;

const allowedOrigins = [
  "https://deploy-mern-frontend-delta.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, origin);
    } else {
      return callback(new Error("CORS not allowed for: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// ==================== ROUTES ====================

// ✅ Public — no auth needed
app.get("/", (req, res) => {
  res.send("API is working");
});

// ✅ Public — anyone can register or login



app.post("/register", async (req, res) => {
  console.log("REGISTER API HIT");
  try {
    const { name, email, password, adminKey } = req.body;

    let role = "user";

    if (adminKey) {
      if (adminKey !== process.env.ADMIN_SECRET) {
        return res.status(403).json({ message: "Invalid admin key" });
      }
      const existingAdmin = await User.findOne({ role: "admin" });
      if (existingAdmin) {
        return res.status(400).json({ message: "An admin already exists" });
      }
      role = "admin";
    }

    // ✅ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    let user = await User.create({ name, email, password: hashedPassword, role });
    let userObj = user.toObject();
    delete userObj.password;

    const token = jwt.sign(
      { user: { _id: userObj._id, role: userObj.role } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({ auth: token, user: userObj });

  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ result: "user not found" });
  }

  try {
    // ✅ Find by email only — don't include password in query
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ result: "user not found" });
    }

    // ✅ Compare entered password with hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ result: "Invalid email or password" });
    }

    // ✅ Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    const token = jwt.sign(
      { user: { _id: userObj._id, role: userObj.role } },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({ auth: token, user: userObj });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});
// ✅ Public — anyone can browse products
app.get("/products", async (req, res) => {
  try {
    const product = await Product.find();
    return res.status(200).json({
      success: true,
      data: product.length ? product : []
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/product/:id", async (req, res) => {
  try {
    let result = await Product.findById(req.params.id);
    if (result) {
      return res.status(200).json({ success: true, data: result });
    } else {
      return res.status(404).json({ success: false, message: "Record not found." });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: "Invalid ID or server error." });
  }
});

// ✅ Admin only — add, update, delete products
app.post(
  "/add-product",
  verifyTokenMiddleWare,
  isAdmin,
  Upload.single("image"),
  async (req, res) => {
    const { name, price, category, userId, company } = req.body;

    if (!name || !price || !category || !userId || !company) {
      return res.status(400).json({ success: false, message: "Required fields are missing" });
    }

    try {
      const product = await Product.create({
        name, price, category, userId, company,
        image: req.file ? req.file.path : null
      });
      return res.status(201).json({ success: true, message: "Product created Successfully", data: product });
    } catch (err) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
);

app.put(
  "/product/:id",
  verifyTokenMiddleWare,
  isAdmin,
  Upload.single("image"),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).send({ message: "Product not found" });

      const updatedData = {
        name: req.body.name,
        price: req.body.price,
        category: req.body.category,
        company: req.body.company,
        userId: req.body.userId,
      };

      if (req.file) {
        updatedData.image = req.file.path;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        req.params.id,
        { $set: updatedData },
        { new: true }
      );

      res.status(200).send({ success: true, message: "Product updated successfully", data: updatedProduct });
    } catch (err) {
      res.status(500).send({ error: err.message });
    }
  }
);

app.delete(
  "/product/:id",
  verifyTokenMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const id = req.params.id;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
      }

      const result = await Product.findByIdAndDelete(id);

      if (!result) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }

      return res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
);


// ==================== CART ROUTES ====================

// ✅ Add to cart
app.post("/cart/add", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "Product ID is required" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // ✅ No cart yet — create one
      cart = await Cart.create({
        userId,
        items: [{ productId, quantity }]
      });
    } else {
      // ✅ Cart exists — check if product already in cart
      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );

      if (existingItem) {
        // ✅ Already in cart — increase quantity
        existingItem.quantity += quantity;
      } else {
        // ✅ New product — push to items
        cart.items.push({ productId, quantity });
      }

      await cart.save();
    }

    return res.status(200).json({ success: true, message: "Added to cart", data: cart });

  } catch (err) {
    console.error("Add to cart error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get cart (populated)
app.get("/cart", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data: cart.items });

  } catch (err) {
    console.error("Get cart error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Remove item from cart
app.delete("/cart/remove/:productId", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.params;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }

    // ✅ Filter out the removed product
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );

    await cart.save();

    return res.status(200).json({ success: true, message: "Item removed", data: cart.items });

  } catch (err) {
    console.error("Remove from cart error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Clear entire cart (helper used after checkout)
app.delete("/cart/clear", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    await Cart.findOneAndDelete({ userId });
    return res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==================== ORDER ROUTES ====================

// ✅ Checkout — create order from cart
app.post("/order/checkout", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;
    const { paymentMethod = "COD" } = req.body;

    // ✅ Get cart with populated product prices
    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    // ✅ Build order items and calculate total
    let totalAmount = 0;
    const orderItems = cart.items.map((item) => {
      const price = item.productId?.price || 0;
      totalAmount += price * item.quantity;
      return {
        productId: item.productId._id,
        quantity: item.quantity,
        price
      };
    });

    // ✅ Create the order
    const order = await Order.create({
      userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
      status: "pending",
      notifications: [
        {
          message: `Order placed successfully via ${paymentMethod}`,
          type: "order_placed"
        }
      ]
    });

    // ✅ Clear cart after order
    await Cart.findOneAndDelete({ userId });

    // 🔥 Dispatch cart update
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order
    });

  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get all orders (admin)
app.get("/admin/orders", verifyTokenMiddleWare, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: orders });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get logged-in user's orders
app.get("/my-orders", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate("items.productId", "name price image")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: orders });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Update order status (admin)
app.patch("/admin/order/:id/status", verifyTokenMiddleWare, isAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: { status },
        $push: {
          notifications: {
            message: `Your order status has been updated to: ${status}`,
            type: "status_update"
          }
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    return res.status(200).json({ success: true, message: "Order status updated", data: order });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Get user notifications (from their orders)
app.get("/my-notifications", verifyTokenMiddleWare, async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });

    // ✅ Flatten all notifications from all orders
    const notifications = orders.flatMap((order) =>
      order.notifications.map((n) => ({
        ...n.toObject(),
        orderId: order._id,
        orderStatus: order.status
      }))
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.status(200).json({ success: true, data: notifications });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});
// ✅ Upload payment screenshot (user)
app.post("/order/upload-payment/:id", verifyTokenMiddleWare, Upload.single("image"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // ✅ Make sure the order belongs to the logged-in user
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No screenshot uploaded" });
    }

    // ✅ Save Cloudinary URL + update payment status
    order.paymentScreenshot = req.file.path;
    order.paymentStatus = "submitted";

    order.notifications.push({
      message: "Payment screenshot submitted. Waiting for admin approval.",
      type: "info"
    });

    await order.save();

    return res.status(200).json({ success: true, message: "Payment screenshot uploaded", data: order });

  } catch (err) {
    console.error("Upload payment error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Approve or reject payment (admin only)
app.put("/admin/order/payment/:id", verifyTokenMiddleWare, isAdmin, async (req, res) => {
  try {
    const { action } = req.body; // "approve" or "reject"

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action. Use 'approve' or 'reject'" });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (action === "approve") {
      order.paymentStatus = "paid";
      order.status = "processing";
      order.notifications.push({
        message: "Your payment has been approved! Your order is now being processed.",
        type: "success"
      });
    } else {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      order.notifications.push({
        message: "Your payment was rejected. Please contact support or reorder.",
        type: "error"
      });
    }

    await order.save();

    return res.status(200).json({ success: true, message: `Payment ${action}d successfully`, data: order });

  } catch (err) {
    console.error("Payment action error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});
// ==================== START SERVER ====================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});