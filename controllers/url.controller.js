const UrlService = require("../services/url.service");
const AnalyticsService = require("../services/analytics.service");
const logger = require("../utils/logger");
const { redisClient } = require("../config/redisClient.js");

class UrlController {
  static async createShortUrl(req, res, next) {
    try {
      const { longUrl, customAlias, topic } = req.body;
      const userId = req.user.id;

      const result = await UrlService.createShortUrl({
        longUrl,
        customAlias,
        topic,
        userId,
      });

      logger.info(`Short URL created for ${longUrl}`);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async redirect(req, res, next) {
    try {
      const { alias } = req.params;

      // Check if the alias exists in Redis cache
      const cachedData = await redisClient.get(alias);

      if (cachedData) {
        console.log("Cache hit");
        return res.redirect(JSON.parse(cachedData)); // Return cached data
      }

      const url = await UrlService.getUrl(alias);

      // Cache the response
      await redisClient.set(alias, JSON.stringify(url.longUrl), {
        EX: 3600, // Set expiration to 1 hour
      });

      // Log analytics asynchronously
      AnalyticsService.logVisit(url._id, req).catch((err) =>
        logger.error("Analytics logging failed:", err)
      );

      res.redirect(url.longUrl);
    } catch (error) {
      next(error);
    }
  }

  static async getUrlAnalytics(req, res, next) {
    try {
      const { alias } = req.params;

      const url = await UrlService.getUrl(alias);

      if (url.userId !== req.user.id) {
        const error = new Error("Unauthorized");
        error.status = 403;
        throw error;
      }

      const analytics = await AnalyticsService.getUrlAnalytics(url._id);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  static async getTopicAnalytics(req, res, next) {
    try {
      const { topic } = req.params;
      const urls = await UrlService.getUrlsByTopic(topic, req.user.id);

      const analytics = await AnalyticsService.getTopicAnalytics(urls);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  static async getOverallAnalytics(req, res, next) {
    try {
      console.log("Analytics");
      const urls = await UrlService.getUserUrls(req.user.id);
      const analytics = await AnalyticsService.getOverallAnalytics(urls);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UrlController;
