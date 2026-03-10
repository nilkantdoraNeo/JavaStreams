const express = require("express");
const { body } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");
const communityService = require("../service/community.service");

const router = express.Router();
router.use(authMiddleware);

router.get("/problem/:problemId", async (req, res, next) => {
  try {
    const data = await communityService.listProblemDiscussion({
      userId: req.user.id,
      problemId: Number(req.params.problemId)
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post(
  "/problem/:problemId/posts",
  [
    body("content").isString().isLength({ min: 5, max: 5000 }).withMessage("content must be 5-5000 characters"),
    body("parentId")
      .optional({ nullable: true })
      .isInt({ min: 1 })
      .withMessage("parentId must be positive integer")
  ],
  validate,
  async (req, res, next) => {
    try {
      const data = await communityService.createPost({
        userId: req.user.id,
        problemId: Number(req.params.problemId),
        content: req.body.content,
        parentId: req.body.parentId ? Number(req.body.parentId) : null
      });
      res.status(201).json(data);
    } catch (error) {
      next(error);
    }
  }
);

router.post("/posts/:postId/upvote", async (req, res, next) => {
  try {
    const data = await communityService.toggleUpvote({
      userId: req.user.id,
      postId: Number(req.params.postId)
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
