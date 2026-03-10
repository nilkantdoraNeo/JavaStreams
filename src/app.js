const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const errorMiddleware = require("./middleware/error.middleware");

const authController = require("./controller/auth.controller");
const problemController = require("./controller/problem.controller");
const submissionController = require("./controller/submission.controller");
const gameController = require("./controller/game.controller");
const bookmarkController = require("./controller/bookmark.controller");
const communityController = require("./controller/community.controller");
const contestController = require("./controller/contest.controller");
const adminController = require("./controller/admin.controller");

const app = express();

const allowedOrigins = (env.app.corsOrigin || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowAllOrigins =
  allowedOrigins.length === 0 || allowedOrigins.includes("*") || allowedOrigins.includes("auto");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowAllOrigins) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"), false);
    },
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({
    service: "streamquest-api",
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authController);
app.use("/api/problems", problemController);
app.use("/api/submissions", submissionController);
app.use("/api/game", gameController);
app.use("/api/bookmarks", bookmarkController);
app.use("/api/community", communityController);
app.use("/api/contests", contestController);
app.use("/api/admin", adminController);

app.use(errorMiddleware);

module.exports = app;
