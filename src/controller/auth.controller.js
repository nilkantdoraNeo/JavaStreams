const express = require("express");
const authService = require("../service/auth.service");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { signupDto, loginDto } = require("../dto/auth.dto");

const router = express.Router();

router.get("/config", (req, res, next) => {
  try {
    const result = authService.getPublicConfig();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/signup", signupDto, validate, async (req, res, next) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post("/login", loginDto, validate, async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const result = await authService.me(req.user.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
