const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
});

const TrackingHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
    enum: ["Ordered", "Shipped", "Out for delivery", "Delivered"],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [OrderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    required: true,
  },
  deliveryCharge: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  deliveryDate: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Ordered", "Shipped", "Out for delivery", "Delivered"],
    default: "Ordered",
  },
  trackingHistory: [TrackingHistorySchema],
  orderPlacedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", OrderSchema);
