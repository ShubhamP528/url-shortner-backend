import { createClient } from "redis";

// Create and configure the Redis client
const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Handle errors
redisClient.on("error", (err) => console.log("Redis Client Error", err));

// Connect to Redis server
const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("Connected to Redis");
  }
};

// Export client and connection function
export { redisClient, connectRedis };
