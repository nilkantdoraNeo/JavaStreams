const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const problemService = require("../service/problem.service");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;
    const list = await problemService.getProblemLibrary({
      userId: req.user.id,
      difficulty: req.query.difficulty || null,
      topic: req.query.topic || null,
      solved: req.query.solved || null,
      search: req.query.search || null,
      sort: req.query.sort || "recommended",
      page,
      pageSize
    });
    res.json(list);
  } catch (error) {
    next(error);
  }
});

router.get("/categories", async (req, res, next) => {
  try {
    const data = await problemService.getConceptCategories();
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/paths", async (req, res, next) => {
  try {
    const data = await problemService.getLearningPaths(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/worlds", async (req, res, next) => {
  try {
    const worlds = await problemService.getWorldMap(req.user.id);
    res.json(worlds);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/editorial", async (req, res, next) => {
  try {
    const data = await problemService.getEditorial({
      userId: req.user.id,
      problemId: Number(req.params.id)
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/hints/:step", async (req, res, next) => {
  try {
    const data = await problemService.getHintStep({
      userId: req.user.id,
      problemId: Number(req.params.id),
      step: Number(req.params.step)
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id/hint", async (req, res, next) => {
  try {
    const hint = await problemService.getHint({
      userId: req.user.id,
      problemId: Number(req.params.id)
    });
    res.json(hint);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const problem = await problemService.getProblemForUser({
      userId: req.user.id,
      problemId: Number(req.params.id)
    });
    res.json(problem);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
