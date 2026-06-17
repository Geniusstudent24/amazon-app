const express = require("express");
const router = express.Router();
const data = require("../data/db.json");

router.get("/products", (req, res) => {
  let products = data.products;
  if (req.query.category) {
    products = products.filter(
      (product) => product.category === req.query.category
    );
  }

  if (req.query._limit) {
    products = products.slice(0, Number(req.query._limit));
  }

  res.json(products);
});

router.get("/products/:id", (req, res) => {
  const id = Number(req.params.id);

  const product = data.products.find(
    (product) => product.id === id
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  res.json(product);
});

router.get("/categories", (req, res) => {
  res.json(data.categories);
});

module.exports = router;