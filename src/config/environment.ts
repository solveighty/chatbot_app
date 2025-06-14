import dotenv from 'dotenv';

dotenv.config();

export const WHATSAPP_CLIENT_OPTIONS = {
    puppeteer: {
        headless: process.env.HEADLESS === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
};

export const PORT = process.env.PORT;

export const config = {
    clientOptions: WHATSAPP_CLIENT_OPTIONS,
    port: PORT
};