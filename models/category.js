const mongoose = require('mongoose');

// Schema
const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
  },
});

// Model
exports.Category = mongoose.model("Category", categorySchema);
