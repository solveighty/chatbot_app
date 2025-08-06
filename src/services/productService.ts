import { Categoria, Producto } from './logic/productService/types/product';
import * as fs from 'fs-extra';
import * as path from 'path';
import logger from '../utils/logger';
import { IProductService, IServiceService } from '../interfaces/services';
import { MessageMedia } from 'whatsapp-web.js';
import { generarMenuCategoriasLogic } from './logic/productService/logic/generarMenuCategorias';
import { procesarSeleccionCategoriaLogic } from './logic/productService/logic/procesarSeleccionCategoria';
import { buscarProductoExactoLogic } from './logic/productService/logic/buscarProductoExacto';
import { buscarProductoEnCategoriaLogic } from './logic/productService/logic/buscarProductoEnCategoria';
import { obtenerImagenProductoLogic } from './logic/productService/logic/obtenerImagenProducto';
import { buscarProductoPorCodigoLogic } from './logic/productService/logic/buscarProductoPorCodigo';
import { normalizeString } from '../utils/stringUtils';

export class ProductService implements IProductService {
  private productos: Categoria[] = [];
  private productsFilePath: string;

  constructor() {
    // Detectar si estamos en producción (ejecutando desde dist)
    const isProd = __dirname.includes('dist');
    this.productsFilePath = isProd
      ? path.join(process.cwd(), 'dist/data/products.json')
      : path.join(__dirname, '../../../assets/products.json');
    this.loadProductos();
  }

  private loadProductos(): void {
    try {
      logger.info(`Intentando cargar productos desde: ${this.productsFilePath}`);
      const data = fs.readFileSync(this.productsFilePath, 'utf8');
      this.productos = JSON.parse(data);
      logger.info(`✅ Productos cargados exitosamente. Total de categorías: ${this.productos.length}`);
      
      // Log detallado de productos cargados
      let totalProductos = 0;
      this.productos.forEach((categoria, index) => {
        totalProductos += categoria.productos.length;
        logger.info(`  Categoría ${index + 1}: ${categoria.categoria} - ${categoria.productos.length} productos`);
      });
      logger.info(`📦 Total de productos cargados: ${totalProductos}`);
      
    } catch (error) {
      logger.error('❌ Error al cargar productos:', error);
      logger.error(`Ruta del archivo: ${this.productsFilePath}`);
      this.productos = [];
    }
  }

  public getProductos(): Categoria[] {
    return this.productos;
  }

  public getCategorias(): string[] {
    return this.productos.map(cat => cat.categoria);
  }

  public getProductosPorCategoria(categoria: string): any[] {
    const categoriaEncontrada = this.productos.find(cat => 
      normalizeString(cat.categoria) === normalizeString(categoria)
    );
    return categoriaEncontrada?.productos || [];
  }

  public generarMenuCompletoConServicios(serviceService: IServiceService): string {
    let mensaje = "📦 *Productos y Servicios disponibles:*\n\n";

    // Productos
    this.productos.forEach((categoria) => {
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${categoria.categoria}*\n`;
      categoria.productos.forEach((producto) => {
        mensaje += `- ${producto.nombre}: $${producto.precio?.toFixed(2)}\n`;
        if (producto.variantes && producto.variantes.length > 0) {
          producto.variantes.forEach((variante) => {
            mensaje += `  • ${variante.nombre}: $${variante.precio.toFixed(2)}\n`;
          });
        }
      });
      mensaje += "\n";
    });

    // Servicios
    const servicios = serviceService.getServices();
    servicios.forEach((servicio: any) => {
      const emoji = this.getEmojiForCategory(servicio.categoria);
      mensaje += `${emoji} *${servicio.categoria}*\n`;
      servicio.productos.forEach((producto: any) => {
        mensaje += `- ${producto.nombre}\n`;
        mensaje += `  ${producto.descripcion}\n`;
        mensaje += `  📞 Contacto: ${producto.contacto.telefono}\n`;
      });
      mensaje += "\n";
    });

    mensaje +=
      "\n📷 Para ver imágenes, escribe: *ver imagenes* o *ver imágenes*\n" +
      "Para ver la imagen de un producto o servicio específico, escribe: *ver imagen [nombre]* o *imagen [nombre]*\n";
    mensaje +=
      "\n🛒 ¿Cómo hacer un pedido?\n" +
      "1. Escribe el nombre del producto o servicio.\n" +
      "2. También puedes escribir *quiero comprar* seguido del nombre.\n" +
      "3. Indica la cantidad de unidades que deseas cuando se te pregunte.\n" +
      "4. Puedes agregar varios productos a tu carrito.\n" +
      "5. Escribe *carrito* para ver tus productos seleccionados.\n" +
      "6. Escribe *finalizar compra* cuando estés listo.\n";
    mensaje +=
      "\n🏛️ Para servicios: Escribe el nombre del servicio para obtener información de contacto.\n";
    mensaje += "\nPara más ayuda, escribe: *ayuda*";
    return mensaje;
  }

  public generarMenuCategorias(): string {
    return generarMenuCategoriasLogic(this.productos);
  }

  public procesarSeleccionCategoria(mensaje: string): Promise<{ texto: string; imagen?: any }> {
    return procesarSeleccionCategoriaLogic(this.productos, mensaje);
  }

  public buscarProductos(termino: string): any[] {
    termino = normalizeString(termino); // Normalize search term
    let resultados: any[] = [];

    for (const categoria of this.productos) {
      for (const producto of categoria.productos) {
        if (normalizeString(producto.nombre).includes(termino)) { // Normalize product name for comparison
          resultados.push({
            ...producto,
            categoria: categoria.categoria
          });
        }
        if (producto.variantes) {
          for (const variante of producto.variantes) {
            if (normalizeString(variante.nombre).includes(termino)) { // Normalize variant name for comparison
              resultados.push({
                ...variante,
                categoria: categoria.categoria,
                productoPadre: producto.nombre
              });
            }
          }
        }
      }
    }
    return resultados;
  }

  public buscarProductoExacto(nombreProducto: string): Producto | undefined {
    const resultado = buscarProductoExactoLogic(this.productos, normalizeString(nombreProducto));
    if (resultado && 'id' in resultado && 'imagen' in resultado) {
      return resultado as Producto;
    }
    return undefined;
  }

  public buscarProductoEnCategoria(categoria: string, nombreProducto: string): Producto | undefined {
    const resultado = buscarProductoEnCategoriaLogic(this.productos, normalizeString(categoria), normalizeString(nombreProducto));
    if (resultado && 'id' in resultado && 'imagen' in resultado) {
      return resultado as Producto;
    }
    return undefined;
  }

  public async obtenerImagenProducto(producto: Producto): Promise<MessageMedia | undefined> {
    return obtenerImagenProductoLogic(producto);
  }

  public buscarProductoPorCodigo(codigo: string): Producto | undefined {
    const resultado = buscarProductoPorCodigoLogic(this.productos, codigo);
    if (resultado && 'id' in resultado && 'imagen' in resultado) {
      return resultado as Producto;
    }
    return undefined;
  }

  public getProductById(id: number): Producto | undefined {
    for (const categoria of this.productos) {
      for (const producto of categoria.productos) {
        if (producto.id === id) {
          return producto;
        }
        if (producto.variantes) {
          for (const variante of producto.variantes) {
            // Assuming variants don't have IDs, so we'll skip this check
            // If variants need IDs, they should be added to the Variante interface
          }
        }
      }
    }
    return undefined;
  }

  public procesarPedido(productos: any[]): { productos: any[]; total: number } {
    let total = 0;
    const productosConDetalle = productos.map(item => {
      let precioUnitario = 0;
      let nombreItem = item.nombre;

      // Buscar el producto principal
      const productoPrincipal = this.getProductById(item.id);

      if (productoPrincipal) {
        // Si es una variante, buscar su precio
        if (item.varianteId) {
          const variante = productoPrincipal.variantes?.find(v => v.nombre === item.varianteNombre);
          if (variante) {
            precioUnitario = variante.precio;
            nombreItem = `${productoPrincipal.nombre} - ${variante.nombre}`;
          }
        } else {
          // Si es un producto sin variante o la variante principal
          precioUnitario = productoPrincipal.precio || 0;
        }
      }

      const subtotal = precioUnitario * item.cantidad;
      total += subtotal;
      return { ...item, nombre: nombreItem, precioUnitario, subtotal };
    });

    return { productos: productosConDetalle, total };
  }

  public generarListaProductos(): string {
    let mensaje = "📦 *Lista de Productos:*\n\n";
    this.productos.forEach((categoria, catIndex) => {
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${categoria.categoria}*\n`;
      categoria.productos.forEach(producto => {
        mensaje += `- ${producto.nombre}: $${producto.precio?.toFixed(2)}\n`;
      });
      mensaje += "\n";
    });
    return mensaje;
  }

  public generarListaProductosCategoria(categoria: string): string {
    const productos = this.getProductosPorCategoria(categoria);
    if (productos.length === 0) {
      return `❌ No se encontraron productos en la categoría "${categoria}".`;
    }
    
    let mensaje = `📦 *Productos de ${categoria}:*\n\n`;
    productos.forEach(producto => {
      mensaje += `- ${producto.nombre}: $${producto.precio?.toFixed(2)}\n`;
    });
    return mensaje;
  }

  public generarListaProductosNumerados(): string {
    let mensaje = "📦 *Productos Numerados:*\n\n";
    this.productos.forEach((categoria, catIndex) => {
      const catNumber = catIndex + 1;
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${catNumber}. ${categoria.categoria}*\n`;
      categoria.productos.forEach((producto, prodIndex) => {
        const prodNumber = `${catNumber}.${prodIndex + 1}`;
        mensaje += `- ${prodNumber} ${producto.nombre}: $${producto.precio?.toFixed(2)}\n`;
      });
      mensaje += "\n";
    });
    return mensaje;
  }

  public generarMenuImagenesNumerado(): string {
    let mensaje = "📷 *Menú de Imágenes Numerado:*\n\n";
    this.productos.forEach((categoria, catIndex) => {
      const catNumber = catIndex + 1;
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${catNumber}. ${categoria.categoria}*\n`;
      categoria.productos.forEach((producto, prodIndex) => {
        const prodNumber = `${catNumber}.${prodIndex + 1}`;
        mensaje += `- ${prodNumber} ${producto.nombre}\n`;
      });
      mensaje += "\n";
    });
    return mensaje;
  }

  public async procesarSolicitudImagen(mensaje: string): Promise<{ texto: string; imagen?: any; esCategoria?: boolean }> {
    const userMessageLower = normalizeString(mensaje);
    
    // Check for numeric code
    const numericMatch = userMessageLower.match(/\b(\d+(\.\d+)?)\b/);
    if (numericMatch) {
      const code = numericMatch[1];
      const producto = this.getProductById(parseInt(code));
      if (producto) {
        const media = await this.obtenerImagenProducto(producto);
        if (media) {
          return {
            texto: `📷 Imagen de ${producto.nombre}:`,
            imagen: media
          };
        } else {
          return {
            texto: `❌ No se encontró una imagen para ${producto.nombre}.`
          };
        }
      }
    }
    
    // Check for category
    const categorias = this.getCategorias();
    for (const categoria of categorias) {
      if (userMessageLower.includes(normalizeString(categoria))) {
        const productos = this.getProductosPorCategoria(categoria);
        let mensaje = `📷 *Productos de ${categoria} (${productos.length}):*\n`;
        productos.forEach(producto => {
          mensaje += `- ${producto.id} ${producto.nombre}: $${producto.precio?.toFixed(2)}\n`;
        });
        mensaje += `\n💬 Para ver la imagen de un producto específico, escribe: *ver imagen [código]*`;
        return {
          texto: mensaje,
          esCategoria: true
        };
      }
    }
    
    return {
      texto: `❌ No se encontró el producto o categoría "${mensaje}".`
    };
  }

  private getEmojiForCategory(categoryName: string): string {
    const normalizedCategory = normalizeString(categoryName);
    switch (normalizedCategory) {
      case 'miel de abeja': return '🍯';
      case 'cake': return '🍰';
      case 'alfajores': return '🍬';
      case 'manjar de leche': return '🥛';
      case 'propoleo': return '🌿';
      case 'iconos religiosos': return '📦';
      case 'ceramicas': return '🏺';
      case 'fundas ecologicas': return '♻';
      case 'rosarios': return '📦';
      case 'cactus': return '🌵';
      case 'cd himno monastico': return '💿';
      case 'cirios pascuales': return '🕯';
      case 'cirios liturgicos': return '🕯';
      case 'pulseras - denarios': return '📦';
      case 'hospedaje': return '🛌';
      case 'encuadernacion': return '📚';
      default: return '📦';
    }
  }
}
