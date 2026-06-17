const router = require("express").Router();
const authmidle = require("../midleware/auth.jsx");
const Order = require("../model/Order.jsx");
const CartModel = require("../model/Cart.jsx");
const User = require("../model/user.jsx");
const Location = require("../model/Location.jsx");

router.post("/place", authmidle, async (req, res) => {
  const {
    items,
    subtotal,
    tax,
    deliveryCharge,
    totalAmount,
    paymentMethod,
    deliveryDate,
  } = req.body;

  try {
    const orderItemsToSave = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const newOrder = new Order({
      userId: req.user.id,
      items: orderItemsToSave,
      subtotal,
      tax,
      deliveryCharge,
      totalAmount,
      paymentMethod,
      deliveryDate,
      status: "Ordered",
      trackingHistory: [{ status: "Ordered" }],
    });

    await newOrder.save();

    await CartModel.deleteOne({ userId: req.user.id });

    res.json({ msg: "Order placed successfully!", order: newOrder });
  } catch (err) {
    console.error("Error placing order:", err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/my-orders", authmidle, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({
      orderPlacedAt: -1,
    });
    res.json({ orders });
  } catch (err) {
    console.error("Error fetching user orders:", err.message);
    res.status(500).send("Server Error");
  }
});

router.get("/:id", authmidle, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ msg: "Order not found." });
    }
    const user = await User.findById(req.user.id).select("-password");
    const userLocation = await Location.findOne({ userId: req.user.id });

    res.json({ order, user, location: userLocation });
  } catch (err) {
    console.error("Error fetching single order:", err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/cancel/:id", authmidle, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ msg: "Order not found." });
    }

    await Order.deleteOne({ _id: req.params.id });

    res.json({ msg: "Order cancelled successfully!" });
  } catch (err) {
    console.error("Error cancelling order:", err.message);
    res.status(500).send("Server Error");
  }
});

router.put("/update-status/:id", authmidle, async (req, res) => {
  const { newStatus } = req.body;
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!order) {
      return res.status(404).json({ msg: "Order not found." });
    }
    if (!order.trackingHistory.find((h) => h.status === newStatus)) {
      order.status = newStatus;
      order.trackingHistory.push({ status: newStatus });
      await order.save();
    }
    res.json({ msg: "Order status updated successfully!", order });
  } catch (err) {
    console.error("Error updating order status:", err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
