const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const contestService = require("../service/contest.service");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const data = await contestService.listContests();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:contestId", async (req, res, next) => {
  try {
    const data = await contestService.getContest(req.params.contestId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:contestId/leaderboard", async (req, res, next) => {
  try {
    const data = await contestService.getContestLeaderboard(req.params.contestId);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
