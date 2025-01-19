// const { nanoid } = require("nanoid");
// const Url = require("../models/url.model");
// const { validateUrl, validateAlias } = require("../utils/validators");

// class UrlService {
//   static async createShortUrl(data) {
//     if (!validateUrl(data.longUrl)) {
//       throw new Error("Invalid URL format");
//     }

//     const alias = data.customAlias || nanoid(8);

//     if (data.customAlias && !validateAlias(data.customAlias)) {
//       throw new Error("Invalid custom alias format");
//     }

//     const existing = await Url.findOne({ alias });
//     if (existing) {
//       throw new Error("Custom alias already exists");
//     }

//     const url = await Url.create({
//       ...data,
//       alias,
//     });

//     return {
//       shortUrl: `${process.env.BASE_URL}/${url.alias}`,
//       createdAt: url.createdAt,
//     };
//   }

//   static async getUrl(alias) {
//     const url = await Url.findOneAndUpdate(
//       { alias },
//       { lastAccessed: new Date() },
//       { new: true }
//     );

//     if (!url) {
//       throw new Error("URL not found");
//     }

//     return url;
//   }

//   static async getUrlsByTopic(topic, userId) {
//     return Url.find({ topic, userId }).sort("-createdAt");
//   }

//   static async getUserUrls(userId) {
//     return Url.find({ userId }).sort("-createdAt");
//   }
// }

// module.exports = UrlService;

const { nanoid } = require("nanoid");
const Url = require("../models/url.model");
const { validateUrl, validateAlias } = require("../utils/validators");

class UrlService {
  // Create a short URL
  static async createShortUrl(data) {
    if (!validateUrl(data.longUrl)) {
      throw new Error("Invalid URL format");
    }

    const alias = data.customAlias || nanoid(8);

    if (data.customAlias && !validateAlias(data.customAlias)) {
      throw new Error("Invalid custom alias format");
    }

    const existing = await Url.findOne({ alias });
    if (existing) {
      throw new Error("Custom alias already exists");
    }

    const url = await Url.create({
      ...data,
      alias,
    });

    return {
      shortUrl: `${process.env.BASE_URL || "http://localhost:3000"}/${
        url.alias
      }`,
      createdAt: url.createdAt,
    };
  }

  // Retrieve URL by alias
  static async getUrl(alias) {
    const url = await Url.findOneAndUpdate(
      { alias },
      { lastAccessed: new Date() },
      { new: true }
    );

    if (!url) {
      throw new Error("URL not found");
    }

    return url;
  }

  // Retrieve URLs by topic for a specific user
  static async getUrlsByTopic(topic, userId) {
    return Url.find({ topic, userId }).sort("-createdAt");
  }

  // Retrieve all URLs for a specific user
  static async getUserUrls(userId) {
    return Url.find({ userId }).sort("-createdAt");
  }
}

module.exports = UrlService;
