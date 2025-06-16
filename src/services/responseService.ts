import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { IResponseService } from '../interfaces/services';

interface ResponseCollection {
  [key: string]: string[];
}

export class ResponseService implements IResponseService {
  private responses: ResponseCollection;

  constructor() {
    try {
      const filePath = path.resolve(process.cwd(), 'src/data/responses.json');
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

  public getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
  }

  public determineCategory(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Ayuda
    if (this.containsAny(lowerMessage, ['ayuda', 'cómo comprar', 'como comprar', 'instrucciones', 'help'])) {
      return 'ayuda';
    }
    
    // Intenciones de compra
    if (this.containsAny(lowerMessage, ['comprar', 'quiero', 'pedir', 'adquirir', 'precio', 'cuesta', 'valor'])) {
      return 'compra';
    }
    
    // Saludos
    if (this.containsAny(lowerMessage, ['hola', 'buenos días', 'buenas', 'saludos', 'hey'])) {
      return 'saludos';
    }
    
    // Despedidas
    if (this.containsAny(lowerMessage, ['adiós', 'chao', 'hasta luego', 'bye', 'nos vemos'])) {
      return 'despedidas';
    }
    
    // Agradecimientos
    if (this.containsAny(lowerMessage, ['gracias', 'te agradezco', 'muchas gracias'])) {
      return 'agradecimientos';
    }
    
    // Productos
    if (this.containsAny(lowerMessage, ['producto', 'catálogo', 'venden', 'tienen', 'disponible'])) {
      return 'productos';
    }
    
    return 'default';
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
  
  public getHelpMessage(): string {
    return `📝 *¿Cómo hacer un pedido?*\n\n` +
           `Para hacer un pedido, sigue estos pasos:\n\n` +
           `1️⃣ Escribe *ver productos* para ver el catálogo completo\n\n` +
           `2️⃣ Identifica el producto exacto que deseas comprar\n\n` +
           `3️⃣ Para productos normales:\n` +
           `   ✅ Ejemplo: "quiero comprar Frasco de 500 ml"\n\n` +
           `4️⃣ Para productos con colores o variantes:\n` +
           `   ✅ Ejemplo: "quiero comprar De 12 cm Color blanco"\n` +
           `   ✅ Ejemplo: "quiero comprar Fundas Ecológicas Color café"\n\n` +
           `5️⃣ *Indica la cantidad de unidades* cuando se te pregunte\n\n` +
           `6️⃣ Puedes añadir más productos a tu carrito repitiendo los pasos anteriores\n\n` +
           `7️⃣ Cuando termines de agregar productos, escribe *carrito* para ver tu selección\n\n` +
           `8️⃣ Escribe *finalizar compra* para proceder al pago\n\n` +
           `9️⃣ Proporciona tus datos completos de contacto cuando se te soliciten:\n` +
           `   • Nombre completo\n` +
           `   • Dirección de entrega\n` +
           `   • Número de teléfono\n\n` +
           `🔟 Confirma tu pedido\n\n` +
           `📌 *Comandos del carrito:*\n` +
           `➕ *añadir [producto]* - Añadir producto (te preguntará la cantidad)\n` +
           `➕ *añadir [cantidad] [producto]* - Añadir cantidad específica\n` +
           `➖ *quitar [número]* - Elimina un producto por su número en el carrito\n` +
           `🛒 *carrito* - Ver tu carrito actual\n` +
           `❌ *vaciar carrito* - Elimina todos los productos\n` +
           `✅ *finalizar compra* - Procede al pago\n\n` +
           `Si tienes problemas con tu pedido, escribe *ayuda* en cualquier momento.`;
  }
}