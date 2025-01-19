import { createClient } from "redis";

// Create and configure the Redis client
const redisClient = createClient({
  username: "default",
  password: "y0MIFGwtReQebiyq5T5vGodRW7q9YCsc",
  socket: {
    host: "redis-14192.c259.us-central1-2.gce.redns.redis-cloud.com",
    port: 14192,
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
