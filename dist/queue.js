"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addEmailToQueue = void 0;
const bullmq_1 = require("bullmq");
const redisClient_1 = __importDefault(require("./redisClient")); // Ensure this path is correct
const emailProcessor_1 = require("./emailProcessor");
const gmailAuth_1 = require("./gmailAuth");
const outlookAuth_1 = require("./outlookAuth");
// Create a queue for email processing
const emailQueue = new bullmq_1.Queue('email-processing', { connection: redisClient_1.default });
// Worker to process emails
const worker = new bullmq_1.Worker('email-processing', (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { emailText, recipient, provider, authCode } = job.data;
    try {
        // Analyze the email content
        const category = yield (0, emailProcessor_1.analyzeEmailContent)(emailText);
        console.log('Category:', category);
        // Generate a response based on the category
        const response = yield (0, emailProcessor_1.generateResponse)(category);
        console.log('Generated Response:', response);
        if (provider === 'gmail') {
            // Send email using Gmail API
            yield (0, gmailAuth_1.sendEmail)(recipient, 'Response to your email', response);
        }
        else if (provider === 'outlook') {
            // Obtain access token using the authorization code
            const accessToken = yield (0, outlookAuth_1.getTokens)(authCode);
            if (!accessToken) {
                throw new Error('Failed to get access token');
            }
            // Send email using Outlook API
            yield (0, outlookAuth_1.sendEmail)(accessToken, recipient, 'Response to your email', response);
        }
    }
    catch (error) {
        console.error('Error processing job:', error);
    }
}), { connection: redisClient_1.default });
// Function to add a job to the queue
const addEmailToQueue = (emailText, recipient, provider, authCode) => {
    emailQueue.add('process-email', { emailText, recipient, provider, authCode });
};
exports.addEmailToQueue = addEmailToQueue;
