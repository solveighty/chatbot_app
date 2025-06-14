import { CartService } from "../services/cartService";
import { ProductService } from "../services/productService";
import { ResponseService } from "../services/responseService";
import { CommandHandler } from "../handlers/commandHandler";
import { ConversationStateManager } from "../services/conversationStateManager";
import { BotService } from "../services/botService";

export function setupDependencies() {
  // crear instancias de servicios
  // que serán utilizados por el bot
  const responseService = new ResponseService();
  const productService = new ProductService();
  const cartService = new CartService();
  const stateManager = new ConversationStateManager();
  
  // crear instancia del manejador de comandos
  // que utiliza los servicios creados
  const commandHandler = new CommandHandler(productService, cartService, responseService);
  
  // servicio principal del bot
  const botService = new BotService(
    responseService,
    productService,
    cartService,
    stateManager,
    commandHandler
  );
  
  return { botService };
}