const { body } = require("express-validator");

const runDto = [
  body("problemId").isInt({ min: 1 }).withMessage("problemId must be a positive integer"),
  body("code")
    .isString()
    .isLength({ min: 20, max: 50000 })
    .withMessage("code must be provided"),
  body("mode")
    .optional()
    .isIn(["practice", "challenge", "contest"])
    .withMessage("mode must be practice, challenge, or contest"),
  body("customInput").optional().isString().isLength({ max: 20000 }).withMessage("customInput is too large"),
  body("contestId")
    .optional({ values: "null" })
    .isString()
    .isLength({ min: 3, max: 120 })
    .withMessage("contestId is invalid")
];

module.exports = {
  runDto,
  submitDto: runDto
};
