const express = require("express");
const router = express.Router();
const UrlController = require("../controllers/url.controller");
const { authenticate } = require("../middleware/auth");
const { createUrlLimiter } = require("../middleware/rateLimit");

router.post(
  "/shorten",
  authenticate,
  createUrlLimiter,
  UrlController.createShortUrl
);
router.get("/:alias", UrlController.redirect);
router.get(
  "/analytics/alias/:alias",
  authenticate,
  UrlController.getUrlAnalytics
);
router.get(
  "/analytics/topic/:topic",
  authenticate,
  UrlController.getTopicAnalytics
);
router.get(
  "/analytics/overall",
  authenticate,
  UrlController.getOverallAnalytics
);

module.exports = router;
