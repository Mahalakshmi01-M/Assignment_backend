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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const gmailAuth_1 = require("./gmailAuth");
const outlookAuth_1 = require("./outlookAuth");
const queue_1 = require("./queue");
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.get('/google/auth', (req, res) => {
    const authUrl = (0, gmailAuth_1.getAuthUrl)();
    if (typeof authUrl === 'string') {
        res.redirect(authUrl);
    }
    else {
        res.status(500).send('Failed to get Gmail auth URL.');
    }
});
app.get('/google/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const tokens = yield (0, gmailAuth_1.getTokens)(code);
        const emails = yield (0, gmailAuth_1.listEmails)();
        emails.forEach(email => {
            if (email.snippet) {
                (0, queue_1.addEmailToQueue)(email.snippet, 'recipient@example.com', 'gmail');
            }
        });
        res.send('Emails processed for Gmail.');
    }
    catch (error) {
        res.status(500).send('Error processing Gmail emails.');
    }
}));
app.get('/outlook/auth', (req, res) => {
    const authUrl = (0, outlookAuth_1.getAuthUrl)();
    if (typeof authUrl === 'string') {
        res.redirect(authUrl);
    }
    else {
        res.status(500).send('Failed to get Outlook auth URL.');
    }
});
app.get('/outlook/callback', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    try {
        const accessToken = yield (0, outlookAuth_1.getTokens)(code);
        const emails = yield (0, outlookAuth_1.listEmails)(accessToken);
        emails.forEach(email => {
            if (email.bodyPreview) {
                (0, queue_1.addEmailToQueue)(email.bodyPreview, 'recipient@example.com', 'outlook');
            }
        });
        res.send('Emails processed for Outlook.');
    }
    catch (error) {
        res.status(500).send('Error processing Outlook emails.');
    }
}));
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
