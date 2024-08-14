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
exports.generateResponse = exports.analyzeEmailContent = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const openaiClient = new openai_1.default.OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const analyzeEmailContent = (emailText) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const response = yield openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: `Classify the following email into one of these categories: Interested, Not Interested, More Information.\n\nEmail: ${emailText}`,
            },
        ],
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
});
exports.analyzeEmailContent = analyzeEmailContent;
const generateResponse = (category) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
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
    const response = yield openaiClient.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
    });
    return ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
});
exports.generateResponse = generateResponse;
