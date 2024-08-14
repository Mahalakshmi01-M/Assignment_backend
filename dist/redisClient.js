"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
// Create and configure the Redis client
const redisClient = new ioredis_1.default({
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
    // You can add more Redis options here if needed
});
// Error handling for Redis client
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});
exports.default = redisClient;
