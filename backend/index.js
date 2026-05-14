import express from "express";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cors from "cors";
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



app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://e-commerce-frontend-liard-two.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options(/.*/, cors());

app.use(express.json());



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

// ================= ADD TO CART =================
app.post("/cart/add", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    // VALIDATION
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID required",
      });
    }

    // CHECK PRODUCT EXISTS
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // FIND USER CART
    let cart = await Cart.findOne({
      userId: req.user._id,
    });

    // CREATE CART
    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: [],
      });
    }

    // FIND EXISTING ITEM
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    // UPDATE QTY
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity || 1;
    } else {
      cart.items.push({
        productId,
        quantity: quantity || 1,
      });
    }

    await cart.save();

    const updatedCart = await Cart.findOne({
      userId: req.user._id,
    }).populate("items.productId");

    res.json({
      success: true,
      message: "Added to cart",
      data: updatedCart.items,
    });
  } catch (err) {
    console.log("ADD CART ERROR:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


// ================= GET USER CART =================
app.get("/cart", verifyTokenMiddleWare, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
    }).populate("items.productId");

    res.json({
      success: true,
      data: cart?.items || [],
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



// ================= UPDATE CART ITEM QUANTITY =================
app.put("/cart/update/:productId", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { quantity } = req.body;

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    const cart = await Cart.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    const item = cart.items.find(
      (i) => i.productId.toString() === req.params.productId
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    item.quantity = quantity;

    await cart.save();

    await cart.populate("items.productId");

    res.json({
      success: true,
      message: "Cart updated",
      data: cart.items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



// ================= REMOVE SINGLE ITEM FROM CART =================
app.delete("/cart/remove/:productId", verifyTokenMiddleWare, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await cart.save();

    await cart.populate("items.productId");

    res.json({
      success: true,
      message: "Item removed from cart",
      data: cart.items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



// ================= CLEAR WHOLE CART =================
app.delete("/cart/clear", verifyTokenMiddleWare, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
    });

    if (!cart) {
      return res.json({
        success: true,
        message: "Cart already empty",
      });
    }

    cart.items = [];

    await cart.save();

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});



// ================= GET CART TOTAL =================
app.get("/cart/total", verifyTokenMiddleWare, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
    }).populate("items.productId");

    if (!cart) {
      return res.json({
        success: true,
        totalItems: 0,
        totalAmount: 0,
      });
    }

    let totalItems = 0;
    let totalAmount = 0;

    cart.items.forEach((item) => {
      totalItems += item.quantity;

      totalAmount +=
        Number(item.productId?.price || 0) * item.quantity;
    });

    res.json({
      success: true,
      totalItems,
      totalAmount,
      data: cart.items,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ================= ORDERS =================
// =====================================================
// ================= ORDER APIs ========================
// =====================================================

// ================= CHECKOUT (CREATE ORDER FROM CART) =================
app.post("/order/checkout", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { paymentMethod } = req.body;

    // 1. Get user's cart
    const cart = await Cart.findOne({ userId: req.user._id }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // 2. Build order items + total
    const orderItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      if (!item.productId) continue;

      const price = Number(item.productId.price) || 0;

      orderItems.push({
        productId: item.productId._id,
        quantity: item.quantity,
        price,
      });

      totalAmount += price * item.quantity;
    }

    // 3. Create order
    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || "COD",
      status: "pending",
      paymentStatus: paymentMethod === "COD" ? "pending" : "pending",
      notifications: [
        {
          message: "Order placed successfully",
          type: "order_created",
        },
      ],
    });

    // 4. Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (err) {
    console.log("CHECKOUT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ================= GET LOGGED-IN USER'S ORDERS =================
app.get("/my-orders", verifyTokenMiddleWare, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= GET SINGLE ORDER =================
app.get("/order/:id", verifyTokenMiddleWare, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.productId");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // user can only see own order, admin can see all
    if (
      order.userId.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= CANCEL ORDER (USER) =================
app.put("/order/cancel/:id", verifyTokenMiddleWare, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    if (["shipped", "delivered", "cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is ${order.status}`,
      });
    }

    order.status = "cancelled";
    order.notifications.push({
      message: "Order cancelled by user",
      type: "order_cancelled",
    });

    await order.save();

    res.json({ success: true, message: "Order cancelled", data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= UPLOAD PAYMENT SCREENSHOT =================
app.post(
  "/order/upload-payment/:id",
  verifyTokenMiddleWare,
  PaymentUpload.single("image"),
  async (req, res) => {
    try {
      const order = await Order.findById(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      if (order.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Not allowed" });
      }

      order.paymentScreenshot = req.file?.path;
      order.paymentStatus = "submitted";
      order.notifications.push({
        message: "Payment screenshot uploaded",
        type: "payment_submitted",
      });

      await order.save();

      res.json({ success: true, data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// =====================================================
// ============= ADMIN ORDER APIs ======================
// =====================================================

// ================= GET ALL ORDERS (ADMIN) =================
app.get("/admin/orders", verifyTokenMiddleWare, isAdmin, async (req, res) => {
  try {
    console.log("ADMIN ORDERS HIT");

    const orders = await Order.find()
      .populate({
        path: "items.productId",
        model: "Product",
        options: { strictPopulate: false }
      })
      .populate({
        path: "userId",
        model: "User",
        select: "name email",
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (err) {
    console.log("ADMIN ORDERS ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ================= UPDATE ORDER STATUS (ADMIN) =================
app.put(
  "/admin/order/status/:id",
  verifyTokenMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const { status } = req.body;

      const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"];
      if (!allowed.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status",
        });
      }

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      order.status = status;
      order.notifications.push({
        message: `Order status updated to ${status}`,
        type: "status_update",
      });

      await order.save();

      res.json({ success: true, message: "Status updated", data: order });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ================= UPDATE PAYMENT STATUS (ADMIN) =================
app.put(
  "/admin/order/payment-status/:id",
  verifyTokenMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const { paymentStatus } = req.body;

      const allowed = ["pending", "submitted", "paid", "failed"];
      if (!allowed.includes(paymentStatus)) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment status",
        });
      }

      const order = await Order.findById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false });
      }

      order.paymentStatus = paymentStatus;

      // 🔥 NOTIFICATION FIXED
      order.notifications.push({
        message:
          paymentStatus === "paid"
            ? "Your payment has been approved 🎉"
            : paymentStatus === "failed"
            ? "Your payment was rejected ❌"
            : "Payment status updated",
        type: "payment_status_update",
        createdAt: new Date(),
      });

      await order.save();

      res.json({
        success: true,
        message: "Payment status updated",
        data: order,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ================= DELETE ORDER (ADMIN) =================
app.delete(
  "/admin/order/:id",
  verifyTokenMiddleWare,
  isAdmin,
  async (req, res) => {
    try {
      const order = await Order.findByIdAndDelete(req.params.id);

      if (!order) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      res.json({ success: true, message: "Order deleted" });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

// ================= PROFILE APIs =================

// GET PROFILE
app.get("/user/profile", verifyTokenMiddleWare, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// UPDATE PROFILE
app.put("/user/profile", verifyTokenMiddleWare, async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,
        phone,
        address,
      },
      {
        new: true,
      }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});
app.listen(8000,()=>{
  console.log("Server started")
})