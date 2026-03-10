const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const bookmarkService = require("../service/bookmark.service");

const router = express.Router();
router.use(authMiddleware);

router.get("/", async (req, res, next) => {
  try {
    const data = await bookmarkService.listBookmarks(req.user.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("problemId").isInt({ min: 1 }).withMessage("problemId must be a positive integer"),
    body("collection").optional().isString().isLength({ min: 1, max: 120 }),
    body("note").optional().isString().isLength({ max: 280 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const data = await bookmarkService.addBookmark({
        userId: req.user.id,
        problemId: Number(req.body.problemId),
        collection: req.body.collection || "My List",
        note: req.body.note
      });
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:bookmarkId", async (req, res, next) => {
  try {
    const data = await bookmarkService.removeBookmark({
      userId: req.user.id,
      bookmarkId: Number(req.params.bookmarkId)
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/problem/:problemId", async (req, res, next) => {
  try {
    const data = await bookmarkService.removeBookmarkByProblem({
      userId: req.user.id,
      problemId: Number(req.params.problemId),
      collection: req.query.collection || null
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
