import { ConfidentialClientApplication } from '@azure/msal-node';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import redisClient from './redisClient'; 

dotenv.config();

console.log('OUTLOOK_CLIENT_ID:', process.env.OUTLOOK_CLIENT_ID);
console.log('OUTLOOK_CLIENT_SECRET:', process.env.OUTLOOK_CLIENT_SECRET);
console.log('OUTLOOK_REDIRECT_URI:', process.env.OUTLOOK_REDIRECT_URI);

const config = {
    auth: {
        clientId: process.env.OUTLOOK_CLIENT_ID as string,
        authority: `https://login.microsoftonline.com/common`,
        clientSecret: process.env.OUTLOOK_CLIENT_SECRET as string,
    },
};

const cca = new ConfidentialClientApplication(config);

export const getAuthUrl = () => {
    return cca.getAuthCodeUrl({
        scopes: ["https://graph.microsoft.com/.default"],
        redirectUri: process.env.OUTLOOK_REDIRECT_URI as string,
    });
};

export const getTokens = async (code: string) => {
    try {
        const tokenResponse = await cca.acquireTokenByCode({
            code,
            scopes: ["https://graph.microsoft.com/.default"],
            redirectUri: process.env.OUTLOOK_REDIRECT_URI as string,
        });

        if (!tokenResponse || !tokenResponse.accessToken) {
            throw new Error('Failed to acquire access token');
        }

        await redisClient.set('outlookAccessToken', tokenResponse.accessToken, 'EX', 3600);

        console.log('Access token acquired and stored in Redis');
        return tokenResponse.accessToken;
    } catch (error: any) {
        console.error('Error getting tokens:', error.message || error);
        throw new Error('Failed to get tokens');
    }
};

// Interfaces matching the expected API responses
interface EmailAddress {
    address: string;
}

interface Recipient {
    emailAddress: EmailAddress;
}

interface EmailMessage {
    subject: string;
    bodyPreview: string;
    id: string;
}

interface ListEmailsResponse {
    value: EmailMessage[];
}

// Function to list emails using Microsoft Graph API
export const listEmails = async (accessToken: string): Promise<EmailMessage[]> => {
    try {
        const response = await fetch('https://graph.microsoft.com/v1.0/me/messages', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch emails: ${response.statusText} - ${errorText}`);
        }

        const data: ListEmailsResponse = await response.json();

        if (!Array.isArray(data.value)) {
            throw new Error('Unexpected response format: ' + JSON.stringify(data));
        }

        return data.value;
    } catch (error: any) {
        console.error('Error listing emails:', error.message || error);
        throw new Error('Failed to list emails');
    }
};

// Function to send email using Microsoft Graph API
export const sendEmail = async (accessToken: string, to: string, subject: string, message: string) => {
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

        const response = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(emailData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to send email: ${response.statusText} - ${errorText}`);
        }

        console.log('Email sent successfully');
    } catch (error: any) {
        console.error('Error sending email:', error.message || error);
        throw new Error('Failed to send email');
    }
};
