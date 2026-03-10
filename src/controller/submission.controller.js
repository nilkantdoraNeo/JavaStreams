const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const { runDto, submitDto } = require("../dto/submission.dto");
const submissionService = require("../service/submission.service");

const router = express.Router();
router.use(authMiddleware);

router.post("/run", runDto, validate, async (req, res, next) => {
  try {
    const data = await submissionService.runCode({
      user: req.user,
      problemId: Number(req.body.problemId),
      code: req.body.code,
      mode: req.body.mode || "practice",
      customInput: req.body.customInput || ""
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/submit", submitDto, validate, async (req, res, next) => {
  try {
    const data = await submissionService.submitCode({
      user: req.user,
      problemId: Number(req.body.problemId),
      code: req.body.code,
      mode: req.body.mode || "practice",
      contestId: req.body.contestId || null
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/me", async (req, res, next) => {
  try {
    const data = await submissionService.getRecentSubmissions(req.user.id);
    res.json(
      data.map((item) => ({
        id: item.id,
        problemId: item.problemId,
        problemTitle: item.Problem ? item.Problem.title : "Unknown",
        status: item.status,
        executionTime: item.executionTime,
        createdAt: item.createdAt
      }))
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
