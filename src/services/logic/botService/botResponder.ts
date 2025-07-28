import { Message, MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService, IResponseService } from '../../../interfaces/services';
import { CommandHandler } from '../../../handlers/commandHandler';
import logger from '../../../utils/logger';
import { BotService } from '../../botService';
import { OrderService } from '../../orderService';
import { CantidadHandler } from './handler/botResponder/cantidadHandler';
import { CarritoHandler } from './handler/botResponder/carritoHandler';
import { CategoriaHandler } from './handler/botResponder/categoriaHandler';
import { CompraHandler } from './handler/botResponder/compraHandler';
import { SeleccionCategoriaHandler } from './handler/botResponder/seleccionCategoriaHandler';
import { SeleccionProductoHandler } from './handler/botResponder/seleccionProductoHandler';
import { SolicitudImagenHandler } from './handler/botResponder/solicitudImagenHandler';
import { RespuestaGenericaHandler } from './handler/botResponder/respuestaGenericaHandler';

export class BotResponder {
  private cantidadHandler: CantidadHandler;
  private carritoHandler: CarritoHandler;
  private categoriaHandler: CategoriaHandler;
  private compraHandler: CompraHandler;
  private seleccionCategoriaHandler: SeleccionCategoriaHandler;
  private seleccionProductoHandler: SeleccionProductoHandler;
  private solicitudImagenHandler: SolicitudImagenHandler;
  private respuestaGenericaHandler: RespuestaGenericaHandler;

  constructor(
    private readonly responseService: IResponseService,
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly commandHandler: CommandHandler,
    private readonly orderService: OrderService,
    private readonly botService: BotService // para acceder a métodos auxiliares como procesarCheckout y esPosibleCategoria
  ) {
    this.cantidadHandler = new CantidadHandler(this.cartService, this.stateManager);
    this.carritoHandler = new CarritoHandler(this.cartService, this.stateManager);
    this.categoriaHandler = new CategoriaHandler(this.productService, this.stateManager);
    this.compraHandler = new CompraHandler(this.productService, this.stateManager);
    this.seleccionCategoriaHandler = new SeleccionCategoriaHandler(this.productService, this.stateManager);
    this.seleccionProductoHandler = new SeleccionProductoHandler(this.productService, this.stateManager);
    this.solicitudImagenHandler = new SolicitudImagenHandler(this.productService, this.stateManager);
    this.respuestaGenericaHandler = new RespuestaGenericaHandler(this.responseService, this.stateManager);
  }

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia, invoiceCaption?: string }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      const userMessageLower = userMessage.toLowerCase();
      
      logger.info(`Generando respuesta para: "${userMessage}" de usuario: ${userId}`);
      
      // se verifica el estado actual de la conversación antes de cualquier procesamiento
      const state = this.stateManager.getState(userId);
      
      // procesar respuesta a solicitud de cantidad (mayor prioridad)
      if (state && state.lastCategory === 'solicitar_cantidad') {
        return this.cantidadHandler.manejarSolicitudCantidad(userId, userMessage, state);
      }
      
      // manejar comandos de carrito
      const carritoResponse = this.carritoHandler.manejarComandoCarrito(userId, userMessage, state);
      if (carritoResponse) {
        return carritoResponse;
      }
      
      // a partir de aquí continúa con el flujo normal
      // verificar si es un comando...
      const commandResult = await this.commandHandler.handleCommand(
        userMessage, 
        userId, 
        state
      );
      
      if (commandResult.response) {
        // si hay actualizaciones de estado, las aplicamos
        if (commandResult.stateUpdates) {
          this.stateManager.updateState(userId, commandResult.stateUpdates);
        }
        return commandResult.response;
      }
      
      // lógica de compra
      if (
        userMessageLower.includes('quiero comprar') ||
        userMessageLower.includes('comprar') ||
        userMessageLower.includes('pedir')
      ) {
        return this.compraHandler.manejarCompra(userId, userMessage);
      }
      
      // procesar estado de checkout
      if (state && state.lastCategory === 'checkout') {
        return this.botService.procesarCheckout(userId, userMessage);
      }
      
      // procesar estado de selección de categoría de imágenes
      if (state && state.lastCategory === 'menu_categorias') {
        return this.categoriaHandler.manejarSeleccionCategoria(userId, userMessage, state);
      }
      
      // manejo de mensajes por número o categoría sin contexto previo
      if ((/^\d+$/.test(userMessageLower) || this.botService.esPosibleCategoria(userMessageLower)) && 
          !state?.lastCategory) {
        return await this.seleccionCategoriaHandler.manejarSeleccionSinContexto(userId, userMessage);
      }
      
      // Procesar entrada numérica como selección de producto cuando estamos en una categoría
      if (/^\d+(\.\d+)*$/.test(userMessageLower) && state?.lastCategory === 'menu_categoria') {
        const productoResponse = this.seleccionProductoHandler.manejarSeleccionPorCodigo(userId, userMessage, state);
        if (productoResponse) {
          return productoResponse;
        }
      }
      
      // Manejar entradas numéricas como códigos para ver imágenes cuando estamos en un menú de imágenes
      if (
        /^\d+(\.\d+)*$/.test(userMessageLower) &&
        (state?.lastCategory === 'menu_imagenes' || state?.lastCategory === 'menu_imagenes_categoria')
      ) {
        return await this.solicitudImagenHandler.manejarSolicitudImagen(userId, userMessageLower, state);
      }
      
      // última opción: respuesta genérica según categoría detectada
      return this.respuestaGenericaHandler.manejarRespuestaGenerica(userId, userMessage);
    } catch (error) {
      logger.error(`Error al generar respuesta: ${error}`);
      return "Lo siento, ocurrió un error al procesar tu mensaje.";
    }
  }
}