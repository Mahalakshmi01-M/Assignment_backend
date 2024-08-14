import IORedis from 'ioredis';

// Create a Redis client
const redisClient = new IORedis({
    host: '127.0.0.1', // Replace with your Redis server host if different
    port: 6379,        // Replace with your Redis server port if different
});

export default redisClient;