const mongoose = require("mongoose");

// Order Items Schema
const orderItemsSchema = mongoose.Schema({
    quantity: {
        type: Number,
        required: true
    },
    product:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    }
});

orderItemsSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderItemsSchema.set("toJSON", {
  virtuals: true,
});

// Model 
exports.OrderItems = mongoose.model('OrderItems', orderItemsSchema)