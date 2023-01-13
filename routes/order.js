const { Order } = require("../models/order");
const express = require("express");
const { OrderItems } = require("../models/order-items");
const routes = express.Router();

// All Order
routes.get("/", async (req, res) => {
  const orderList = await Order.find()
    .populate("user")
    .sort({ deteOrderd: -1 });

  if (!orderList) {
    res.status(400).json({ success: false });
  }
  res.send(orderList);
});

// Order By ID
routes.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });
  console.log("log", req.params.id);
  if (!order) {
    res.status(400).json({ success: false });
  }
  res.send(order);
});

// Create Order
routes.post("/", async (req, res) => {
  const orderItemsId = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItems({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });

      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdResolved = await orderItemsId;

  const totalPrices = Promise.all(
    orderItemsIdResolved.map(async (orderItemId) => {
      console.log(orderItemId);
      const orderItem = await OrderItems.findById(orderItemId).populate(
        "product",
        "price"
      );
      console.log(orderItem);
      const totalPrice = orderItem.product.price * orderItem.quantity;

      return totalPrice;
    })
  );
  const totalPrice = (await totalPrices).reduce((a, b) => a + b, 0);

  let createOrder = new Order({
    orderItems: orderItemsIdResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  createOrder = await createOrder.save();
  if (!createOrder) return res.status(201).json("the order is created");
  res.send(createOrder);
});

// Update Order
routes.put("/:id", async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    {
      new: true,
    }
  );

  if (!order) return res.status(400).send("Order status is updated");
  res.send(order);
});

// Delete Order
routes.delete("/:id", (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItems.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "order is deleted" });
      } else
        return res
          .status(404)
          .json({ success: false, message: "cannt find the order" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// Get Total Sales
routes.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: "$totalPrice" } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("the order sales con not be generated");
  }

  res.send({ totalSales: totalSales.pop().totalSales });
});

// Get Order Count
routes.get("/get/count", async (req, res) => {
  const orderCount = await Order.countDocuments({});
  if (!orderCount) {
    return res.status(500).json({ success: false });
  }

  res.send({ orderCount: orderCount });
});

// Get Order For specific User
routes.get("/get/userorders/:userid", async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });

  if (!userOrderList) {
    return res.status(500).json({ success: false });
  }
  res.send(userOrderList);
});

module.exports = routes;
