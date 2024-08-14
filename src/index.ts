import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import { getAuthUrl as getGmailAuthUrl, getTokens as getGmailTokens, listEmails as listGmailEmails } from './gmailAuth';
import { getAuthUrl as getOutlookAuthUrl, getTokens as getOutlookTokens, listEmails as listOutlookEmails } from './outlookAuth';
import { addEmailToQueue } from './queue';
import redisClient from './redisClient';
dotenv.config();

const app = express();
app.use(express.json());

app.get('/google/auth', (req: Request, res: Response) => {
    const authUrl = getGmailAuthUrl();
    if (typeof authUrl === 'string') {
        res.redirect(authUrl);
    } else {
        res.status(500).send('Failed to get Gmail auth URL.');
    }
});

app.get('/google/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    try {
        const tokens = await getGmailTokens(code);
        const emails = await listGmailEmails();
        emails.forEach(email => {
            if (email.snippet) {
                addEmailToQueue(email.snippet, 'recipient@example.com', 'gmail');
            }
        });
        res.send('Emails processed for Gmail.');
    } catch (error) {
        res.status(500).send('Error processing Gmail emails.');
    }
});

app.get('/outlook/auth', (req: Request, res: Response) => {
    const authUrl = getOutlookAuthUrl();
    if (typeof authUrl === 'string') {
        res.redirect(authUrl);
    } else {
        res.status(500).send('Failed to get Outlook auth URL.');
    }
});

app.get('/outlook/callback', async (req: Request, res: Response) => {
    const code = req.query.code as string;
    try {
        const accessToken = await getOutlookTokens(code);
        const emails = await listOutlookEmails(accessToken!);
        emails.forEach(email => {
            if (email.bodyPreview) {
                addEmailToQueue(email.bodyPreview, 'recipient@example.com', 'outlook');
            }
        });
        res.send('Emails processed for Outlook.');
    } catch (error) {
        res.status(500).send('Error processing Outlook emails.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
