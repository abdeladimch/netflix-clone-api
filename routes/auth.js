const express = require("express");
const router = express.Router();

const { signup, verifyEmail, login, logout } = require("../controllers/auth");

router.route("/signup").post(signup);
router.route("/verify-email").get(verifyEmail);
router.route("/login").post(login);
router.route("/logout").get(logout);

module.exports = router;
