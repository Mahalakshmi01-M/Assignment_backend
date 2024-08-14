import openai from 'openai';
import dotenv from 'dotenv';
import redisClient from './redisClient';
dotenv.config();

// Initialize OpenAI client with the API key
const openaiClient = new openai.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const analyzeEmailContent = async (emailText: string): Promise<string> => {
    const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `Classify the following email into one of these categories: Interested, Not Interested, More Information.\n\nEmail: ${emailText}`,
            },
        ],
    });

    return response.choices[0]?.message?.content || ''; // Adjusted to handle response correctly
};

export const generateResponse = async (category: string): Promise<string> => {
    let prompt = '';

    switch (category) {
        case 'Interested':
            prompt = 'Generate a reply asking for a convenient time for a demo call.';
            break;
        case 'Not Interested':
            prompt = 'Generate a polite thank you message and acknowledge their decision.';
            break;
        case 'More Information':
            prompt = 'Generate a reply offering more details about the product.';
            break;
        default:
            prompt = 'Generate a neutral response.';
            break;
    }

    const response = await openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content || ''; // Adjusted to handle response correctly
};
