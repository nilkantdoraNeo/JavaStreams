const express = require("express");
const { body } = require("express-validator");
const validate = require("../middleware/validate.middleware");
const env = require("../config/env");
const { Problem } = require("../model");

const router = express.Router();

function adminGuard(req, res, next) {
  const token = req.headers["x-admin-token"];
  if (!token || token !== env.admin.token) {
    return res.status(403).json({ message: "Forbidden: invalid admin token" });
  }
  return next();
}

router.use(adminGuard);

router.get("/problems", async (req, res, next) => {
  try {
    const rows = await Problem.findAll({ order: [["levelNumber", "ASC"]] });
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/problems",
  [
    body("title").isString().isLength({ min: 5, max: 255 }),
    body("description").isString().isLength({ min: 20 }),
    body("difficulty").isIn(["Beginner", "Intermediate", "Advanced", "Expert"]),
    body("topic").isString().isLength({ min: 3, max: 120 }),
    body("starterCode").isString().isLength({ min: 20 }),
    body("hint").isString().isLength({ min: 3 }),
    body("testCases").isArray({ min: 1 }),
    body("sampleTests").optional().isArray(),
    body("expectedOutput").isString().isLength({ min: 1 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const maxLevel = await Problem.max("levelNumber");
      const payload = {
        ...req.body,
        world: req.body.world || "World 6: Admin Custom",
        worldNumber: Number(req.body.worldNumber) || 6,
        worldLevelNumber: Number(req.body.worldLevelNumber) || 1,
        levelNumber: Number(req.body.levelNumber) || (Number(maxLevel) || 0) + 1,
        xpReward: Number(req.body.xpReward) || 80,
        timeLimitMs: Number(req.body.timeLimitMs) || 5000,
        memoryLimitMb: Number(req.body.memoryLimitMb) || 128,
        hintSteps: Array.isArray(req.body.hintSteps) ? req.body.hintSteps : [req.body.hint],
        tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.topic, "Stream API"],
        acceptanceRate: Number(req.body.acceptanceRate) || 50,
        popularity: Number(req.body.popularity) || 50
      };
      const created = await Problem.create(payload);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  }
);

router.put("/problems/:id", async (req, res, next) => {
  try {
    const problem = await Problem.findByPk(Number(req.params.id));
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    Object.assign(problem, req.body);
    await problem.save();
    return res.json(problem);
  } catch (error) {
    return next(error);
  }
});

router.patch(
  "/problems/:id/hints",
  [body("hint").optional().isString().isLength({ min: 3 }), body("hintSteps").optional().isArray({ min: 1 })],
  validate,
  async (req, res, next) => {
    try {
      const problem = await Problem.findByPk(Number(req.params.id));
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      if (req.body.hint) {
        problem.hint = req.body.hint;
      }
      if (Array.isArray(req.body.hintSteps)) {
        problem.hintSteps = req.body.hintSteps;
      }
      await problem.save();
      return res.json(problem);
    } catch (error) {
      return next(error);
    }
  }
);

router.patch(
  "/problems/:id/tests",
  [body("sampleTests").optional().isArray(), body("testCases").optional().isArray()],
  validate,
  async (req, res, next) => {
    try {
      const problem = await Problem.findByPk(Number(req.params.id));
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      if (Array.isArray(req.body.sampleTests)) {
        problem.sampleTests = req.body.sampleTests;
      }
      if (Array.isArray(req.body.testCases)) {
        problem.testCases = req.body.testCases;
      }
      await problem.save();
      return res.json(problem);
    } catch (error) {
      return next(error);
    }
  }
);

module.exports = router;
