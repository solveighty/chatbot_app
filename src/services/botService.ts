import { Message, MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService, IResponseService } from '../interfaces/services';
import { CommandHandler } from '../handlers/commandHandler';
import { OrderService } from './orderService';
import { BotResponder } from './logic/botService/botResponder';
import { CheckoutProcessor } from './logic/botService/checkoutProcessor';
import { CategoryHelper } from './logic/botService/categoryHelper';

export class BotService {
  private botResponder: BotResponder;
  private checkoutProcessor: CheckoutProcessor;
  private categoryHelper: CategoryHelper;

  constructor(
    private readonly responseService: IResponseService,
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly commandHandler: CommandHandler,
    private readonly orderService: OrderService
  ) {
    this.checkoutProcessor = new CheckoutProcessor(
      cartService,
      stateManager,
      productService,
      orderService
    );
    this.categoryHelper = new CategoryHelper(productService);
    this.botResponder = new BotResponder(
      responseService,
      productService,
      cartService,
      stateManager,
      commandHandler,
      orderService,
      this
    );
  }

  /**
   * Genera una respuesta para el mensaje recibido
   * @param message Mensaje recibido
   * @returns Respuesta generada
   */

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia, invoiceCaption?: string }> {
    return this.botResponder.generateResponse(message);
  }
  
  /**
   * Procesa el checkout del pedido
   */
  public async procesarCheckout(userId: string, mensaje: string): Promise<string | { text: string, invoiceMedia?: MessageMedia, invoiceCaption?: string }> {
    return this.checkoutProcessor.procesarCheckout(userId, mensaje);
  }

  /**
   * Verifica si el mensaje contiene una categoría válida
   */
  public esPosibleCategoria(mensaje: string): boolean {
    return this.categoryHelper.esPosibleCategoria(mensaje);
  }
}