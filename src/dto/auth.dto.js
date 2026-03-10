const { body } = require("express-validator");

const signupDto = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name is required"),
  body("password")
    .isString()
    .isLength({ min: 6, max: 120 })
    .withMessage("Password must be 6+ characters"),
  body("email").isEmail().withMessage("A valid email is required"),
  body("phone")
    .optional({ nullable: true })
    .isString()
    .isLength({ min: 7, max: 20 })
    .withMessage("Invalid phone"),
  body("redirectTo").optional({ nullable: true }).isURL().withMessage("Invalid redirect URL")
];

const loginDto = [
  body("identifier").isEmail().withMessage("Use a valid email address"),
  body("password")
    .isString()
    .isLength({ min: 6, max: 120 })
    .withMessage("password is required")
];

module.exports = {
  signupDto,
  loginDto
};
