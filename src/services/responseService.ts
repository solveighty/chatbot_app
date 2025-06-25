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
           `1️⃣ Escribe *ver productos* para ver el catálogo completo con códigos numéricos\n\n` +
           `2️⃣ Identifica el código del producto que deseas comprar\n\n` +
           `3️⃣ Selecciona un producto usando su código numérico:\n` +
           `   ✅ Ejemplo: "1.2" (Categoría 1, Producto 2)\n` +
           `   ✅ Ejemplo: "1.2.3" (Categoría 1, Producto 2, Variante 3)\n` +
           `   ✅ También puedes escribir: "quiero comprar 1.2"\n\n` +
           `4️⃣ *Indica la cantidad de unidades* cuando se te pregunte\n\n` +
           `5️⃣ Puedes añadir más productos a tu carrito repitiendo los pasos anteriores\n\n` +
           `6️⃣ Cuando termines, escribe *carrito* para ver tu selección\n\n` +
           `7️⃣ Escribe *finalizar compra* para proceder al pago\n\n` +
           `8️⃣ Proporciona tus datos completos de contacto cuando se te soliciten\n\n` +
           `9️⃣ Confirma tu pedido\n\n` +
           `📌 *Comandos del carrito:*\n` +
           `➕ *añadir [código]* - Añadir producto por su código\n` +
           `➕ *añadir [cantidad] [código]* - Añadir cantidad específica\n` +
           `➖ *quitar [número]* - Elimina un producto por su número en el carrito\n` +
           `🛒 *carrito* - Ver tu carrito actual\n` +
           `❌ *vaciar carrito* - Elimina todos los productos\n` +
           `✅ *finalizar compra* - Procede al pago\n\n` +
           `Si tienes problemas con tu pedido, escribe *ayuda* en cualquier momento.`;
  }

  public getImageHelpMessage(): string {
    return `📷 *Cómo ver imágenes de productos:*\n\n` +
           `1. Escribe *ver imágenes* para ver todas las categorías disponibles\n\n` + 
           `2. Selecciona una categoría usando su código numérico:\n` +
           `   Ejemplo: *ver imágenes 1* (muestra todos los productos de la categoría 1)\n\n` +
           `3. Para ver la imagen de un producto específico, usa su código completo:\n` +
           `   Ejemplo: *ver imágenes 1.2* (muestra el producto 2 de la categoría 1)\n\n` +
           `💡 También puedes escribir directamente el número cuando estés en el menú de imágenes:\n` +
           `   Por ejemplo, solo escribe *1* o *1.2*\n\n` +
           `🛒 Para comprar un producto después de ver su imagen, escribe:\n` +
           `   *quiero comprar [código]* (Ejemplo: quiero comprar 1.2)`;
  }
}