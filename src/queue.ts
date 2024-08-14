import { Queue, Worker } from 'bullmq';
import redisClient from './redisClient'; // Ensure this path is correct
import { analyzeEmailContent, generateResponse } from './emailProcessor';
import { sendEmail as sendGmail } from './gmailAuth';
import { sendEmail as sendOutlookEmail, getTokens } from './outlookAuth';

// Create a queue for email processing
const emailQueue = new Queue('email-processing', { connection: redisClient });

// Worker to process emails
const worker = new Worker('email-processing', async job => {
    const { emailText, recipient, provider, authCode } = job.data;

    try {
        // Analyze the email content
        const category = await analyzeEmailContent(emailText);
        console.log('Category:', category);

        // Generate a response based on the category
        const response = await generateResponse(category);
        console.log('Generated Response:', response);

        if (provider === 'gmail') {
            // Send email using Gmail API
            await sendGmail(recipient, 'Response to your email', response);
        } else if (provider === 'outlook') {
            // Obtain access token using the authorization code
            const accessToken = await getTokens(authCode);

            if (!accessToken) {
                throw new Error('Failed to get access token');
            }

            // Send email using Outlook API
            await sendOutlookEmail(accessToken, recipient, 'Response to your email', response);
        }
    } catch (error) {
        console.error('Error processing job:', error);
    }
}, { connection: redisClient });

// Function to add a job to the queue
export const addEmailToQueue = (emailText: string, recipient: string, provider: string, authCode?: string) => {
    emailQueue.add('process-email', { emailText, recipient, provider, authCode });
};
