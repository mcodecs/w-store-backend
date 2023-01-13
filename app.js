const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const errorHandler = require("./helper/error-handler");
const authJwt = require("./helper/jwt");

require("dotenv/config");

const app = express();
app.use(cors());
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use('/public/upload', express.static(__dirname + '/public/upload'))
app.use(errorHandler);

const api = process.env.API_URL;

const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const userRoutes = require("./routes/user");
const orderRouts = require("./routes/order");

// Routes
app.use(`${api}/products`, productRoutes);
app.use(`${api}/categorys`, categoryRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/orders`, orderRouts);

// Database Connection
mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "eshop-database",
  })
  .then(() => {
    console.log("Database is connect successfully");
  })
  .catch((err) => {
    console.log(err);
  });

// Server
app.listen(4000, () => {
  console.log("server is runnig on http://localhost:4000");
});
