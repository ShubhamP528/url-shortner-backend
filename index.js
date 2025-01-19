require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/error");
const logger = require("./utils/logger");
const { connectRedis } = require("./config/redisClient.js");

// Routes
const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");

const app = express();

// Connect to Database
connectDB();

// Connect to Redis on server start
connectRedis();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);

// Error Handler
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
