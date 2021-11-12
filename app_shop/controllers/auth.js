const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator/check");

const User = require("../models/user");
const userRep = require("../repositories/IUserRep")

function createUserRep() {
  return new userRep();
}

exports.getSignin = (req, res, next) => {
  res.render("auth/signin", {
    pageTitle: "Sign in",
    path: "/signin",
    errorMessage: "",
    oldInput: { email: "", password: "" },
    validationErrors: [],
  });
};

// +- YES
exports.postSignin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signin", {
      pageTitle: "Sign in",
      path: "/signin",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password },
      validationErrors: errors.array(),
    });
  }

  let user_rep = createUserRep();
  user_rep.findByEmail(email)
    .then((user) => {
      if (!user) {
        return res.status(422).render("auth/signin", {
          pageTitle: "Sign in",
          path: "/signin",
          errorMessage: "User with given email is not found",
          oldInput: { email: email, password: password },
          validationErrors: [{ param: "email" }],
        });
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatched) => {
          if (isMatched) {
            req.session.isSignedIn = true;
            req.session.user = user;
            return res.redirect("/");
          }
          return res.status(422).render("auth/signin", {
            pageTitle: "Sign in",
            path: "/signin",
            errorMessage: "Invalid password",
            oldInput: { email: email, password: password },
            validationErrors: [{ param: "password" }],
          });
        })
        .catch((err) => {
          console.log(err);
          return res.status(422).render("auth/signin", {
            pageTitle: "Sign in",
            path: "/signin",
            errorMessage: "Invalid email or password",
            oldInput: { email: email, password: password },
            validationErrors: [{ param: "email" }, { param: "password" }],
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postSignout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  const errors = validationResult(req);
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Sign up",
    path: "/signup",
    errorMessage: message,
    oldInput: { email: "", password: "", confirmPassword: "" },
    validationErrors: errors.array(),
  });
};

exports.getRegistration = (req, res, next) => {
  let message = req.flash("error");
  const errors = validationResult(req);
  if (message.length) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/registration", {
    pageTitle: "Sign up",
    path: "/signup",
    errorMessage: message,
    oldInput: { email: "", role: "admin", password: "", confirmPassword: "" },
    validationErrors: errors.array(),
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  // console.log("magic");
  // console.log(req.body);
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const country = req.body.country;
  console.log("NEEEED", req.body.date_birth);
  const date_birth = new Date(req.body.date_birth).toISOString();
  console.log("NEEEED  !!! ", date_birth);

  // todo проверка что пользователь-админ создаёт роль отличную от клиетна
  const role = (typeof req.body.role != "undefined") ? req.body.role : "client";
  // console.log(role);
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      pageTitle: "Sign up",
      path: "/signup",
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password, confirmPassword: req.body.confirmPassword },
      validationErrors: errors.array(),
    });
  }
  return bcrypt
    .hash(password, 12)
    .then((hashedPass) => {
      const newUser = new User({ email: email, role: role, password: hashedPass, cart: { items: [] },
                                  name: {firstname: firstname, lastname: lastname}, date_birth: date_birth, country: country  });
      return newUser.save();
    })
    .then(() => {
      res.redirect("/signin");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};
