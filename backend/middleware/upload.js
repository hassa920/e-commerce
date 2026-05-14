// middleware/upload.js
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ EXISTING (for products - unchanged)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ✅ NEW: Payment Screenshot Storage
const paymentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "payments", // 🔥 separate folder
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

// ✅ EXISTING upload (unchanged)
const Upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  // 🔥 THIS FIXES BODY PARSING ISSUES
  preservePath: false,
});

// ✅ NEW upload for payments
export const PaymentUpload = multer({ storage: paymentStorage });

export default Upload;