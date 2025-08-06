import { ProductService } from '../services/productService';
import { CartService } from '../services/cartService';
import { ConversationStateManager } from '../services/conversationStateManager';
import { ResponseService } from '../services/responseService';
import { OrderService } from '../services/orderService';
import { ServiceService } from '../services/serviceService';
import { BotService } from '../services/botService';
import { CommandHandler } from '../handlers/commandHandler';

export function setupDependencies() {
  // Crear instancias de servicios
  const productService = new ProductService();
  const cartService = new CartService();
  const stateManager = new ConversationStateManager();
  const responseService = new ResponseService();
  const serviceService = new ServiceService();
  const orderService = new OrderService(serviceService);

  // Crear instancia del command handler
  const commandHandler = new CommandHandler(
    productService,
    cartService,
    responseService,
    serviceService
  );

  // Crear instancia del bot service
  const botService = new BotService(
    responseService,
    productService,
    cartService,
    stateManager,
    commandHandler,
    orderService,
    serviceService
  );

  return {
    productService,
    cartService,
    stateManager,
    responseService,
    orderService,
    serviceService,
    commandHandler,
    botService
  };
}