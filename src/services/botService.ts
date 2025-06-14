import { Message } from 'whatsapp-web.js';

export class BotService {
    private conversationState: Map<string, any>;

    constructor() {
        this.conversationState = new Map();
    }

    public async generateResponse(message: Message): Promise<string> {
        const userId = message.from;
        const userMessage = message.body.toLowerCase();

        if (userMessage.includes('hola')) {
            return '¡Hola! ¿Cómo puedo ayudarte hoy?';
        } else if (userMessage.includes('adiós')) {
            return '¡Adiós! ¡Que tengas un gran día!';
        } else {
            return 'No estoy seguro de cómo responder a eso.';
        }
    }

    public updateConversationState(userId: string, state: any): void {
        this.conversationState.set(userId, state);
    }

    public getConversationState(userId: string): any {
        return this.conversationState.get(userId);
    }
}