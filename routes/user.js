const { User } = require("../models/user");
const express = require("express");
const mongoose = require("mongoose");
const routes = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Get Api
routes.get("/", async (req, res) => {
  const userList = await User.find().select("-passwordHash");

  if (!userList) {
    res.status(500).json({ success: false });
  }
  res.send(userList);
});

// Get User By Id Api
routes.get("/:id", async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");

  if (!user) {
    return res.status(500).json("there is no user with this id");
  }
  res.send(user);
});

// Post User Api
routes.post("/register", async (req, res) => {
  let createUser = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.password, 1),
    street: req.body.street,
    apartment: req.body.apartment,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
  });

  createUser = await createUser.save();
  if (!createUser) return res.status(400).json("user can not be created");
  res.send(createUser);
});

// Login Api
routes.post("/login", async (req, res) => {
  const secret = process.env.SECRET;
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(400).json("user is not found");
  }

  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin,
      },
      secret,
      { expiresIn: "1d" }
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("password is wrong");
  }
});

// User Count Api
routes.get("/get/count", async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    res.status(400).json({ success: false });
  }
  res.send({ userCount: userCount });
});

// Delet User Api
routes.delete("/:id", async (req, res) => {
  // if (mongoose.isValidObjectId(req.params.id)) {
  //   res.status(400).json("invalid id");
  // }
  User.findByIdAndRemove(req.params.id)
    .then((user) => {
      if (user) {
        return res
          .status(200)
          .json({ success: true, message: "user is deleted" });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "cannt find the category" });
      }
    })
    .catch((err) => {
      return res.status(500).json({ success: false, error: err });
    });
});
module.exports = routes;
