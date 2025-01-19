const express = require("express");
const router = express.Router();
const AuthController = require("../controllers/auth.controller");

router.post("/google", AuthController.googleSignIn);
// router.post("/refresh", AuthController.refreshToken);

module.exports = router;
