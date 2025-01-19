const Analytics = require("../models/analytics.model");
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");
const mongoose = require("mongoose");

class AnalyticsService {
  static async logVisit(urlId, req) {
    const parser = new UAParser(req.headers["user-agent"]);
    const ip = req.ip.replace("::ffff:", "");
    const geo = geoip.lookup(ip);

    const analytics = new Analytics({
      urlId,
      userAgent: req.headers["user-agent"],
      ipAddress: ip,
      geolocation: {
        country: geo?.country || "Unknown",
        city: geo?.city || "Unknown",
      },
      osType: parser.getOS().name || "Unknown",
      deviceType: parser.getDevice().type || "desktop",
      browserType: parser.getBrowser().name || "Unknown",
      referrer: req.headers.referer || "Direct",
    });

    return analytics.save();
  }

  static async getUrlAnalytics(urlId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [analytics] = await Analytics.aggregate([
      {
        $match: {
          urlId: new mongoose.Types.ObjectId(urlId),
          timestamp: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ipAddress" },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: 1,
            },
          },
          osStats: {
            $push: {
              os: "$osType",
              ip: "$ipAddress",
            },
          },
          deviceStats: {
            $push: {
              device: "$deviceType",
              ip: "$ipAddress",
            },
          },
        },
      },
    ]);

    return this._formatAnalytics(analytics);
  }

  static async getTopicAnalytics(urls) {
    const urlIds = urls.map((url) => url._id);
    const [analytics] = await Analytics.aggregate([
      {
        $match: {
          urlId: { $in: urlIds },
        },
      },
      {
        $group: {
          _id: "$urlId",
          clicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ipAddress" },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: 1,
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: "$clicks" },
          uniqueUsers: { $addToSet: "$uniqueUsers" },
          urls: {
            $push: {
              urlId: "$_id",
              clicks: "$clicks",
              uniqueUsers: { $size: "$uniqueUsers" },
            },
          },
          clicksByDate: { $push: "$clicksByDate" },
        },
      },
    ]);

    return {
      totalClicks: analytics?.totalClicks || 0,
      uniqueUsers: analytics?.uniqueUsers.flat().length || 0,
      clicksByDate: this._aggregateClicksByDate(
        analytics?.clicksByDate.flat() || []
      ),
      urls: urls.map((url) => ({
        shortUrl: `${process.env.BASE_URL}/${url.alias}`,
        ...(analytics?.urls.find((u) => u.urlId.equals(url._id)) || {
          clicks: 0,
          uniqueUsers: 0,
        }),
      })),
    };
  }

  static async getOverallAnalytics(urls) {
    const urlIds = urls.map((url) => url._id);
    const [analytics] = await Analytics.aggregate([
      {
        $match: {
          urlId: { $in: urlIds },
        },
      },
      {
        $group: {
          _id: null,
          totalClicks: { $sum: 1 },
          uniqueUsers: { $addToSet: "$ipAddress" },
          clicksByDate: {
            $push: {
              date: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: 1,
            },
          },
          osStats: {
            $push: {
              os: "$osType",
              ip: "$ipAddress",
            },
          },
          deviceStats: {
            $push: {
              device: "$deviceType",
              ip: "$ipAddress",
            },
          },
        },
      },
    ]);

    return {
      totalUrls: urls.length,
      totalClicks: analytics?.totalClicks || 0,
      uniqueUsers: analytics?.uniqueUsers.length || 0,
      clicksByDate: this._aggregateClicksByDate(analytics?.clicksByDate || []),
      osType: this._processTypeStats(analytics?.osStats || [], "os"),
      deviceType: this._processTypeStats(
        analytics?.deviceStats || [],
        "device"
      ),
    };
  }

  static _formatAnalytics(data) {
    if (!data) {
      return {
        totalClicks: 0,
        uniqueUsers: 0,
        clicksByDate: [],
        osType: [],
        deviceType: [],
      };
    }

    return {
      totalClicks: data.totalClicks,
      uniqueUsers: data.uniqueUsers.length,
      clicksByDate: this._aggregateClicksByDate(data.clicksByDate),
      osType: this._processTypeStats(data.osStats, "os"),
      deviceType: this._processTypeStats(data.deviceStats, "device"),
    };
  }

  static _aggregateClicksByDate(clicksByDate) {
    const aggregated = clicksByDate.reduce((acc, { date, count }) => {
      acc[date] = (acc[date] || 0) + count;
      return acc;
    }, {});

    return Object.entries(aggregated)
      .map(([date, clicks]) => ({ date, clicks }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  static _processTypeStats(stats, key) {
    const processed = stats.reduce((acc, item) => {
      const type = item[key];
      if (!acc[type]) {
        acc[type] = { uniqueClicks: 1, uniqueUsers: new Set([item.ip]) };
      } else {
        acc[type].uniqueClicks++;
        acc[type].uniqueUsers.add(item.ip);
      }
      return acc;
    }, {});

    return Object.entries(processed).map(([name, stats]) => ({
      name,
      uniqueClicks: stats.uniqueClicks,
      uniqueUsers: stats.uniqueUsers.size,
    }));
  }
}

module.exports = AnalyticsService;
