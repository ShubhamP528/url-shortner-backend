const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const logger = require("../utils/logger");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthController {
  static async googleSignIn(req, res, next) {
    try {
      const { token } = req.body;
      // console.log(token);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      // console.log(ticket);

      const payload = ticket.getPayload();
      const userId = payload["sub"];
      const email = payload["email"];

      const accessToken = jwt.sign(
        { id: userId, email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // const refreshToken = jwt.sign(
      //   { id: userId },
      //   process.env.JWT_REFRESH_SECRET,
      //   { expiresIn: "7d" }
      // );

      res.json({ accessToken });
    } catch (error) {
      next(error);
    }
  }

  // static async refreshToken(req, res, next) {
  //   try {
  //     const { refreshToken } = req.body;
  //     if (!refreshToken) {
  //       throw new Error("Refresh token required");
  //     }

  //     const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  //     const accessToken = jwt.sign({ id: payload.id }, process.env.JWT_SECRET, {
  //       expiresIn: "1h",
  //     });

  //     res.json({ accessToken });
  //   } catch (error) {
  //     next(error);
  //   }
  // }
}

module.exports = AuthController;
