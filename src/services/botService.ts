import { IProductService, ICartService, IConversationStateManager, IResponseService, IServiceService } from '../interfaces/services';
import { BotResponder } from './logic/botService/botResponder';
import { OrderService } from './orderService';
import { CommandHandler } from '../handlers/commandHandler';
import { CheckoutProcessor } from './logic/botService/checkoutProcessor';
import { ProductPurchaseHandler } from './logic/botService/handler/botResponder/productPurchaseHandler';
import { ServiceInquiryHandler } from './logic/botService/handler/botResponder/serviceInquiryHandler';
import { CheckoutHandler } from './logic/botService/handler/botResponder/checkoutHandler';
import { ImageHandler } from './logic/botService/handler/botResponder/imageHandler';
import { RespuestaGenericaHandler } from './logic/botService/handler/botResponder/respuestaGenericaHandler';
import { CompraHandler } from './logic/botService/handler/botResponder/compraHandler';
import logger from '../utils/logger';

export class BotService {
  private botResponder: BotResponder;
  private checkoutProcessor: CheckoutProcessor;

  constructor(
    private readonly responseService: IResponseService,
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly commandHandler: CommandHandler,
    private readonly orderService: OrderService,
    private readonly serviceService: IServiceService
  ) {
    // Log de diagnóstico para verificar que los servicios se inicializan correctamente
    logger.info('🔧 Inicializando BotService...');
    
    const productos = this.productService.getProductos();
    const servicios = this.serviceService.getServices();
    
    logger.info(`📦 Productos disponibles: ${productos.length} categorías`);
    productos.forEach((cat, index) => {
      logger.info(`  Categoría ${index + 1}: ${cat.categoria} - ${cat.productos.length} productos`);
    });
    
    logger.info(`🏛️ Servicios disponibles: ${servicios.length} categorías`);
    servicios.forEach((cat, index) => {
      logger.info(`  Categoría ${index + 1}: ${cat.categoria} - ${cat.productos.length} servicios`);
    });
    
    // Create all the handlers
    const productPurchaseHandler = new ProductPurchaseHandler(cartService, productService, stateManager);
    const serviceInquiryHandler = new ServiceInquiryHandler(serviceService, stateManager);
    const checkoutHandler = new CheckoutHandler(cartService, stateManager, orderService);
    const imageHandler = new ImageHandler(productService, serviceService, stateManager);
    const respuestaGenericaHandler = new RespuestaGenericaHandler(responseService, stateManager);
    const compraHandler = new CompraHandler(productService, cartService, stateManager);

    this.botResponder = new BotResponder(
      stateManager,
      commandHandler,
      productService,
      serviceService,
      responseService,
      cartService,
      productPurchaseHandler,
      serviceInquiryHandler,
      checkoutHandler,
      imageHandler,
      respuestaGenericaHandler,
      compraHandler
    );
    
    this.checkoutProcessor = new CheckoutProcessor(
      cartService,
      stateManager,
      productService,
      orderService
    );
    
    logger.info('✅ BotService inicializado correctamente');
  }

  public async procesarMensaje(message: any): Promise<string | { text: string, media?: any, invoiceMedia?: any, invoiceCaption?: string }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      return await this.botResponder.procesarMensaje(userId, userMessage);
    } catch (error) {
      logger.error('Error al procesar mensaje:', error);
      return 'Lo siento, ha ocurrido un error. Por favor, intenta nuevamente.';
    }
  }

  public async procesarCheckout(userId: string, mensaje: string): Promise<string | { text: string, invoiceMedia?: any, invoiceCaption?: string }> {
    return await this.checkoutProcessor.procesarCheckout(userId, mensaje);
  }

  public esPosibleCategoria(seleccion: string): boolean {
    const categorias = this.productService.getCategorias();
    const indice = parseInt(seleccion) - 1;
    return indice >= 0 && indice < categorias.length;
  }

  public getServiceService(): IServiceService {
    return this.serviceService;
  }
}