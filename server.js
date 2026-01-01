const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const User = require("./models/user");
const Product = require("./models/product");
require("dotenv").config();

const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

//Connect MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res, next) => {
  res.json("hi");
});

//Create User
app.post("/user", async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Create Product
app.post("/product", async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get User
app.get("/user", async (req, res, next) => {
  try {
    const user = await User.find();
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get Product
app.get("/product", async (req, res, next) => {
  const { category, price, name, sort, select } = req.query;
  const queryObject = {};

  try {
    if (category) {
      queryObject.category = category;
    }

    if (price) {
      queryObject.price = price;
    }

    if (name) {
      // queryObject.name = name;  //normal query operator
      queryObject.name = { $regex: name, $options: "i" };
      //1. when we search iphone all iphone names items are shown
      // 2. i = insensetive
    }

    let apiData = Product.find(queryObject).sort("name price"); //SORT
    // let apiData = Product.find(queryObject).select("name price"); //SELECT

    if (sort) {
      // let sortFix = sort.replace(",", " ");
      let sortFix = sort.split(",").join(" ");
      apiData = apiData.sort(sortFix);
    }

    if (select) {
      // let selectFix = select.replace(",", " ");  //
      let selectFix = select.split(",").join(" "); //use multiply filterations
      apiData = apiData.select(selectFix);
    }

    //Pagination
    let page = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || 10;

    let skip = (page - 1) * limit; //Formula

    apiData = apiData.skip(skip).limit(limit); //Skip using formula
    // apiData = apiData.skip(2);   //Skip first 2 products

    console.log(queryObject);

    const product = await apiData;
    // const product = await Product.find(queryObject); //used for a specific product
    // const product = await Product.find(req.query); //req.query is used for filtering and pagination
    // console.log("Products returned:", product);
    res.status(200).json({ product, nbHits: product.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get a specific User
app.get("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Get a specific Product
app.get("/product/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

//Update a specific User
app.put("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Update a specific Product
app.put("/product/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body);
    res.status(200).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Delete a specific User
app.delete("/user/:id", async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Delete a specific Product
app.delete("/product/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

//Delete all Products
app.delete("/product", async (req, res, next) => {
  try {
    const product = await Product.deleteMany();
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on 5000 port");
});
