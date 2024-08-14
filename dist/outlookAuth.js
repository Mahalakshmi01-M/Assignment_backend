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
exports.sendEmail = exports.listEmails = exports.getTokens = exports.getAuthUrl = void 0;
const msal_node_1 = require("@azure/msal-node");
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const redisClient_1 = __importDefault(require("./redisClient"));
dotenv_1.default.config();
console.log('OUTLOOK_CLIENT_ID:', process.env.OUTLOOK_CLIENT_ID);
console.log('OUTLOOK_CLIENT_SECRET:', process.env.OUTLOOK_CLIENT_SECRET);
console.log('OUTLOOK_REDIRECT_URI:', process.env.OUTLOOK_REDIRECT_URI);
if (!process.env.OUTLOOK_CLIENT_ID || !process.env.OUTLOOK_CLIENT_SECRET || !process.env.OUTLOOK_REDIRECT_URI) {
    throw new Error('OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET or OUTLOOK_REDIRECT_URI is not defined');
}
const config = {
    auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID,
        authority: `https://login.microsoftonline.com/common`,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET,
    },
};
const cca = new msal_node_1.ConfidentialClientApplication(config);
const getAuthUrl = () => {
    return cca.getAuthCodeUrl({
        scopes: ["https://graph.microsoft.com/.default"],
        redirectUri: process.env.OUTLOOK_REDIRECT_URI,
    });
};
exports.getAuthUrl = getAuthUrl;
const getTokens = (code) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const tokenResponse = yield cca.acquireTokenByCode({
            code,
            scopes: ["https://graph.microsoft.com/.default"],
            redirectUri: process.env.OUTLOOK_REDIRECT_URI,
        });
        if (!tokenResponse || !tokenResponse.accessToken) {
            throw new Error('Failed to acquire access token');
        }
        yield redisClient_1.default.set('outlookAccessToken', tokenResponse.accessToken, 'EX', 3600);
        console.log('Access token acquired and stored in Redis');
        return tokenResponse.accessToken;
    }
    catch (error) {
        console.error('Error getting tokens:', error.message || error);
        throw new Error('Failed to get tokens');
    }
});
exports.getTokens = getTokens;
// Function to list emails using Microsoft Graph API
const listEmails = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield (0, node_fetch_1.default)('https://graph.microsoft.com/v1.0/me/messages', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errorText = yield response.text();
            throw new Error(`Failed to fetch emails: ${response.statusText} - ${errorText}`);
        }
        const data = yield response.json();
        if (!Array.isArray(data.value)) {
            throw new Error('Unexpected response format: ' + JSON.stringify(data));
        }
        return data.value;
    }
    catch (error) {
        console.error('Error listing emails:', error.message || error);
        throw new Error('Failed to list emails');
    }
});
exports.listEmails = listEmails;
// Function to send email using Microsoft Graph API
const sendEmail = (accessToken, to, subject, message) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const emailData = {
            message: {
                subject: subject,
                body: {
                    contentType: "HTML",
                    content: message,
                },
                toRecipients: [
                    {
                        emailAddress: {
                            address: to,
                        },
                    },
                ],
            },
        };
        const response = yield (0, node_fetch_1.default)('https://graph.microsoft.com/v1.0/me/sendMail', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });
        if (!response.ok) {
            const errorText = yield response.text();
            throw new Error(`Failed to send email: ${response.statusText} - ${errorText}`);
        }
        console.log('Email sent successfully');
    }
    catch (error) {
        console.error('Error sending email:', error.message || error);
        throw new Error('Failed to send email');
    }
});
exports.sendEmail = sendEmail;
