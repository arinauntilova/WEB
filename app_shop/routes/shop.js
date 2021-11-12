const express = require("express");

const shopController = require("../controllers/shop");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/", shopController.getIndex);

// да
router.get("/products", shopController.getProducts);

// да
router.get("/products/:productId", shopController.getProduct);

// да
router.get("/cart", isAuth, shopController.getCart);

// 
router.post("/cart", isAuth, shopController.postCart);

// 
router.post("/cart-delete-item", isAuth, shopController.postCartDeleteProduct);

// 
router.post("/create-order", isAuth, shopController.postOrder);

// да
router.get("/orders", isAuth, shopController.getOrders);


router.post("/orders/:orderId", isAuth, shopController.getInvoice);

// да
router.get("/orders/:orderId", isAuth, shopController.getInvoice);

module.exports = router;
