import express from 'express'
import cors from 'cors'
import './db/config.js'
import User from './db/User.js'
import Product from './db/Product.js'
import Upload from './middleware/upload.js'
import mongoose from 'mongoose'

const app = express();
const port = process.env.PORT || 8000;

// ✅ CORS — handles everything including preflight
const allowedOrigins = [
  "https://deploy-mern-frontend-delta.vercel.app",
  "http://localhost:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, mobile apps, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, origin); // ✅ echo back exact origin
    } else {
      return callback(new Error("CORS not allowed for: " + origin));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));


app.use(express.json());
// app.use('/uploads', express.static('uploads'));


// ==================== ROUTES ====================

app.get("/", (req, res) => {
  res.send("API is working");
});

app.post("/register", async (req, res) => {
  console.log("REGISTER API HIT");
  try {
    let user = await User.create(req.body);
    let result = user.toObject();
    delete result.password;
    return res.status(201).send(result);
  } catch (err) {
    return res.status(400).send({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  if (req.body.email && req.body.password) {
    let user = await User.findOne(req.body).select("-password");
    if (user) {
      return res.send(user);
    } else {
      return res.send({ result: "user not found" });
    }
  } else {
    return res.send({ result: "user not found" });
  }
});

app.post("/add-product", Upload.single("image"), async (req, res) => {
  const { name, price, category, userId, company } = req.body;

  if (!name || !price || !category || !userId || !company) {
    return res.status(400).json({ success: false, message: "Required fields are missing" });
  }

  try {
    const product = await Product.create({
      name, price, category, userId, company,
      image: req.file ? req.file.path : null  // ✅ This is now a Cloudinary URL
    });

    return res.status(201).json({ success: true, message: "Product created Successfully", data: product });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

app.get("/products", async (req, res) => {
  try {
    const product = await Product.find();

    if (!product || product.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      data: product
    });

  } catch (err) {
    console.log("Product not found", err);
    return res.status(500).json({
      success: false,
      message: "internal server error"
    });
  }
});

app.delete("/product/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const result = await Product.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully"
    });

  } catch (error) {
    console.error("DELETE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.get("/product/:id", async (req, res) => {
  console.log(req.params.id)
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
app.put("/product/:id", Upload.single("image"), async (req, res) => {
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

    // ✅ Only replace image if a new one was uploaded
    if (req.file) {
      updatedData.image = req.file.path; // new Cloudinary URL
    }
    // If no req.file → image field is untouched, old image stays

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updatedData },
      { new: true }
    );

    res.status(200).send({ success: true, message: "Product updated successfully", data: updatedProduct });

  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});
// ==================== START SERVER ====================
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
