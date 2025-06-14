import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';

interface ResponseCollection {
  [key: string]: string[];
}

export class ResponseService {
  private responses: ResponseCollection;

  constructor() {
    try {
      const filePath = path.join(__dirname, '../data/responses.json');
      const data = fs.readFileSync(filePath, 'utf8');
      this.responses = JSON.parse(data);
      logger.info('Respuestas cargadas correctamente');
    } catch (error) {
      logger.error(`Error al cargar las respuestas: ${error}`);
      this.responses = {
        default: ["Lo siento, estoy teniendo problemas técnicos."]
      };
    }
  }

  /**
   * Obtiene una respuesta aleatoria de una categoría específica
   * @param category La categoría de respuesta (ej: "saludos", "despedidas")
   * @returns Una respuesta aleatoria de la categoría especificada o una respuesta por defecto
   */
  public getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  /**
   * Determina la categoría de respuesta basada en el mensaje del usuario
   * @param message El mensaje del usuario
   * @returns La categoría de respuesta determinada
   */
  public determineCategory(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (this.containsAny(lowerMessage, ['hola', 'buenos días', 'buenas', 'saludos', 'hey'])) {
      return 'saludos';
    }
    
    if (this.containsAny(lowerMessage, ['adiós', 'chao', 'hasta luego', 'bye', 'nos vemos', 'gracias'])) {
      return 'despedidas';
    }
    
    if (this.containsAny(lowerMessage, ['gracias', 'te agradezco', 'muchas gracias'])) {
      return 'agradecimientos';
    }
    
    return 'default';
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}