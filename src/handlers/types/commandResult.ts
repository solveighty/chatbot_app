import { MessageMedia } from 'whatsapp-web.js';

export interface CommandResult {
  response: string | { text: string; media?: MessageMedia };
  stateUpdates?: any;
}