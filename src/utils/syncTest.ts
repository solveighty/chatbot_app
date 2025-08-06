import { stateManager } from '../services/conversationStateManager';
import logger from './logger';

/**
 * Script de prueba para verificar el sistema de detección de mensajes de sincronización
 */
export function testSyncDetection() {
  logger.info('🧪 Iniciando pruebas de detección de sincronización...');

  const userId = 'test-user@c.us';
  const currentTime = Date.now();

  // Simular mensaje reciente (no debería ser detectado como sync)
  const recentMessage = {
    id: 'recent-msg-1',
    timestamp: currentTime - 10000 // 10 segundos atrás
  };

  // Simular mensaje antiguo (debería ser detectado como sync)
  const oldMessage = {
    id: 'old-msg-1',
    timestamp: currentTime - 400000 // 6.6 minutos atrás
  };

  // Simular mensaje durante reconexión
  const syncMessage = {
    id: 'sync-msg-1',
    timestamp: currentTime - 60000 // 1 minuto atrás
  };

  // Probar mensaje reciente
  const isRecentSync = stateManager.isSyncMessage(userId, recentMessage.id, recentMessage.timestamp);
  logger.info(`Mensaje reciente (${recentMessage.id}): ${isRecentSync ? 'DETECTADO COMO SYNC' : 'OK'}`);

  // Probar mensaje antiguo
  const isOldSync = stateManager.isSyncMessage(userId, oldMessage.id, oldMessage.timestamp);
  logger.info(`Mensaje antiguo (${oldMessage.id}): ${isOldSync ? 'DETECTADO COMO SYNC' : 'ERROR'}`);

  // Simular reconexión
  stateManager.setReconnectingStatus(true);
  
  // Probar mensaje durante reconexión
  const isSyncDuringReconnection = stateManager.isSyncMessage(userId, syncMessage.id, syncMessage.timestamp);
  logger.info(`Mensaje durante reconexión (${syncMessage.id}): ${isSyncDuringReconnection ? 'DETECTADO COMO SYNC' : 'ERROR'}`);

  // Marcar mensaje como procesado
  stateManager.markMessageAsProcessed(userId, recentMessage.id, recentMessage.timestamp);
  
  // Probar mensaje duplicado
  const isDuplicate = stateManager.isSyncMessage(userId, recentMessage.id, recentMessage.timestamp);
  logger.info(`Mensaje duplicado (${recentMessage.id}): ${isDuplicate ? 'DETECTADO COMO SYNC' : 'ERROR'}`);

  // Restaurar estado normal
  stateManager.setReconnectingStatus(false);

  logger.info('✅ Pruebas de detección de sincronización completadas');
}

/**
 * Función para limpiar el estado de prueba
 */
export function cleanupTestState() {
  stateManager.clearState('test-user@c.us');
  logger.info('🧹 Estado de prueba limpiado');
} 