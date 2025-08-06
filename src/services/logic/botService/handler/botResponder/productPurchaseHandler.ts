import { IConversationStateManager } from '../../../../../interfaces/services';
import { ICartService } from '../../../../../interfaces/services';
import { IProductService } from '../../../../../interfaces/services';

export class ProductPurchaseHandler {
  constructor(
    private readonly cartService: ICartService,
    private readonly productService: IProductService,
    private readonly stateManager: IConversationStateManager
  ) {}

  public async handleProductPurchase(userId: string, userMessage: string, state: any): Promise<string | null> {
    const userMessageLower = userMessage.toLowerCase();

    // Si el usuario está en estado de solicitud de cantidad para compra
    if (state && state.lastCategory === 'solicitar_cantidad_compra') {
      return this.handleCantidadInput(userId, userMessage, state);
    }

    // Procesar ID de producto
    const productId = parseInt(userMessage);
    if (!isNaN(productId) && productId >= 1 && productId <= 24) {
      const product = this.productService.getProductById(productId);
      if (product) {
        // Iniciar proceso solicitando cantidad
        this.stateManager.updateState(userId, {
          lastCategory: 'solicitar_cantidad_compra',
          productId: productId,
          productName: product.nombre,
          productPrice: product.precio,
          timestamp: new Date()
        });

        return `🛒 *${product.nombre}*\n\n` +
               `💰 Precio: $${product.precio.toFixed(2).replace('.', ',')}\n` +
               `📦 Categoría: ${product.categoria}\n\n` +
               `📝 *¿Cuántas unidades quieres agregar al carrito?*\n\n` +
               `❌ O escribe *cancelar* para salir sin agregar.`;
      }
    }

    return null;
  }

  private handleCantidadInput(userId: string, userMessage: string, state: any): string {
    const userMessageLower = userMessage.toLowerCase();
    
    // Verificar si el usuario quiere cancelar
    if (userMessageLower === 'cancelar' || userMessageLower === 'cancel' || userMessageLower === 'no' || userMessageLower === 'salir') {
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      return `❌ *Operación cancelada*\n\n` +
             `No se agregó ningún producto al carrito.\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito actual.\n` +
             `📋 Escribe *productos* para ver el catálogo completo.\n` +
             `➕ Puedes seguir comprando escribiendo *quiero comprar [producto]*.`;
    }

    const cantidad = parseInt(userMessage);
    
    // Validar que sea un número válido
    if (isNaN(cantidad) || cantidad <= 0 || cantidad > 100) {
      return `❌ Por favor, escribe un número válido de unidades (1-100).\n\n` +
             `❌ O escribe *cancelar* para salir sin agregar.`;
    }

    try {
      // Agregar producto al carrito
      this.cartService.addItemToCart(userId, {
        nombre: state.productName,
        precio: state.productPrice,
        categoria: 'Producto',
        cantidad: cantidad
      }, cantidad);

      // Actualizar estado a menu principal
      this.stateManager.updateState(userId, {
        lastCategory: 'menu_principal',
        timestamp: new Date()
      });

      const total = (state.productPrice * cantidad).toFixed(2).replace('.', ',');

      return `✅ *Producto agregado al carrito*\n\n` +
             `🛒 *Producto:* ${state.productName}\n` +
             `💰 *Precio unitario:* $${state.productPrice.toFixed(2).replace('.', ',')}\n` +
             `📦 *Cantidad:* ${cantidad} unidad${cantidad > 1 ? 'es' : ''}\n` +
             `💵 *Subtotal:* $${total}\n\n` +
             `🛒 Escribe *carrito* para ver tu carrito.\n` +
             `💳 Escribe *finalizar* para completar tu pedido.\n` +
             `📋 Escribe *productos* para seguir comprando.`;
    } catch (error) {
      console.error('Error al agregar producto al carrito:', error);
      return '❌ Error al agregar el producto al carrito. Por favor, intenta nuevamente.';
    }
  }
} 