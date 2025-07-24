import { ICartService, IProductService, IResponseService } from '../interfaces/services';
import { CommandResult } from './types/commandResult';
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
    private readonly responseService: IResponseService
  ) {}

  public async handleCommand(command: string, userId: string, currentState: any): Promise<CommandResult> {
    const commandLower = command.toLowerCase().trim();

    // Verificar si es un código numérico (1, 1.2, 1.2.3)
    if (/^\d+(\.\d+)*$/.test(commandLower)) {
      return processNumericCode(commandLower, this.productService);
    }
    
    // Si el mensaje comienza con "quiero comprar" seguido de un número
    if (/^(quiero comprar|comprar|pedir|ordenar)\s+\d+(\.\d+)*$/i.test(commandLower)) {
      return processDirectBuyCommand(commandLower, this.productService);
    }
    
    // comando de carrito
    if (commandLower === 'carrito' || commandLower === 'ver carrito') {
      return getCartSummary(this.cartService, userId);
    }
    
    // para finalizar compra
    if (commandLower === 'finalizar compra') {
      return processCheckout(this.cartService, userId);
    }
    
    // para vaciar el carrito
    if (commandLower === 'vaciar carrito' || commandLower === 'cancelar compra') {
      return clearUserCart(this.cartService, userId);
    }
    
    // para ayuda
    if (
      commandLower === 'ayuda' ||
      commandLower === 'help' ||
      commandLower === 'como comprar' ||
      commandLower === 'cómo comprar'
    ) {
      return getHelpMessage(this.responseService);
    }
    
    // para ver productos
    if (
      commandLower === 'ver productos' ||
      commandLower === 'productos' ||
      commandLower === 'catálogo' ||
      commandLower === 'catalogo'
    ) {
      return getProductList(this.productService);
    }
    
    // para ver imágenes
    if (commandLower.includes('ver imágenes') || commandLower.includes('ver imagenes')) {
      return await processImageRequest(commandLower, this.productService);
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