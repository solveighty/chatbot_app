import mqtt from 'mqtt';
import os from 'os';
import logger from './logger';

interface MqttConfig {
  broker: string;
  port: number;
  topic: string;
  clientId: string;
}

interface ServerInfo {
  ip: string;
  port: number;
  timestamp: string;
  hostname: string;
}

export class MqttService {
  private client: any = null;
  private config: MqttConfig;
  private serverInfo: ServerInfo;

  constructor(serverPort: number) {
    this.config = {
      broker: '147c3fd5edc245df89abcab67f04047b.s1.eu.hivemq.cloud', // Broker HiveMQ online
      port: 8883, // Puerto TLS de HiveMQ
      topic: 'monasterio/server-info',
      clientId: `monasterio-server-${Date.now()}`
    };

    this.serverInfo = {
      ip: '127.0.0.1', // IP temporal, se actualizará en start()
      port: serverPort,
      timestamp: new Date().toISOString(),
      hostname: os.hostname()
    };
  }

  /**
   * Obtiene la dirección IP local del servidor usando interfaces de red preferidas
   */
  private getLocalIP(): string {
    // Adaptadores preferidos (puedes agregar más si es necesario)
    const preferredInterfaces = ['Wi-Fi', 'Ethernet', 'LAN inalámbrica', 'WiFi', 'Wireless LAN adapter'];
    
    // Obtener interfaces de red
    const interfaces = os.networkInterfaces();
    
    let ip: string | undefined;
    
    // Buscar en interfaces preferidas
    for (const name of preferredInterfaces) {
      const iface = interfaces[name];
      if (iface) {
        for (const alias of iface) {
          if (alias.family === 'IPv4' && !alias.internal) {
            ip = alias.address;
            logger.info(`IP local detectada en ${name}: ${ip}`);
            break;
          }
        }
      }
      if (ip) break;
    }
    
    // Si no se encuentra en interfaces preferidas, buscar en todas las interfaces
    if (!ip) {
      for (const name of Object.keys(interfaces)) {
        const networkInterface = interfaces[name];
        if (networkInterface) {
          for (const interface_ of networkInterface) {
            // Ignorar interfaces que no sean IPv4 o que sean loopback
            if (interface_.family === 'IPv4' && !interface_.internal) {
              ip = interface_.address;
              logger.info(`IP local detectada en ${name}: ${ip}`);
              break;
            }
          }
        }
        if (ip) break;
      }
    }
    
    if (ip) {
      return ip;
    }
    
    // Fallback a localhost si no se encuentra una IP válida
    logger.warn('No se pudo encontrar una IP válida, usando localhost');
    return '127.0.0.1';
  }

  /**
   * Inicia el servicio MQTT
   */
  public start(): void {
    try {
      // Obtener la IP local antes de iniciar
      const localIP = this.getLocalIP();
      this.serverInfo.ip = localIP;
      
      logger.info(`Iniciando servicio MQTT en ${this.config.broker}:${this.config.port} con IP: ${localIP}`);
      
      // Conectar al broker MQTT HiveMQ con TLS y credenciales
      this.client = mqtt.connect(`mqtts://${this.config.broker}:${this.config.port}`, {
        clientId: this.config.clientId,
        username: 'web-api',
        password: 'Web12345',
        clean: true,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        rejectUnauthorized: false // Para desarrollo, en producción usar certificados válidos
      });

      // Eventos del cliente MQTT
      this.client.on('connect', () => {
        logger.info('Conectado al broker MQTT local');
        this.publishServerInfo();
        
        // Publicar información del servidor cada 30 segundos
        setInterval(() => {
          this.publishServerInfo();
        }, 30000);
      });

      this.client.on('error', (error: Error) => {
        logger.error(`Error en conexión MQTT: ${error.message}`);
      });

      this.client.on('close', () => {
        logger.warn('Conexión MQTT cerrada');
      });

      this.client.on('reconnect', () => {
        logger.info('Reconectando al broker MQTT...');
      });

    } catch (error) {
      logger.error(`Error al iniciar servicio MQTT: ${error}`);
    }
  }

  /**
   * Publica la información del servidor
   */
  private publishServerInfo(): void {
    if (!this.client || !this.client.connected) {
      logger.warn('Cliente MQTT no conectado, no se puede publicar información');
      return;
    }

    try {
      // Actualizar timestamp
      this.serverInfo.timestamp = new Date().toISOString();
      
      const message = JSON.stringify(this.serverInfo);
      
      this.client.publish(this.config.topic, message, { qos: 1 }, (error: Error | undefined) => {
        if (error) {
          logger.error(`Error al publicar información del servidor: ${error.message}`);
        } else {
          logger.debug(`Información del servidor publicada en ${this.config.topic}: ${message}`);
        }
      });
    } catch (error) {
      logger.error(`Error al publicar información del servidor: ${error}`);
    }
  }

  /**
   * Detiene el servicio MQTT
   */
  public stop(): void {
    if (this.client) {
      logger.info('Deteniendo servicio MQTT...');
      this.client.end();
      this.client = null;
    }
  }

  /**
   * Obtiene la información actual del servidor
   */
  public getServerInfo(): ServerInfo {
    return { ...this.serverInfo };
  }

  /**
   * Actualiza la configuración del broker MQTT
   */
  public updateConfig(newConfig: Partial<MqttConfig>): void {
    this.config = { ...this.config, ...newConfig };
    logger.info(`Configuración MQTT actualizada: ${JSON.stringify(this.config)}`);
  }
} 