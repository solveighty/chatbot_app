import { IConversationStateManager, IProductService, IServiceService, IResponseService, ICartService } from '../../../interfaces/services';
import { CommandHandler } from '../../../handlers/commandHandler';
import logger from '../../../utils/logger';
import { ProductPurchaseHandler } from './handler/botResponder/productPurchaseHandler';
import { ServiceInquiryHandler } from './handler/botResponder/serviceInquiryHandler';
import { CheckoutHandler } from './handler/botResponder/checkoutHandler';
import { ImageHandler } from './handler/botResponder/imageHandler';
import { RespuestaGenericaHandler } from './handler/botResponder/respuestaGenericaHandler';
import { CompraHandler } from './handler/botResponder/compraHandler';
import { normalizeString } from '../../../utils/stringUtils';

export class BotResponder {
  constructor(
    private stateManager: IConversationStateManager,
    private commandHandler: CommandHandler,
    private productService: IProductService,
    private serviceService: IServiceService,
    private responseService: IResponseService,
    private cartService: ICartService,
    private productPurchaseHandler: ProductPurchaseHandler,
    private serviceInquiryHandler: ServiceInquiryHandler,
    private checkoutHandler: CheckoutHandler,
    private imageHandler: ImageHandler,
    private respuestaGenericaHandler: RespuestaGenericaHandler,
    private compraHandler: CompraHandler
  ) { }

  public async procesarMensaje(userId: string, message: string): Promise<string | { text: string, media?: any }> {
    logger.info(`🤖 Procesando mensaje de ${userId}: "${message}"`);
    
    const state = this.stateManager.getState(userId);
    const userMessageLower = normalizeString(message);
    
    logger.info(`📊 Estado del usuario: ${JSON.stringify(state)}`);

    // High-priority handlers for multi-step processes
    const serviceInquiryResponse = await this.serviceInquiryHandler.handleServiceInquiry(userId, message, state);
    if (serviceInquiryResponse) {
      logger.info(`✅ Respuesta de ServiceInquiryHandler: ${typeof serviceInquiryResponse === 'string' ? serviceInquiryResponse.substring(0, 100) + '...' : 'objeto'}`);
      return serviceInquiryResponse;
    }

    const productPurchaseResponse = await this.productPurchaseHandler.handleProductPurchase(userId, message, state);
    if (productPurchaseResponse) {
      logger.info(`✅ Respuesta de ProductPurchaseHandler: ${typeof productPurchaseResponse === 'string' ? productPurchaseResponse.substring(0, 100) + '...' : 'objeto'}`);
      return productPurchaseResponse;
    }

    // Handle checkout - solo si el mensaje contiene "finalizar compra"
    if (userMessageLower.includes('finalizar compra')) {
      const checkoutResponse = await this.checkoutHandler.handleCheckout(userId, message, state);
      if (checkoutResponse) {
        logger.info(`✅ Respuesta de CheckoutHandler: ${typeof checkoutResponse === 'string' ? checkoutResponse.substring(0, 100) + '...' : 'objeto'}`);
        return checkoutResponse;
      }
    }

    // Handle greetings
    if (this.responseService.determineCategory(userMessageLower) === 'saludos') {
      return this.respuestaGenericaHandler.manejarRespuestaGenerica(userId, userMessageLower);
    }

    // Handle cancellation
    if (userMessageLower.includes('cancelar') || userMessageLower.includes('no') || userMessageLower.includes('salir')) {
      this.stateManager.clearState(userId);
      return '❌ Proceso cancelado. ¿En qué más puedo ayudarte?';
    }

    // Handle "quiero comprar" command
    if (userMessageLower.includes('quiero comprar')) {
      return await this.compraHandler.manejarCompra(userId, message);
    }

    // Handle cart commands
    if (userMessageLower.includes('carrito')) {
      return this.cartService.generateCartSummary(userId);
    }

    // Handle checkout - ya manejado arriba

    // Handle help
    if (userMessageLower.includes('ayuda')) {
      return this.responseService.getHelpMessage();
    }

    // Handle image commands - simplified logic
    if (userMessageLower.includes('ver imagen') || userMessageLower.includes('imagen de') || userMessageLower.includes('fotos') || userMessageLower === 'imagen' || userMessageLower === 'imagenes') {
      return await this.imageHandler.handleImageRequest(userId, message, state);
    }

    // Handle category names directly (without "ver imagen")
    const categoryResponse = await this.handleCategoryDirect(userId, message, userMessageLower);
    if (categoryResponse) {
      return categoryResponse;
    }

    // Handle service names directly
    const serviceResponse = this.handleServiceDirect(userId, message, userMessageLower);
    if (serviceResponse) {
      return serviceResponse;
    }

    // Handle numeric codes (product/service IDs)
    const numericCodeMatch = userMessageLower.match(/^(\d+(\.\d+)?)$/);
    if (numericCodeMatch) {
      const code = numericCodeMatch[1];
      const result = await this.commandHandler.handleCommand(code, userId, state);
      if (result.response) {
        this.stateManager.updateState(userId, { lastCategory: result.stateUpdates?.lastCategory || 'menu_principal' });
        return result.response;
      }
    }

    // Handle other commands via CommandHandler
    const commandResult = await this.commandHandler.handleCommand(message, userId, state);
    if (commandResult.response) {
      this.stateManager.updateState(userId, { lastCategory: commandResult.stateUpdates?.lastCategory || 'menu_principal' });
      return commandResult.response;
    }

    // Default response
    const defaultResponse = this.responseService.getRandomResponse('default');
    logger.info(`🔄 Respuesta por defecto: ${defaultResponse.substring(0, 100)}...`);
    return defaultResponse;
  }

  private async handleCategoryDirect(userId: string, userMessage: string, userMessageLower: string): Promise<string | null> {
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

    // Check if the message matches a common term
    for (const [termino, categoria] of Object.entries(terminosComunes)) {
      if (userMessageLower.includes(termino)) {
        // Check if it's a product category
        const categoriasProductos = this.productService.getCategorias();
        if (categoriasProductos.includes(categoria)) {
          const result = await this.productService.procesarSeleccionCategoria(categoria);
          return result.texto;
        }
        
        // Check if it's a service category
        const categoriasServicios = this.serviceService.getServiceCategories();
        if (categoriasServicios.includes(categoria)) {
          return this.serviceService.generateServicesMenu();
        }
      }
    }

    return null;
  }

  private handleServiceDirect(userId: string, userMessage: string, userMessageLower: string): string | null {
    // Check for specific service names
    const servicios = this.serviceService.getServices();
    for (const categoria of servicios) {
      for (const servicio of categoria.productos) {
        if (normalizeString(servicio.nombre) === userMessageLower) {
          return `🏛️ *${servicio.nombre}*\n\n${servicio.descripcion}\n\n📱 *Contacto:* ${servicio.contacto.telefono}\n\n${servicio.contacto.mensaje}`;
        }
      }
    }

    return null;
  }
}