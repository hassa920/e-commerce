import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    price: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema(
{
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },

    items: [orderItemSchema],

    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },

    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending"
    },

    paymentMethod: {
        type: String,
        enum: ["COD", "JAZZCASH", "EASYPAISA"],
        default: "COD"
    },

    paymentStatus: {
        type: String,
        enum: ["pending", "submitted", "paid", "failed"],
        default: "pending"
    },

    paymentScreenshot: {
        type: String,
        default: ""
    },

    // ✅ FIXED NOTIFICATIONS
  notifications: [
    {
        message: { type: String },
        type: { type: String },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }
]

},
{
    timestamps: true
});

export default mongoose.model("orders", orderSchema);