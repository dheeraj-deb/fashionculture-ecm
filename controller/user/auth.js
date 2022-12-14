const crypto = require("crypto");
const nodeMailer = require("nodemailer");
require("dotenv").config();
const db = require("../../util/database");
const collection = require("../../util/collection").collection;
const user = require("../../model/User");
const bcrypt = require("bcrypt");

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: "dheerajknight81@gmail.com",
    pass: process.env.NODEMAILER_PASS,
  },
});

exports.getLogin = (req, res) => {
  if (req.session.isUserLoggedIn) {
    return res.redirect("/");
  }
  res.render("user/login.hbs", {
    isAuth: true,
    layout: "user-layout",
    errorMessage: req.flash("error"),
  });
};

exports.postLogin = (req, res) => {
  console.log(req.body);
  user
    .userSignin(req.body)
    .then((response) => {
      // const data = response.data;
      if (response && response.data) {
        req.session.isUserLoggedIn = true;
        req.session.user = response.data;
        return req.session.save((err) => {
          if (err) throw err;
          res.redirect("/");
        });
      }
      console.log("not valid");
      req.flash(
        "error",
        "The email address or password that you've entered doesn't match any account. Sign up for an account."
      );
      res.redirect("/user_signin");
    })
    .catch((err) => {
      console.log(err);
      if (err) {
        res.redirect("/user_signin");
      }
    });
};

// signUp
exports.getSignUp = (req, res) => {
  if (req.session.isUserLoggedIn) {
    return res.redirect("/");
  }
  res.render("user/signup", {
    isAuth: true,
    errorMessage: req.flash("error"),
    layout: "user-layout",
  });
};

exports.postSignUp = (req, res) => {
  const { f_name, l_name, email, mobile, password } = req.body;
  req.body.isBlocked = false;
  user.userSignUp(req.body).then((response) => {
    if (response) {
      req.flash("error", "E-Mail exists already, please pick a diffrent one");
      res.redirect("/user_registration");
    } else {
      res.redirect("/user_signin");

      transporter.sendMail({
        to: email,
        subject: "FashionCulture",
        html: `
            <p>Hai ${
              f_name + " " + l_name
            } You have successfully registered in Fashioncluture.ml <br> Please login to browse your products</p>`,
      });
    }
  });
};

// reset-password

exports.getReset = (req, res) => {
  res.render("user/reset", {
    user: true,
    layout: "user-layout",
    errorMessage: req.flash("error"),
  });
};

exports.postReset = (req, res) => {
  user.createToken(req.body).then((response) => {
    if (response && response.response) {
      const { token } = response;
      const user = response.response;
      res.redirect("/");

      transporter.sendMail({
        to: user.email,
        from: "dheerajknight81@gmail.com",
        subject: "Reset Password",
        html: `
            <p>Hai ${
              user.f_name + " " + user.l_name
            } You requested a password reset</p>
            <p>Please click this <a href ="http://localhost:3000/reset_pass/${token}">Link</a> to set a new pasword.</p>
            `,
      });
    } else {
      req.flash("error", "email not found!");
      res.redirect("/reset_pass");
    }
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  user.getNewPass(token).then((response) => {
    // console.log(response.uid);
    if (response) {
      return res.render("user/new-password", {
        uId: response._id,
        layout: "user-layout",
      });
    }
    res.redirect("/reset_pass");
  });
};

exports.postNewPassword = (req, res) => {
  user
    .resetPass(req.body)
    .then((response) => {
      if (response) {
        // console.log("res", response);
        res.redirect("/user_signin");
      }
    })
    .catch((err) => {});
};

exports.authenticateGoogleOauth = {};

exports.googleAuthSuccess = async (req, res, next) => {
  console.log(req.user);
  if (!req.user) res.redirect("/auth/callback/failure");
  else
    try {
      const verifyUser = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ userId: req.user.id });
      if (verifyUser) {
        req.session.user = verifyUser;
        req.session.isUserLoggedIn = true;
        return res.redirect("/");
      }
      const user = {
        userId: req.user.id,
        f_name: req.user.given_name,
        l_name: req.user.family_name,
        email: req.user.email,
      };
      const createUser = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .insertOne(user);
      console.log(createUser);
      if (createUser) {
        const user = {
          _id: createUser.insertedId,
          userId: req.user.id,
          f_name: req.user.given_name,
          l_name: req.user.family_name,
          email: req.user.email,
        };
        req.session.isUserLoggedIn = true;
        req.session.user = user;
        res.redirect("/");

        transporter.sendMail({
          to: email,
          subject: "FashionCulture",
          html: `
              <p>Hai ${
                f_name + " " + l_name
              } You have successfully registered in Fashioncluture.ml <br> Please login to browse your products</p>`,
        });
      }
    } catch (error) {
      next(error);
    }
};

// logout ---
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect("/");
  });
};
