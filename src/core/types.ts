// src/core/types.ts

export interface Message {
    id: string;
    from: string;
    to: string;
    body: string;
    timestamp: Date;
}

export interface ClientOptions {
    puppeteer: {
        headless: boolean;
        args: string[];
    };
}