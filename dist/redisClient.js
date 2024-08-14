"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
// Create a Redis client
const redisClient = new ioredis_1.default({
    host: '127.0.0.1', // Replace with your Redis server host if different
    port: 6379, // Replace with your Redis server port if different
});
exports.default = redisClient;
