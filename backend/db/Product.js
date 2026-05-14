import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    company: {
      type: String,
      required: true,
      trim: true,
    },

    // ✅ KEEP YOUR LOGIC SAME
    // only improved type
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    stock: {
      type: Number,
      default: 0,
    },

    image: {
      type: String,
      required: true,
    },
  },
  {
    // ✅ ADDED
    timestamps: true,
  }
);

// ✅ KEEP YOUR SEARCH INDEX
productSchema.index({
  name: "text",
  category: "text",
  company: "text",
  description: "text",
});

// ✅ KEEP MODEL NAME SAME
const Product = mongoose.model("Product", productSchema);

export default Product;