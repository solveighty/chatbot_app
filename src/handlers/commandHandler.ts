import { ICartService, IProductService, IResponseService, IServiceService } from '../interfaces/services';
import { CommandResult } from './commandHandler/types/commandResult';
import { processNumericCode } from './commandHandler/logic/processNumericCode';
import { processDirectBuyCommand } from './commandHandler/logic/processDirectBuyCommand';
import { getCartSummary } from './commandHandler/logic/getCartSummary';
import { processCheckout } from './commandHandler/logic/processCheckout';
import { clearUserCart } from './commandHandler/logic/clearUserCart';
import { getHelpMessage } from './commandHandler/logic/getHelpMessage';
import { getProductList } from './commandHandler/logic/getProductList';
import { processImageRequest } from './commandHandler/logic/processImageRequest';
import { addToCart } from './commandHandler/logic/addToCart';
import { removeFromCart } from './commandHandler/logic/removeFromCart';

export class CommandHandler {
  constructor(
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly responseService: IResponseService,
    private readonly serviceService: IServiceService
  ) {}

  public async handleCommand(message: string, userId: string, state: any): Promise<CommandResult> {
    const messageLower = message.toLowerCase();

    // Comando "productos" - ahora incluye servicios
    if (messageLower === 'productos' || messageLower === 'ver productos') {
      return {
        response: this.productService.generarMenuCompletoConServicios(this.serviceService),
        stateUpdates: {
          lastCategory: 'menu_principal',
          timestamp: new Date()
        }
      };
    }
    
    // Verificar si es un código numérico (1, 1.2, 1.2.3)
    if (/^\d+(\.\d+)*$/.test(messageLower)) {
      return processNumericCode(messageLower, this.productService, this.serviceService);
    }
    
    // Si el mensaje comienza con "quiero comprar" seguido de un número
    if (/^(quiero comprar|comprar|pedir|ordenar)\s+\d+(\.\d+)*$/i.test(messageLower)) {
      return processDirectBuyCommand(messageLower, this.productService);
    }
    
    // comando de carrito
    if (messageLower === 'carrito' || messageLower === 'ver carrito') {
      return getCartSummary(this.cartService, userId);
    }
    
    // para finalizar
if (messageLower === 'finalizar') {
      return processCheckout(this.cartService, userId);
    }
    
    // para vaciar el carrito
    if (messageLower === 'vaciar carrito' || messageLower === 'cancelar compra') {
      return clearUserCart(this.cartService, userId);
    }
    
    // para ayuda
    if (
      messageLower === 'ayuda' ||
      messageLower === 'help' ||
      messageLower === 'como comprar' ||
      messageLower === 'cómo comprar'
    ) {
      return getHelpMessage(this.responseService);
    }
    
    // para ver servicios
    if (
      messageLower === 'servicios' ||
      messageLower === 'ver servicios' ||
      messageLower === 'hospedaje' ||
      messageLower === 'alojamiento'
    ) {
      return {
        response: this.serviceService.generateServicesMenu()
      };
    }
    
    // para contactar con hermanas
    if (this.serviceService.isContactCommand(messageLower)) {
      return {
        response: this.serviceService.getContactHours()
      };
    }
    
    // para ver imágenes
    if (messageLower.includes('ver imágenes') || messageLower.includes('ver imagenes')) {
      return await processImageRequest(messageLower, this.productService);
    }

    // si no reconoce el comando
    return {
      response: ""
    };
  }

  public async handleCartCommands(message: string, userId: string): Promise<CommandResult | null> {
    const messageLower = message.toLowerCase();

    // Para añadir al carrito
    if (messageLower.startsWith('añadir') || messageLower.startsWith('anadir') || messageLower.startsWith('agregar')) {
      return addToCart(message, userId, this.productService, this.cartService);
    }

    // para quitar del carrito
    if (messageLower.startsWith('quitar') || messageLower.startsWith('eliminar') || messageLower.startsWith('borrar')) {
      return removeFromCart(message, userId, this.cartService);
    }

    return null;
  }
}