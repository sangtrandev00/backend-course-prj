const express = require("express");
const authController = require("../controllers/auth");
const { check, body } = require("express-validator");
const extractToken = require("../middleware/extractToken");
const isAuth = require("../middleware/is-auth");
const isUserAuth = require("../middleware/is-user-auth");

const router = express.Router();

// PUT signup/
router.put("/signup", authController.signup);

// POST login
router.post("/login", authController.login);

// POST Logout

router.post("/logout", isUserAuth, authController.logout);

// POST ADMIN LOGOUT
router.post("/admin/logout", isAuth, authController.adminLogout);

// POST google login
router.post("/google-login", authController.googleLogin);

// POST facebook login

router.post("/facebook-login", authController.facebookLogin);

// POST admin-login
router.post("/admin-login", authController.adminLogin);

// Check exisiting Email (Account with provider ID)

router.post("/exisiting-email", authController.checkExistingEmail);

// Check existing Facebook

router.post("/exisiting-fb", authController.checkExistingFacebook);

// router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

// POST reset password

router.post("/reset", authController.postResetPassword);

// Update User with last login

router.patch("/:userId/last-login", authController.updateLastLogin);

// router.get("/status", authController.getUserStatus);

module.exports = router;
