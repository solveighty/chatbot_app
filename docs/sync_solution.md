# Solución para Problemas de Sincronización de Mensajes

## Problema Identificado

Cuando el chatbot de WhatsApp se ejecuta en un Raspberry Pi y se desconecta, al reconectarse, WhatsApp Web.js sincroniza todos los mensajes que llegaron durante la desconexión. Estos mensajes se procesan como si fueran nuevos, causando confusión en el flujo de conversación y respuestas duplicadas.

## Solución Implementada

### 1. Configuración de Sincronización Optimizada

Se modificó `src/config/environment.ts` para incluir opciones de sincronización que minimizan el problema:

```typescript
export const WHATSAPP_CLIENT_OPTIONS = {
    puppeteer: {
        headless: process.env.HEADLESS === 'true',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    // Opciones para manejar mejor la sincronización
    syncAllChats: false, // No sincronizar todos los chats automáticamente
    syncUnreadOnly: true, // Solo sincronizar mensajes no leídos
    // Configuración detallada para evitar sincronización innecesaria
    syncOptions: {
        syncUnreadOnly: true,
        syncAllChats: false,
        // ... otras opciones de sincronización
    }
};
```

### 2. Sistema de Detección de Mensajes de Sincronización

Se implementó un sistema inteligente en `src/services/conversationStateManager.ts` que:

- **Detecta mensajes de sincronización** basándose en timestamps
- **Filtra mensajes duplicados** usando IDs únicos
- **Maneja estados de reconexión** para ser más estricto durante la sincronización
- **Mantiene un registro** de mensajes procesados

#### Criterios de Detección:

1. **Mensajes durante reconexión**: Si el bot está reconectando, ignora mensajes más antiguos que 30 segundos
2. **Mensajes duplicados**: Verifica si ya procesó el mismo ID de mensaje
3. **Mensajes muy antiguos**: Ignora mensajes más antiguos que 5 minutos

### 3. Manejo de Eventos de Conexión

Se actualizó `src/core/handler/clientEventHandlers.ts` para:

- **Detectar desconexiones** y marcar el estado como "reconectando"
- **Detectar reconexiones** y restaurar el estado normal
- **Filtrar mensajes** antes de procesarlos
- **Marcar mensajes como procesados** para evitar duplicados

### 4. Logging Mejorado

El sistema incluye logs detallados para:
- Mensajes de sincronización detectados
- Estados de reconexión
- Mensajes duplicados
- Timestamps de mensajes

## Cómo Funciona

### Flujo Normal:
1. Usuario envía mensaje
2. Sistema verifica si es un mensaje de sincronización
3. Si no es sync, procesa normalmente
4. Marca el mensaje como procesado

### Durante Reconexión:
1. Bot se desconecta → `handleDisconnected()` marca estado como reconectando
2. Bot se reconecta → `handleReady()` restaura estado normal
3. Mensajes antiguos llegan → Sistema los detecta como sync y los ignora
4. Solo mensajes recientes se procesan

## Configuración

### Variables de Entorno:
```env
NODE_ENV=development  # Para ejecutar pruebas de sincronización
```

### Umbrales Configurables:
- **Sync Threshold**: 30 segundos (durante reconexión)
- **Old Message Threshold**: 5 minutos (mensajes muy antiguos)
- **Reconnection Timeout**: Configurable según necesidades

## Pruebas

Se incluye un sistema de pruebas en `src/utils/syncTest.ts` que verifica:
- Detección de mensajes recientes vs antiguos
- Comportamiento durante reconexión
- Detección de duplicados
- Limpieza de estado

Para ejecutar las pruebas:
```bash
NODE_ENV=development npm start
```

## Beneficios

1. **Elimina respuestas duplicadas** durante reconexión
2. **Mantiene el flujo de conversación** intacto
3. **Reduce carga del servidor** al filtrar mensajes innecesarios
4. **Mejora la experiencia del usuario** al evitar confusión
5. **Proporciona logs detallados** para debugging

## Monitoreo

El sistema registra automáticamente:
- Mensajes de sincronización detectados
- Estados de reconexión
- Timestamps de mensajes procesados
- Errores de procesamiento

Estos logs se pueden encontrar en el directorio `logs/` para análisis y debugging. 