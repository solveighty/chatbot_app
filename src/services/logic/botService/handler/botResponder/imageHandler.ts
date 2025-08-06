import { IConversationStateManager, IProductService, IServiceService } from '../../../../../interfaces/services';
import { MessageMedia } from 'whatsapp-web.js';
import { SolicitudImagenHandler } from './solicitudImagenHandler';
import { normalizeString } from '../../../../../utils/stringUtils';

export class ImageHandler {
  private solicitudImagenHandler: SolicitudImagenHandler;
  constructor(
    private readonly productService: IProductService,
    private readonly serviceService: IServiceService,
    private readonly stateManager: IConversationStateManager
  ) {
    this.solicitudImagenHandler = new SolicitudImagenHandler(this.productService, this.stateManager);
  }

  public async handleImageRequest(userId: string, userMessage: string, state: any): Promise<string | { text: string, media?: MessageMedia }> {
    const userMessageLower = normalizeString(userMessage);

    // If the user just types 'imagen' or 'imagenes', provide the full menu
    if (userMessageLower === 'imagen' || userMessageLower === 'imagenes') {
      this.stateManager.updateState(userId, { lastCategory: 'menu_imagenes' });
      return this.generateCompleteImageMenu();
    }

    // Handle specific numeric IDs (products or services)
    const numericCodeMatch = userMessageLower.match(/\b(\d+(\.\d+)?)\b/);
    if (numericCodeMatch) {
      const code = numericCodeMatch[1];
      const producto = this.productService.getProductById(parseInt(code));
      const servicio = this.serviceService.getServiceById(parseInt(code));

      if (producto) {
        const media = await this.productService.obtenerImagenProducto(producto);
        if (media) {
          this.stateManager.updateState(userId, { lastCategory: 'imagen_producto' });
          return { text: `📷 Imagen de ${producto.nombre}:`, media: media };
        } else {
          return `❌ No se encontró una imagen para ${producto.nombre}.`;
        }
      } else if (servicio) {
        this.stateManager.updateState(userId, { lastCategory: 'imagen_servicio' });
        return `🏛 *${servicio.nombre}*\n\n${servicio.contacto.mensaje}`;
      } else {
        return `❌ No se encontró un producto o servicio con el ID *${code}*.`;
      }
    }

    // Handle category requests
    const categoryResponse = await this.handleCategoryImageRequest(userId, userMessage);
    if (categoryResponse) {
      return categoryResponse;
    }

    // Handle specific product/service name requests
    return await this.handleProductImageRequest(userId, userMessage);
  }

  public async handleCategoryImageRequest(userId: string, userMessage: string): Promise<string | { text: string, media?: MessageMedia }> {
    const userMessageLower = normalizeString(userMessage);
    
    // Remove image-related words to get the category name
    const categoryName = userMessageLower
      .replace(/ver imagen|imagen de|fotos|foto/gi, '')
      .trim();

    if (!categoryName) {
      return "❌ Por favor, especifica una categoría. Ejemplo: *ver imagen miel* o *ver imagen hospedaje*";
    }

    // Check product categories with common terms mapping
    const terminosComunes: { [key: string]: string } = {
      'miel': 'Miel de Abeja',
      'cake': 'Cake',
      'alfajores': 'Alfajores',
      'manjar': 'Manjar de Leche',
      'propoleo': 'Propóleo',
      'iconos': 'Iconos Religiosos',
      'ceramica': 'Cerámicas',
      'cerámica': 'Cerámicas',
      'fundas': 'Fundas Ecológicas',
      'rosarios': 'Rosarios',
      'cactus': 'Cactus',
      'cd': 'CD Himno Monástico',
      'cirios': 'Cirios Pascuales',
      'cirio': 'Cirios Pascuales',
      'pulseras': 'Pulseras - Denarios',
      'denarios': 'Pulseras - Denarios',
      'hospedaje': 'Hospedaje',
      'alojamiento': 'Hospedaje',
      'encuadernacion': 'Encuadernación',
      'encuadernación': 'Encuadernación'
    };

    // Check if it matches a common term
    for (const [termino, categoria] of Object.entries(terminosComunes)) {
      if (categoryName.includes(termino)) {
        // Check if it's a product category
        const categoriasProductos = this.productService.getCategorias();
        if (categoriasProductos.includes(categoria)) {
          const productosCategoria = this.productService.getProductosPorCategoria(categoria);
          if (productosCategoria.length > 0) {
            let mensaje = `📷 *Productos de ${categoria} (${productosCategoria.length}):*\n`;
            productosCategoria.forEach((producto, index) => {
              const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
              mensaje += `- ${producto.id} ${producto.nombre}: $${precioFormateado}\n`;
            });
            mensaje += `\n💬 Para ver la imagen de un producto específico, escribe: *ver imagen [código]*\n`;
            mensaje += `Ejemplo: ver imagen ${productosCategoria[0].id} para ver el primer producto de esta categoría\n`;
            mensaje += `🔙 Para ver todas las categorías, escribe: *ver imágenes*`;
            return mensaje;
          }
        }
        
        // Check if it's a service category
        const categoriasServicios = this.serviceService.getServiceCategories();
        if (categoriasServicios.includes(categoria)) {
          const serviciosCategoria = this.serviceService.getServiceByCategory(categoria);
          if (serviciosCategoria && serviciosCategoria.productos.length > 0) {
            let mensaje = `🏛️ *Servicios de ${categoria}*\n\n`;
            mensaje += `*Servicios disponibles:*\n`;
            serviciosCategoria.productos.forEach((servicio: any, index: number) => {
              mensaje += `- ${servicio.id} ${servicio.nombre}\n`;
              mensaje += `  ${servicio.descripcion}\n`;
              mensaje += `  📞 Contacto: ${servicio.contacto.telefono}\n\n`;
            });
            mensaje += `💬 Para obtener información específica, escribe: *ver imagen [ID del servicio]*\n`;
            mensaje += `Ejemplo: ver imagen ${serviciosCategoria.productos[0].id}\n`;
            mensaje += `🔙 Para ver todas las categorías, escribe: *ver imágenes*`;
            return mensaje;
          }
        }
      }
    }

    return `❌ No se encontró la categoría "${categoryName}". Por favor, intenta con otro nombre o escribe *ver imágenes* para ver todas las categorías disponibles.`;
  }

  public async handleImageMenuRequest(): Promise<string> {
    let message = `📷 *Menú de Imágenes:*

`;
    message += "Para ver la imagen de un producto o servicio, escribe: *ver imagen [nombre]* o *imagen [nombre]*\n\n";
    message += "*Productos disponibles:*\n";
    this.productService.getCategorias().forEach(cat => {
      message += `- ${cat}\n`;
    });
    message += "\n*Servicios disponibles:*\n";
    this.serviceService.getServiceCategories().forEach((servCat: any) => {
      message += `- ${servCat}\n`;
    });
    message += "\nEjemplo: ver imagen Frasco de 500 ml\nEjemplo: imagen Habitación Individual\n";
    message += "\nPara más ayuda, escribe: *ayuda*";
    return message;
  }

  public async handleProductImageRequest(userId: string, userMessage: string): Promise<string | { text: string, media?: any }> {
    const userMessageLower = normalizeString(userMessage);
    // Si el usuario solo escribe 'ver imagenes' o 'ver imágenes', mostrar el menú
    if (userMessageLower === 'ver imagenes' || userMessageLower === 'ver imágenes') {
      return await this.handleImageMenuRequest();
    }
    // Extraer el nombre del producto o servicio
    const nombreItem = userMessageLower
      .replace(/ver imagen|imagen/gi, '')
      .trim();

    if (!nombreItem) {
      return await this.handleImageMenuRequest();
    }

    // Buscar producto por nombre (insensible a tildes y mayúsculas)
    const productos = this.productService.getProductos();
    let producto = null;
    for (const cat of productos) {
      producto = cat.productos.find((p: any) => normalizeString(p.nombre) === nombreItem);
      if (producto) break;
    }
    if (producto) {
      const media = await this.productService.obtenerImagenProducto(producto);
      if (media) {
        this.stateManager.updateState(userId, { lastCategory: 'imagen_producto' });
        return { text: `📷 Imagen de ${producto.nombre}:`, media: media };
      } else {
        return `❌ No se encontró una imagen para ${producto.nombre}.`;
      }
    }

    // Buscar servicio por nombre (insensible a tildes y mayúsculas)
    const servicios = this.serviceService.getServices();
    let servicioEncontrado = null;
    for (const cat of servicios) {
      servicioEncontrado = cat.productos.find((s: any) => normalizeString(s.nombre) === nombreItem);
      if (servicioEncontrado) break;
    }
    if (servicioEncontrado) {
      // Intentar enviar imagen si existe
      if (servicioEncontrado.imagen) {
        const path = require('path');
        const fs = require('fs');
        const { MessageMedia } = require('whatsapp-web.js');
        const mediaPath = path.resolve(process.cwd(), 'dist/data', servicioEncontrado.imagen);
        if (fs.existsSync(mediaPath)) {
          this.stateManager.updateState(userId, { lastCategory: 'imagen_servicio' });
          const media = MessageMedia.fromFilePath(mediaPath);
          return {
            text: `🏛️ *${servicioEncontrado.nombre}*\n\n${servicioEncontrado.descripcion}\n\n📱 *Contacto:* ${servicioEncontrado.contacto.telefono}\n\n${servicioEncontrado.contacto.mensaje}`,
            media
          };
        }
      }
      // Si no hay imagen, solo texto
      this.stateManager.updateState(userId, { lastCategory: 'imagen_servicio' });
      return `🏛️ *${servicioEncontrado.nombre}*\n\n${servicioEncontrado.descripcion}\n\n📱 *Contacto:* ${servicioEncontrado.contacto.telefono}\n\n${servicioEncontrado.contacto.mensaje}`;
    }

    // Si no se encuentra, sugerir alternativas
    return `❌ No se encontró ningún producto o servicio con ese nombre.\n\nAsegúrate de escribir el nombre tal como aparece en el menú.\nPara ver el menú de imágenes, escribe: *ver imágenes*`;
  }

  private generateCompleteImageMenu(): string {
    let message = "📷 *Menú de Imágenes:*\n\n";
    message += "Para ver imágenes de productos o detalles de servicios, puedes:\n";
    message += "1. Escribir *ver imagen [ID]* (ej. *ver imagen 1.1* para un producto, *ver imagen 15* para un servicio).\n";
    message += "2. Escribir *ver imagen [nombre]* (ej. *ver imagen Frasco de 500 ml*, *ver imagen Habitación Individual*).\n";
    message += "3. Escribir *ver imagen [categoría]* para ver los elementos de esa categoría (ej. *ver imagen Miel de Abeja*, *ver imagen Hospedaje*).\n\n";

    message += "*Categorías de Productos:*\n";
    this.productService.getCategorias().forEach(cat => {
      message += `- ${cat}\n`;
    });

    message += "\n*Categorías de Servicios:*\n";
    this.serviceService.getServiceCategories().forEach((servCat: any) => {
      message += `- ${servCat}\n`;
    });

    message += "\nPara más ayuda, escribe: *ayuda*";
    return message;
  }
} 