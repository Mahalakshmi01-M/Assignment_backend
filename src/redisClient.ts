import Redis from 'ioredis';

// Create and configure the Redis client
const redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    // You can add more Redis options here if needed
});

// Error handling for Redis client
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

export default redisClient;
