import logger from '../utils/logger';

interface UserState {
    lastCategory?: string;
    lastMessage?: string;
    lastTimestamp?: number;
    isInCheckout?: boolean;
    cart?: any[];
    selectedProduct?: any;
    selectedQuantity?: number;
    clientName?: string;
    clientCedula?: string;
    clientPhone?: string;
    clientAddress?: string;
    // Nuevo campo para tracking de sincronización
    lastProcessedMessageId?: string;
    lastProcessedTimestamp?: number;
    isReconnecting?: boolean;
}

class ConversationStateManager {
    private states: Map<string, UserState> = new Map();
    private lastConnectionTime: number = Date.now();
    private isReconnecting: boolean = false;

    public getState(userId: string): UserState | undefined {
        return this.states.get(userId);
    }

    public updateState(userId: string, updates: Partial<UserState>): void {
        const currentState = this.states.get(userId) || {};
        this.states.set(userId, { ...currentState, ...updates });
        logger.debug(`Estado actualizado para ${userId}:`, updates);
    }

    public clearState(userId: string): void {
        this.states.delete(userId);
        logger.debug(`Estado limpiado para ${userId}`);
    }

    public setReconnectingStatus(isReconnecting: boolean): void {
        this.isReconnecting = isReconnecting;
        this.lastConnectionTime = Date.now();
        logger.info(`Estado de reconexión actualizado: ${isReconnecting}`);
    }

    /**
     * Detecta si un mensaje es de sincronización (mensaje antiguo que llegó durante desconexión)
     */
    public isSyncMessage(userId: string, messageId: string, messageTimestamp: number): boolean {
        const state = this.getState(userId);
        const currentTime = Date.now();
        
        // Si estamos en proceso de reconexión, ser más estricto con los mensajes
        if (this.isReconnecting) {
            // Durante reconexión, ignorar mensajes más antiguos que 30 segundos
            const syncThreshold = 30000; // 30 segundos
            if (currentTime - messageTimestamp > syncThreshold) {
                logger.info(`Mensaje de sincronización detectado para ${userId}: ${messageId} (timestamp: ${messageTimestamp})`);
                return true;
            }
        }

        // Verificar si ya procesamos este mensaje
        if (state?.lastProcessedMessageId === messageId) {
            logger.info(`Mensaje duplicado detectado para ${userId}: ${messageId}`);
            return true;
        }

        // Verificar si el mensaje es muy antiguo (más de 5 minutos)
        const oldMessageThreshold = 300000; // 5 minutos
        if (currentTime - messageTimestamp > oldMessageThreshold) {
            logger.info(`Mensaje muy antiguo detectado para ${userId}: ${messageId} (timestamp: ${messageTimestamp})`);
            return true;
        }

        return false;
    }

    /**
     * Marca un mensaje como procesado para evitar duplicados
     */
    public markMessageAsProcessed(userId: string, messageId: string, messageTimestamp: number): void {
        this.updateState(userId, {
            lastProcessedMessageId: messageId,
            lastProcessedTimestamp: messageTimestamp
        });
    }

    /**
     * Obtiene el tiempo desde la última reconexión
     */
    public getTimeSinceReconnection(): number {
        return Date.now() - this.lastConnectionTime;
    }

    /**
     * Verifica si estamos en modo de reconexión
     */
    public isInReconnectionMode(): boolean {
        return this.isReconnecting;
    }
}

export const stateManager = new ConversationStateManager();