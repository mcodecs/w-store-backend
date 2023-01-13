const express = require("express");
const { Category } = require("../models/category");
const route = express.Router();
const { Product } = require("../models/product");
const mongoose = require("mongoose");
const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

// Upload -- multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/upload");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// Get Api
// route.get(`/`, async (req, res) => {
//   const productList = await Product.find().populate("category");
//   if (!productList) {
//     res.statuget/featured/2s(500).json({
//       success: false,
//     });
//   }
//   res.send(productList);
// });

// Get By Id Api
route.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

// Post Api
route.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = Category.findById(req.body.category);
  if (!category) return res.status(400).json("invalid Category");
  const file = req.file;
  if (!file) return res.status(400).json("on image in the request");
  const fileName = file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
  let newProduct = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  newProduct = await newProduct.save();
  if (newProduct) {
    return res.status(201).json(newProduct);
  } else {
    return res.status(500).json({
      message: "cant create product",
      success: false,
    });
  }
});

// Post Update Api
route.put("/:id", uploadOptions.single("image"), async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json("invalid id");
  }
  const category = await Category.findById(req.body.category);
  if (!category) return res.status(400).json("invalid Category");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).json("invalid product");

  const file = req.file;
  let imagaPath;
  if (file) {
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;
    imagaPath = `${basePath}${fileName}`;
  } else {
    imagaPath = product.image;
  }

  const updatedProduct = Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: imagaPath,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    {
      new: true,
    }
  );
  if (!updatedProduct)
    return res.status(500).json("updated product is not updated");
  res.send(updatedProduct);
});

// Post Delete Api
route.delete("/:id", async (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json("invalid id");
  }
  Product.findByIdAndDelete(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "product is deleted" });
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

// Get Count Api
route.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    res.status(400).json({ success: false });
  }
  res.send({
    productCount: productCount,
  });
});

// Get Featured Api
route.get("/get/featured/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const featured = await Product.find({ isFeatured: true }).limit(+count);
  if (!featured) {
    res.status(400).json({ success: false });
  }
  res.send(featured);
});

// Filter Producr By Category Api
route.get("/", async (req, res) => {
  let filter = {};
  if (req.query.category) {
    filter = { category: req.query.category.split(",") };
  }
  const productList = await Product.find(filter).populate("category");
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

// Upload Product Gallery
route.put(
  "/gallery-image/:id",
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).json("invalid product image id");
    }

    const files = req.files;
    let imagePaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/upload/`;

    if (files) {
      files.map((file) => {
        imagePaths.push(`${basePath}${file.fileName}`);
      });
    }

    const updatedProductImages = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      {
        new: true,
      }
    );
    if (!updatedProductImages)
      return res.status(500).json("updated product is not updated");
    res.send(updatedProductImages);
  }
);

module.exports = route;
