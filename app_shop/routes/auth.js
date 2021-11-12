const express = require("express");
const { body } = require("express-validator/check");

const authController = require("../controllers/auth");

const User = require("../models/user");

const router = express.Router();

router.get("/signin", authController.getSignin);

router.post(
  "/signin",
  [
    body("email", "Please enter a valid email.").isEmail().normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 8 characters."
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postSignin
);

router.post("/signout", authController.postSignout);

router.get("/signup", authController.getSignup);
router.get("/admin/registration", authController.getRegistration);


router.post(
  "/signup",
  [
    body("email", "Please enter a valid email.")
      .isEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("User with given email already exists.");
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Please enter a password with only numbers and text and at least 8 characters."
    )
      .isLength({ min: 8 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords are not equal");
        }
        return true;
      }),
  ],
  authController.postSignup
);

module.exports = router;
