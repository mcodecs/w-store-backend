const { Category } = require("../models/category");
const express = require("express");
const mongoose = require("mongoose");

const route = express.Router();

// Get Api
route.get("/", async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(404).json({
      success: false,
    });
  }
  res.status(200).send(categoryList);
});

// Get By Id Api
route.get("/:id", async (req, res) => {
  const categoryList = await Category.findById(req.params.id);
  if (!categoryList) {
    res.status(404).json({
      success: false,
    });
  }
  res.status(200).send(categoryList);
});

// Post Api
route.post("/", async (req, res) => {
  let addCategory = Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
  });

  addCategory = await addCategory.save();

  if (!addCategory)
    return res.status(404).json("the category connt be created");
  res.send(addCategory);
});

// Delete Api
route.delete("/:id", (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "category is deleted" });
      } else
        return res
          .status(404)
          .json({ success: false, message: "cannt find the category" });
    })
    .catch((err) => {
      return res.status(400).json({ success: false, error: err });
    });
});

// Update Api
route.put("/:id", async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      color: req.body.color,
      icon: req.body.icon,
    },
    {
      new: true,
    }
  );
  if (!category) return res.status(500).json("category is not update");
  res.send(category);
});

module.exports = route;
