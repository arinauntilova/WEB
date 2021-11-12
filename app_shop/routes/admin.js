const express = require("express");
const { body } = require("express-validator/check");

const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/is-auth");

// Router позволяет определить дочерние подмаршруты со своими обработчиками относительно некоторого главного маршрута.
const router = express.Router();

// 
router.get("/products", isAuth, adminController.getProducts);

// 
router.get("/add-product", isAuth, adminController.getAddProduct);

router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat().trim(),
    body("description").isLength({ min: 3, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postAddProduct
);

// 
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);

router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("price").isFloat().trim(),
    body("description").isLength({ min: 3, max: 400 }).trim(),
  ],
  isAuth,
  adminController.postEditProduct
);

// 
router.delete("/product/:productId", isAuth, adminController.deleteProduct);  





// ===== аналитика =======
router.get("/analytics", isAuth, adminController.getAnalytics);

router.post("/analytics", isAuth, adminController.postAnalytics);

router.get("/analytics/graph_bill", isAuth, adminController.getGraph_avg_bill);

router.get("/analytics/graph_benefit", isAuth, adminController.getGraph_benefit);

router.get("/analytics/graph_popgenres", isAuth, adminController.getGraph_popgenres);

router.get("/analytics/graph_nonpopgenres", isAuth, adminController.getGraph_nonpopgenres);

router.get("/analytics/graph_providers", isAuth, adminController.getGraph_providers);

router.get("/analytics/graph_titles", isAuth, adminController.getGraph_titles);

module.exports = router;
