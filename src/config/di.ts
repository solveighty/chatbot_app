import { CartService } from "../services/cartService";
import { ProductService } from "../services/productService";
import { ResponseService } from "../services/responseService";
import { CommandHandler } from "../handlers/commandHandler";
import { ConversationStateManager } from "../services/conversationStateManager";
import { BotService } from "../services/botService";
import { OrderService } from "../services/orderService";

export function setupDependencies() {
  // Crear instancias de servicios
  const responseService = new ResponseService();
  const productService = new ProductService();
  const cartService = new CartService();
  const stateManager = new ConversationStateManager();
  const orderService = new OrderService();
  
  // Crear instancia del manejador de comandos
  const commandHandler = new CommandHandler(productService, cartService, responseService);
  
  // Servicio principal del bot
  const botService = new BotService(
    responseService,
    productService,
    cartService,
    stateManager,
    commandHandler,
    orderService
  );
  
  return { botService, orderService };
}