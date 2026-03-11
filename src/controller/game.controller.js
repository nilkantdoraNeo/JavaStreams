const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const gameService = require("../service/game.service");

const router = express.Router();
router.use(authMiddleware);

router.get("/dashboard", async (req, res, next) => {
  try {
    const data = await gameService.getDashboard(req.user);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/leaderboard", async (req, res, next) => {
  try {
    const data = await gameService.getLeaderboard({
      limit: Number(req.query.limit) || 50,
      scope: req.query.scope || "global",
      topic: req.query.topic || null
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/profile", async (req, res, next) => {
  try {
    const data = await gameService.getProfile(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.patch("/profile", async (req, res, next) => {
  try {
    const data = await gameService.updateProfile(req.user.id, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/profile/avatar", async (req, res, next) => {
  try {
    const { dataUrl } = req.body || {};
    if (!dataUrl) {
      const error = new Error("Avatar file is required.");
      error.status = 400;
      throw error;
    }
    const data = await gameService.updateAvatar(req.user.id, dataUrl);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/daily-challenge", async (req, res, next) => {
  try {
    const data = await gameService.getDailyChallenge(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/insights", async (req, res, next) => {
  try {
    const data = await gameService.getInsights(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
