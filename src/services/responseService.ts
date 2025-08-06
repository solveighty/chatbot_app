import fs from 'fs-extra';
import path from 'path';
import logger from '../utils/logger';
import { IResponseService } from '../interfaces/services';
import { ResponseCollection } from './logic/responseService/types/responseCollection';
import { getRandomResponseLogic } from './logic/responseService/logic/getRandomResponse';
import { determineCategoryLogic } from './logic/responseService/logic/determineCategory';
import { containsAnyLogic } from './logic/responseService/logic/containsAny';
import { getHelpMessageLogic } from './logic/responseService/logic/getHelpMessage';
import { getImageHelpMessageLogic } from './logic/responseService/logic/getImageHelpMessage';

export class ResponseService implements IResponseService {
  private responses: any = {};

  constructor() {
    this.loadResponses();
  }

  public containsAny(message: string, keywords: string[]): boolean {
    const messageLower = message.toLowerCase();
    return keywords.some(keyword => messageLower.includes(keyword.toLowerCase()));
  }

  public determineCategory(message: string): string {
    const messageLower = message.toLowerCase();

    // Detectar saludos
    if (this.containsAny(messageLower, ['hola', 'buenos días', 'buenas', 'saludos', 'buenos dias', 'buenas tardes', 'buenas noches'])) {
      return 'saludos';
    }

    // Detectar productos
    if (this.containsAny(messageLower, ['productos', 'catálogo', 'catalogo', 'ver productos', 'producto'])) {
      return 'productos';
    }

    // Detectar servicios
    if (this.containsAny(messageLower, ['servicios', 'ver servicios', 'servicio', 'hospedaje', 'alojamiento'])) {
      return 'servicios';
    }

    // Detectar imágenes
    if (this.containsAny(messageLower, ['imágenes', 'imagenes', 'ver imágenes', 'ver imagen', 'imagen', 'imagen de', 'fotos', 'foto'])) {
      return 'imagenes';
    }

    // Detectar carrito
    if (this.containsAny(messageLower, ['carrito', 'ver carrito', 'mi carrito'])) {
      return 'cart';
    }

    // Detectar compra
    if (this.containsAny(messageLower, ['comprar', 'finalizar', 'checkout'])) {
      return 'checkout';
    }

    // Detectar ayuda
    if (this.containsAny(messageLower, ['ayuda', 'help', 'comandos'])) {
      return 'help';
    }

    return 'default';
  }

  public getRandomResponse(category: string): string {
    try {
      const categoryResponses = this.responses[category];
      if (!categoryResponses || categoryResponses.length === 0) {
        return this.getDefaultResponse();
      }

      const randomIndex = Math.floor(Math.random() * categoryResponses.length);
      return categoryResponses[randomIndex];
    } catch (error) {
      logger.error('Error al obtener respuesta aleatoria:', error);
      return this.getDefaultResponse();
    }
  }

  public getHelpMessage(): string {
    return `🤖 *COMANDOS DISPONIBLES*

📋 *Navegación:*
• \`productos\` - Ver catálogo completo
• \`servicios\` - Ver servicios del monasterio
• \`imágenes\` - Ver imágenes de productos
• \`carrito\` - Ver tu carrito actual
• \`limpiar\` - Vaciar carrito

🛒 *Compras:*
• \`finalizar\` - Finalizar compra
• \`cancelar\` - Cancelar proceso

📞 *Servicios:*
• \`servicios\` - Ver servicios del monasterio
• \`quiero contactar con una hermana\` - Horarios de contacto

❓ *Ayuda:*
• \`ayuda\` - Mostrar esta ayuda

💡 *Consejo:* Escribe \`hola\` para comenzar`;
  }

  public getImageHelpMessage(): string {
    return `📸 *COMANDOS DE IMÁGENES*

• \`ver imágenes\` - Ver imágenes de productos
• \`imágenes [categoría]\` - Ver imágenes de una categoría específica
• \`[número]\` - Seleccionar imagen por número

💡 *Ejemplo:* Escribe \`imágenes panadería\` para ver imágenes de panadería`;
  }

  private async loadResponses(): Promise<void> {
    try {
      const responsesPath = path.join(process.cwd(), 'assets', 'responses.json');
      if (await fs.pathExists(responsesPath)) {
        const data = await fs.readJson(responsesPath);
        this.responses = data;
        logger.info('Respuestas cargadas exitosamente');
      } else {
        logger.warn('Archivo responses.json no encontrado, usando respuestas por defecto');
        this.responses = this.getDefaultResponses();
      }
    } catch (error) {
      logger.error('Error al cargar respuestas:', error);
      this.responses = this.getDefaultResponses();
    }
  }

  private getDefaultResponses(): any {
    return {
      saludos: [
        '🙏 ¡Bienvenido/a! ¿En qué puedo ayudarte hoy? Escribe *ver productos* para explorar nuestro catálogo o *ayuda* para más opciones.',
        '🌿 ¡Hola! Es un gusto saludarte. Escribe *ver productos* para conocer nuestros productos artesanales o *ayuda* si necesitas orientación.',
        '😊 ¡Qué alegría tenerte por aquí! Puedes escribir *ver productos* para ver lo que ofrecemos o *ayuda* para más detalles.',
        '📦 ¡Saludos! Estoy aquí para asistirte. Usa *ver productos* para conocer nuestras creaciones o *ayuda* para saber cómo funciona todo.',
        '🕊️ ¡Bendiciones! Si deseas ver nuestros productos, escribe *ver productos*. Para más información, puedes usar *ayuda*.'
      ],
      productos: [
        'Tenemos varios productos artesanales. Escribe *ver productos* para ver la lista completa.',
        'Nuestros productos son elaborados con dedicación y oración. Escribe *ver productos* para conocer nuestro catálogo.',
        'Las hermanas del monasterio elaboran productos de alta calidad. Escribe *ver productos* para más información.',
        'Contamos con ungüentos, jabones, cremas y más. Escribe *ver productos* para conocerlos.',
        'Todos nuestros productos están hechos a mano y con ingredientes naturales.',
        'Puedes revisar nuestro catálogo actualizado escribiendo *ver productos*.',
        'Cada producto lleva una intención de oración y cuidado especial.',
        'Nuestro catálogo incluye productos únicos y elaborados por las hermanas.',
        'Descubre la variedad de productos que tenemos escribiendo *ver productos*.',
        'Todos los productos tienen descripciones detalladas en el catálogo.'
      ],
      servicios: [
        'Ofrecemos servicios de hospedaje y visitas guiadas. Escribe *ver servicios* para conocer nuestras opciones.',
        'Tenemos servicios especiales para retiros espirituales. Escribe *ver servicios* para más información.',
        'Nuestros servicios incluyen hospedaje y recorridos por el monasterio. Escribe *ver servicios* para ver detalles.',
        'Contamos con servicios de hospedaje para retiros. Escribe *ver servicios* para conocer las opciones.',
        'Ofrecemos servicios espirituales y de hospedaje. Escribe *ver servicios* para más información.'
      ],
      imagenes: [
        'Puedes ver imágenes de nuestros productos escribiendo *ver imágenes*.',
        'Tenemos fotos de todos nuestros productos. Escribe *ver imágenes* para verlas.',
        'Las imágenes te ayudarán a conocer mejor nuestros productos. Escribe *ver imágenes*.',
        'Puedes ver cómo se ven nuestros productos escribiendo *ver imágenes*.',
        'Las imágenes muestran la calidad de nuestros productos. Escribe *ver imágenes* para verlas.'
      ],
      cart: [
        'Aquí está tu carrito actual. ¿Quieres agregar algo más?',
        'Estos son los productos en tu carrito. ¿Listo para comprar?',
        'Revisa tu carrito. ¿Necesitas hacer algún cambio?'
      ],
      checkout: [
        'Perfecto, vamos a finalizar tu compra. ¿Estás listo?',
        'Excelente elección. Procedamos con el checkout.',
        'Genial, completemos tu pedido. ¿Tienes toda la información lista?'
      ],
      help: [
        'Estoy aquí para ayudarte. ¿Qué necesitas saber?',
        'No dudes en preguntar. ¿En qué puedo asistirte?',
        'Estoy a tu servicio. ¿Qué información buscas?'
      ],
      general: [
        'Entiendo. ¿Puedo ayudarte con algo más específico?',
        'Interesante. ¿Qué más te gustaría saber?',
        'Gracias por tu mensaje. ¿En qué puedo ser útil?'
      ]
    };
  }

  private getDefaultResponse(): string {
    return 'Lo siento, no entiendo tu mensaje. Escribe "ayuda" para ver los comandos disponibles.';
  }
}