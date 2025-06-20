import { Message, MessageMedia } from 'whatsapp-web.js';
import { ICartService, IConversationStateManager, IProductService, IResponseService } from '../interfaces/services';
import { CommandHandler } from '../handlers/commandHandler';
import logger from '../utils/logger';
import { DataValidator } from '../utils/validators';
import { InvoiceGenerator } from '../utils/invoiceGenerator';
import fs from 'fs-extra';

export class BotService {
  constructor(
    private readonly responseService: IResponseService,
    private readonly productService: IProductService,
    private readonly cartService: ICartService,
    private readonly stateManager: IConversationStateManager,
    private readonly commandHandler: CommandHandler
  ) {}

  public async generateResponse(message: Message): Promise<string | { text: string, media?: MessageMedia, invoiceMedia?: MessageMedia }> {
    try {
      const userId = message.from;
      const userMessage = message.body;
      const userMessageLower = userMessage.toLowerCase();
      
      logger.info(`Generando respuesta para: "${userMessage}" de usuario: ${userId}`);
      
      // se verifica el estado actual de la conversación antes de cualquier procesamiento
      const state = this.stateManager.getState(userId);
      
      // procesar respuesta a solicitud de cantidad (mayor prioridad)
      if (state && state.lastCategory === 'solicitar_cantidad') {
        // intentar obtener un número válido
        const cantidad = parseInt(userMessage);
        
        if (isNaN(cantidad) || cantidad <= 0) {
          return `Por favor, indica una cantidad válida usando solo números.\n` +
                 `Ejemplo: *2* para añadir dos unidades.`;
        }
        
        // si tenemos un número válido, añadir al carrito
        const producto = state.productoSeleccionado;
        if (producto) {
          this.cartService.addItemToCart(userId, producto, cantidad);
          
          // actualizar el estado para salir del flujo de solicitud de cantidad
          this.stateManager.updateState(userId, {
            lastCategory: 'producto_agregado',
            lastProductAdded: producto,
            timestamp: new Date()
          });
          
          return `✅ *Producto añadido al carrito:*\n\n` +
                 `📦 ${producto.nombre}\n` +
                 `💰 Precio: $${producto.precio.toFixed(2).replace('.', ',')} x ${cantidad} = $${(producto.precio * cantidad).toFixed(2).replace('.', ',')}\n` +
                 `🏷️ Categoría: ${producto.categoria}\n\n` +
                 `🛒 Escribe *carrito* para ver todos los productos seleccionados.\n` +
                 `➕ Puedes seguir añadiendo más productos escribiendo *quiero comprar [producto]*.\n` +
                 `✅ Cuando termines, escribe *finalizar compra* para proceder al pago.`;
        } else {
          // si por alguna razón no tenemos el producto en el estado
          return `Lo siento, ha ocurrido un error. Por favor, intenta seleccionar el producto nuevamente.`;
        }
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
      
      // verificar si es comando de carrito
      const cartCommandResult = await this.commandHandler.handleCartCommands(userMessage, userId);
      if (cartCommandResult?.response) {
        // si hay actualizaciones de estado, las aplicamos
        if (cartCommandResult.stateUpdates) {
          this.stateManager.updateState(userId, cartCommandResult.stateUpdates);
        }
        return cartCommandResult.response;
      }
      
      // lógica de compra
      if (userMessageLower.includes('quiero comprar') || 
          userMessageLower.includes('comprar') || 
          userMessageLower.includes('pedir')) {
        const resultado = this.productService.procesarPedido(userMessage);
        
        if (resultado.encontrado && resultado.producto) {
          // en vez de añadir directamente, guardar el producto en estado y preguntar cantidad
          this.stateManager.updateState(userId, {
            lastCategory: 'solicitar_cantidad',
            productoSeleccionado: resultado.producto,
            timestamp: new Date()
          });
          
          return `✅ *Producto encontrado:*\n\n` +
                 `📦 ${resultado.producto.nombre}\n` +
                 `💰 Precio: $${resultado.producto.precio.toFixed(2).replace('.', ',')}\n` +
                 `🏷️ Categoría: ${resultado.producto.categoria}\n\n` +
                 `*¿Cuántas unidades deseas añadir al carrito?*\n` +
                 `Responde con un número (ejemplo: 2)`;
        }
        
        return resultado.texto;
      }
      
      // procesar estado de checkout
      if (state && state.lastCategory === 'checkout') {
        return this.procesarCheckout(userId, userMessage);
      }
      
      // procesar estado de selección de categoría de imágenes
      if (state && state.lastCategory === 'menu_categorias') {
        // si el mensaje parece ser un nombre de producto específico
        const categoriaActual = state.categoriaSeleccionada;
        if (categoriaActual) {
          const productoSeleccionado = this.productService.buscarProductoEnCategoria(categoriaActual, userMessage);
          
          if (productoSeleccionado) {
            // el usuario ha seleccionado un producto específico después de ver una categoría
            return {
              text: `¿Deseas comprar ${productoSeleccionado.nombre}?\n\n` +
                    `Para añadir al carrito, escribe: *quiero comprar ${productoSeleccionado.nombre}*`,
              media: await this.productService.obtenerImagenProducto(productoSeleccionado)
            };
          }
        }
        
        // procesar la selección de categoría
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          // guardar la categoría seleccionada en el estado para futuras consultas
          this.stateManager.updateState(userId, { 
            categoriaSeleccionada: userMessage 
          });
          
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // manejo de mensajes por número o categoría sin context previo
      if ((/^\d+$/.test(userMessageLower) || this.esPosibleCategoria(userMessageLower)) && 
          !state?.lastCategory) {
        // asumimos que el usuario intenta seleccionar una categoría sin ver el menú primero
        this.stateManager.updateState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
        const resultado = await this.productService.procesarSeleccionCategoria(userMessage);
        
        if (resultado.imagen) {
          return {
            text: resultado.texto,
            media: resultado.imagen
          };
        }
        return resultado.texto;
      }
      
      // última opción: respuesta genérica según categoría detectada
      const category = this.responseService.determineCategory(userMessage);
      
      // actualizar estado según la categoría detectada
      if (category === 'productos') {
        this.stateManager.updateState(userId, { lastCategory: 'menu_categorias', timestamp: new Date() });
      } else {
        this.stateManager.updateState(userId, { lastCategory: category, timestamp: new Date() });
      }
      
      return this.responseService.getRandomResponse(category);
    } catch (error) {
      logger.error(`Error al generar respuesta: ${error}`);
      return "Lo siento, ocurrió un error al procesar tu mensaje.";
    }
  }
  
  /**
   * Procesa el checkout del pedido
   */
  private async procesarCheckout(userId: string, mensaje: string): Promise<string | { text: string, invoiceMedia?: MessageMedia }> {
    const state = this.stateManager.getState(userId);
    const { etapaPedido } = state;
    const carrito = this.cartService.getCart(userId);
    
    if (etapaPedido === 'datos_cliente') {
      // Validar datos del cliente
      const datosCliente = DataValidator.validarDatosCliente(mensaje);
      
      if (!datosCliente.valido) {
        return `❌ *Los datos proporcionados no son válidos*\n\n` +
               `Por favor, proporciona la siguiente información en formato correcto:\n\n` +
               `1️⃣ *Tu nombre completo* (mínimo 3 caracteres)\n` +
               `2️⃣ *Tu dirección de entrega* (o indica si recogerás en el Monasterio)\n` +
               `3️⃣ *Tu número de teléfono* (formato válido)\n\n` +
               `Ejemplo:\n` +
               `María Pérez\n` +
               `Calle Principal 123, Ciudad\n` +
               `0991234567`;
      }
      
      // Guardar los datos validados del cliente
      this.stateManager.updateState(userId, {
        datosCliente: datosCliente,
        datosClienteTexto: mensaje,
        etapaPedido: 'confirmacion',
      });
      
      // Generar resumen del pedido
      let resumen = `¡Gracias por proporcionar tus datos!\n\n*Resumen de tu pedido:*\n\n`;
      
      carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        const precioFormateado = item.precio.toFixed(2).replace('.', ',');
        const subtotalFormateado = subtotal.toFixed(2).replace('.', ',');
        
        resumen += `${index + 1}. ${item.nombre} (${item.categoria})\n` +
                  `   $${precioFormateado} x ${item.cantidad} = $${subtotalFormateado}\n\n`;
      });
      
      const total = this.cartService.getCartTotal(userId);
      const totalFormateado = total.toFixed(2).replace('.', ',');
      
      resumen += `💰 *Total a pagar: $${totalFormateado}*\n\n`;
      resumen += `👤 *Datos del cliente:*\n`;
      resumen += `📝 Nombre: ${datosCliente.nombre}\n`;
      resumen += `🏠 Dirección: ${datosCliente.direccion}\n`;
      resumen += `📱 Teléfono: ${datosCliente.telefono}\n\n`;
      resumen += `¿Deseas confirmar este pedido? Responde con *SI* para confirmar o *NO* para cancelar.`;
      
      return resumen;
    }
    
    if (etapaPedido === 'confirmacion') {
      if (mensaje.toLowerCase() === 'si' || mensaje.toLowerCase() === 'sí') {
        try {
          // Obtener los datos validados
          const datosCliente = state.datosCliente;
          
          // Generar número de factura
          const invoiceNumber = InvoiceGenerator.generateInvoiceNumber();
          
          // Crear datos para la factura
          const invoiceData = {
            cliente: {
              nombre: datosCliente.nombre,
              direccion: datosCliente.direccion,
              telefono: datosCliente.telefono,
            },
            items: carrito,
            total: this.cartService.getCartTotal(userId),
            fecha: new Date(),
            invoiceNumber: invoiceNumber,
          };
          
          // Generar el PDF de la factura
          const pdfPath = await InvoiceGenerator.generateInvoicePDF(invoiceData);
          
          // Cargar el PDF como MessageMedia
          const pdfBuffer = fs.readFileSync(pdfPath);
          const invoiceMedia = new MessageMedia(
            'application/pdf',
            pdfBuffer.toString('base64'),
            `factura-${invoiceNumber}.pdf`
          );
          
          // Guardar el número de factura y data en el estado para referencia futura
          this.stateManager.updateState(userId, {
            lastCategory: 'pedido_completo',
            etapaPedido: 'completado',
            facturaNumero: invoiceNumber,
            facturaPath: pdfPath
          });
          
          const total = this.cartService.getCartTotal(userId);
          const totalFormateado = total.toFixed(2).replace('.', ',');
          
          // Limpiar el carrito después de la compra
          this.cartService.clearCart(userId);
          
          // Programar limpieza de archivos antiguos
          setTimeout(() => {
            InvoiceGenerator.cleanupOldInvoices(24); // Limpiar archivos de hace más de 24 horas
          }, 60000); // Ejecutar en 1 minuto
          
          return {
            text: `✅ *¡Pedido confirmado!*\n\n` +
                `Tu pedido Nº ${invoiceNumber} por un total de $${totalFormateado} ha sido registrado a nombre de ${datosCliente.nombre}.\n\n` +
                `Una hermana del monasterio se pondrá en contacto contigo al ${datosCliente.telefono} pronto para coordinar el pago y la entrega.\n\n` +
                `A continuación te enviamos tu factura digital en formato PDF.\n\n` +
                `¡Gracias por tu compra! Dios te bendiga.`,
            invoiceMedia: invoiceMedia
          };
        } catch (error) {
          logger.error(`Error al generar factura PDF: ${error}`);
          
          // En caso de error, enviar solo el mensaje sin factura
          return `✅ *¡Pedido confirmado!*\n\n` +
                `Tu pedido ha sido registrado correctamente a nombre de ${state.datosCliente.nombre}.\n\n` +
                `Una hermana del monasterio se pondrá en contacto contigo pronto para coordinar el pago y la entrega.\n\n` +
                `¡Gracias por tu compra! Dios te bendiga.`;
        }
      } else {
        this.cartService.clearCart(userId);
        
        this.stateManager.updateState(userId, {
          lastCategory: 'pedido_cancelado',
        });
        
        return `❌ *Pedido cancelado*\n\n` +
               `Has cancelado tu pedido. Tu carrito ha sido vaciado.\n\n` +
               `Si deseas realizar otra consulta o pedido, estamos a tu disposición.`;
      }
    }
    
    return `Por favor, proporciona la información solicitada para continuar con tu pedido.`;
  }
  
  private esPosibleCategoria(mensaje: string): boolean {
    const categorias = this.productService.getCategorias();
    return categorias.some(categoria => 
      mensaje.toLowerCase().includes(categoria.toLowerCase())
    );
  }
}