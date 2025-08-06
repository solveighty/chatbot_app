import dotenv from 'dotenv';

dotenv.config();

export const WHATSAPP_CLIENT_OPTIONS = {
    puppeteer: {
        headless: process.env.HEADLESS === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    // Opciones para manejar mejor la sincronización
    syncAllChats: false, // No sincronizar todos los chats automáticamente
    syncUnreadOnly: true, // Solo sincronizar mensajes no leídos
    // Configuración para evitar procesar mensajes antiguos durante reconexión
    syncOptions: {
        syncUnreadOnly: true,
        syncAllChats: false,
        syncDeletedChats: false,
        syncDeletedMessages: false,
        syncDeletedContacts: false,
        syncDeletedGroups: false,
        syncDeletedBroadcasts: false,
        syncDeletedStatuses: false,
        syncDeletedCalls: false,
        syncDeletedStickers: false,
        syncDeletedDocuments: false,
        syncDeletedPhotos: false,
        syncDeletedVideos: false,
        syncDeletedAudios: false,
        syncDeletedVoices: false,
        syncDeletedLocations: false,
    }
};

export const PORT = process.env.PORT || '3000';

export const config = {
    clientOptions: WHATSAPP_CLIENT_OPTIONS,
    port: PORT
};