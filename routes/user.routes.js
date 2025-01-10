const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller")
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", userController.signup);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/profile", authMiddleware.isAuthenticated, userController.getProfile);

router.get("/products", authMiddleware.isAuthenticated, userController.getProfile);
router.get("/products/:id", authMiddleware.isAuthenticated, userController.getProductId);
router.get("/order/:id", authMiddleware.isAuthenticated, userController.createOrder)
router.get("/verify", authMiddleware.isAuthenticated, userController.verifyPayment)


module.exports = router;
