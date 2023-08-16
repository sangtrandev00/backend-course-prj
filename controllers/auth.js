const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const crypto = require("crypto");
const sendmail = require("../utils/sendmail");
const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const mongoose = require("mongoose");
const customError = require("../utils/error");

var admin = require("firebase-admin");

var serviceAccount = require("../firebase/serviceAccountKey.json");
// const { BACKEND_URL } = require("../../frontend/src/constant/backend-domain");

const { BACKEND_URL } = require("../config/backend-domain");
const RevokedToken = require("../models/RevokedToken");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.signup = async (req, res, next) => {
  const { email, name, password, role, avatar, providerId, fbUserId } = req.body;

  //   No validate yet!
  try {
    const user = await User.findOne({ email, providerId });

    if (user) {
      const error = new customError("email", "Email already existed at website!");
      error.statusCode = 422;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      email,
      name,
      password: hashedPassword,
      role,
      avatar,
      providerId: providerId || "local",
    };

    if (fbUserId) {
      console.log("social user id: ", fbUserId);
      userData.fbUserId = fbUserId;
    }

    const newUser = new User(userData);

    const result = await newUser.save();

    res.status(201).json({
      message: "User created successfully!",
      userId: result._id,
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.googleLogin = async (req, res, next) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    console.log("detoken: ", decodedToken);

    const email = decodedToken.email;

    // Check if the email is registered in your application
    const userDoc = await User.findOne({ email, providerId: "google.com" });

    if (!userDoc) {
      // Handle the case when the user is not registered
      return res.status(401).json({ message: "User not registered!" });
    }

    // Generate a JWT token for the user
    const jwtToken = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString() },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    // Save login Token to database

    userDoc.loginToken = jwtToken;
    userDoc.loginTokenExpiration = Date.now() + 60 * 60 * 1000;
    await userDoc.save();
    res.status(200).json({
      message: "Login successful!",
      token: jwtToken,
      userId: userDoc._id.toString(),
    });
  } catch (error) {
    // Handle errors

    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.facebookLogin = async (req, res, next) => {
  const { name, id } = req.body;

  try {
    const userDoc = await findOne({ socialUserId: id, providerId: "facebook" });

    if (!userDoc) {
      return res.status(401).json({ message: "User not registered!" });
    }

    // Generate a JWT token for the user
    const jwtToken = jwt.sign({ userId: userDoc._id.toString() }, "somesupersecret", {
      expiresIn: "1h",
    });

    // Save login Token to database

    userDoc.loginToken = jwtToken;
    userDoc.loginTokenExpiration = Date.now() + 60 * 60 * 1000;
    await userDoc.save();
    res.status(200).json({
      message: "Login successful!",
      token: jwtToken,
      userId: userDoc._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email, providerId: "local" });

    if (!userDoc) {
      const error = new customError("email", "Could not find user by email!");
      error.statusCode = 401;
      throw error;
    }

    const isMatched = await bcrypt.compare(password, userDoc.password);
    if (!isMatched) {
      throw new customError("password", "Password wrong!");
    }

    // Create json webtoken here!!!
    const token = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString() },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    // Save token to database
    userDoc.loginToken = token;
    userDoc.loginTokenExpiration = Date.now() + 60 * 60 * 1000;
    await userDoc.save();

    res.status(200).json({
      message: "Login successfuly!",
      token: token,
      userId: userDoc._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const userDoc = await User.findOne({ email, providerId: "local" });
    if (!userDoc) {
      const error = new Error("Could not find user by this email");

      error.statusCode = 401;
      throw error;
    }

    const { role } = userDoc;

    console.log(role);

    // Authorization
    if (role !== "ADMIN" && role !== "INSTRUCTOR" && role !== "TEACHER") {
      const error = new Error("Could not authenticate because this account not admin role!");
      error.statusCode = 422;
      throw error;
    }

    const isMatched = await bcrypt.compare(password, userDoc.password);
    if (!isMatched) {
      throw new Error("Password wrong!!!");
    }

    // Create json webtoken here!!!
    const token = jwt.sign(
      { email: userDoc.email, userId: userDoc._id.toString(), adminRole: userDoc.role },
      "somesupersecret",
      { expiresIn: "1h" }
    );

    userDoc.loginToken = token;
    userDoc.loginTokenExpiration = Date.now() + 60 * 60 * 1000;
    await userDoc.save();

    res.status(200).json({
      message: "Login administrator successfuly!",
      token: token,
      userId: userDoc._id.toString(),
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// Trường hợp logout này là chưa chính xác lắm!!!. Khi logout làm sao để clear token (revoke thu hồi quyền truy cập access -> sử dụng thêm database redis, hay tạo thêm một database revoke nữa!!!);
exports.logout = async (req, res, next) => {
  const tokenToRevoke = req.token; // Assuming you have a middleware that extracts the token

  console.log("token to revoke", tokenToRevoke);

  try {
    // Add the token to the revoked tokens collection
    const revokedToken = new RevokedToken({ token: tokenToRevoke });
    await revokedToken.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.adminLogout = async (req, res, next) => {
  const tokenToRevoke = req.token; // Assuming you have a middleware that extracts the token

  console.log("token to revoke", tokenToRevoke);

  try {
    // Add the token to the revoked tokens collection
    const revokedToken = new RevokedToken({ token: tokenToRevoke });
    await revokedToken.save();

    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.checkExistingEmail = async (req, res, next) => {
  const { email, providerId } = req.body;

  console.log(email, providerId);

  try {
    const user = await User.findOne({ email, providerId });

    console.log("user: ", user);

    if (!user) {
      res.status(200).json({
        message: `${email} with ${providerId} hasn't register yet`,
        result: "not found",
      });
      return;
    }

    res.status(200).json({
      message: "Email already registered",
      result: "found",
    });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.checkExistingFacebook = async (req, res, next) => {
  const { name, fbUserId } = req.body;

  try {
    const userDoc = await User.findOne({ providerId: "facebook", fbUserId: id });

    if (!userDoc) {
      res.status(200).json({
        result: "not found",
        message: "No facebook account at website",
      });
    } else {
      res.status(200).json({
        result: "found",
        message: "Facebook account has already existed at website",
      });
    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

// exports.getReset = async (req, res, next) => {};

exports.postReset = async (req, res, next) => {
  const { email, resetPassUrl } = req.body;

  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
    }

    const token = buffer.toString("hex");

    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          const error = new Error("No Email founded at this website!");
          error.statusCode = 422;
          res.status(402).json({
            message: error,
          });
          throw error;
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        const { email, _id } = result;
        console.log("result: ", result);
        res.status(202).json({
          message: "Check your email, we aldready send token to your account!",
          user: { email, _id },
        });

        const hrefLink = resetPassUrl
          ? `${resetPassUrl}?token=${token}`
          : `${BACKEND_URL}/site/reset-password.html?token=${token}`;

        console.log(hrefLink);

        sendmail({
          from: "nhatsang0101@gmail.com",
          email: email,
          subject: "Password reset",
          html: `
            <p>You requested a password reset!</p>
            <p>Click this  <a href=${hrefLink}">Link Here</a>  to set a new password.</p>
          `,
        });
      })
      .catch((err) => console.log(err));
  });
};

exports.getNewPassword = async (req, res, next) => {
  const { token } = req.params;

  console.log("token: ", token);

  User.findOne({});
};

exports.postNewPassword = async (req, res, next) => {
  const { password, userId, passwordToken } = req.body;

  bcrypt.hash(password, 12).then((hashedPassword) => {
    User.findOneAndUpdate(
      {
        _id: userId,
        resetToken: passwordToken,
        resetTokenExpiration: {
          $gt: Date.now(),
        },
      },
      {
        $set: {
          password: hashedPassword,
          resetToken: undefined,
          resetTokenExpiration: undefined,
        },
      }
    )
      .then((user) => {
        console.log("update password successfully!", user);

        res.status(200).json({
          message: "Update password successfully!",
          user,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getUserStatus = async (req, res, next) => {};

exports.postResetPassword = async (req, res, next) => {};

exports.updateLastLogin = async (req, res, next) => {
  const { userId } = req.params;
  const { lastLogin } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, { lastLogin });

    console.log(updatedUser);

    res.status(200).json({
      message: "Successfully to update last login for user",
      updatedUser: {
        _id: updatedUser._id,
        lastLogin: updatedUser.lastLogin,
      },
    });
  } catch (error) {
    if (!error) {
      const error = new Error("Failed to update last login for user");
      error.statusCode(422);
      return error;
    }
    next(error);
  }
};
