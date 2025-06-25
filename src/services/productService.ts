import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import { MessageMedia } from "whatsapp-web.js";
import { IProductService } from "../interfaces/services";

interface Variante {
  nombre: string;
  precio: number;
}

interface Producto {
  nombre: string;
  precio: number;
  imagen?: string;
  variantes?: Variante[];
}

interface Categoria {
  categoria: string;
  productos: Producto[];
}

export class ProductService implements IProductService {
  private productos: Categoria[];

  constructor() {
    try {
      const filePath = path.resolve(process.cwd(), "src/data/products.json");
      const data = fs.readFileSync(filePath, "utf8");
      this.productos = JSON.parse(data);
      logger.info("Productos cargados correctamente");
    } catch (error) {
      logger.error(`Error al cargar los productos: ${error}`);
      this.productos = [];
    }
  }

  /**
   * Obtiene todas las categorías de productos
   */
  public getCategorias(): string[] {
    return this.productos.map((categoria) => categoria.categoria);
  }

  /**
   * Obtiene los productos de una categoría específica
   */
  public getProductosPorCategoria(nombreCategoria: string): Producto[] {
    const categoria = this.productos.find(
      (cat) => cat.categoria.toLowerCase() === nombreCategoria.toLowerCase()
    );
    return categoria?.productos || [];
  }

  /**
   * Genera un texto con todos los productos disponibles mostrando variantes
   */
  public generarListaProductos(): string {
    let mensaje = "📦 *Productos disponibles:*\n\n";

    this.productos.forEach((categoria) => {
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${categoria.categoria}*\n`;

      categoria.productos.forEach((producto) => {
        const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
        
        if (producto.variantes && producto.variantes.length > 0) {
          mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
          
          // se muestra cada variante con su precio
          producto.variantes.forEach(variante => {
            const precioVarianteFormateado = variante.precio.toFixed(2).replace(".", ",");
            mensaje += `  • ${variante.nombre}: $${precioVarianteFormateado}\n`;
          });
          
          // ejemplo de cómo ordenar
          const primerVariante = producto.variantes[0];
          mensaje += `  → Para ordenar: "quiero comprar ${producto.nombre} ${primerVariante.nombre}"\n`;
        } else {
          mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
        }
      });
      mensaje += "\n";
    });

    mensaje += "📷 Para ver imágenes, escribe: *ver imágenes*\n\n";
    mensaje += "🛒 *¿Cómo hacer un pedido?*\n";
    mensaje += "1. Escribe *quiero comprar* seguido del nombre exacto del producto.\n";
    mensaje += "2. Para productos con colores u opciones, especifícalo en tu pedido.\n";
    mensaje += "3. Indica la cantidad de unidades que deseas cuando se te pregunte.\n";
    mensaje += "4. Puedes agregar varios productos a tu carrito.\n";
    mensaje += "5. Escribe *carrito* para ver tus productos seleccionados.\n";
    mensaje += "6. Escribe *finalizar compra* cuando estés listo.\n\n";
    mensaje += "Para más ayuda, escribe: *ayuda*";

    return mensaje;
  }

  /**
   * Genera un menú para seleccionar categoría de imágenes
   */
  public generarMenuCategorias(): string {
    let mensaje = "📷 *¿De qué categoría deseas ver imágenes?*\n\n";

    this.productos.forEach((categoria, index) => {
      mensaje += `${index + 1}. ${categoria.categoria}\n`;
    });

    mensaje += "\nEscribe el número o nombre de la categoría.\n";
    mensaje += "Ejemplo: 2 o Cake";

    return mensaje;
  }

  /**
   * Procesa la selección de categoría para imágenes
   */
  public async procesarSeleccionCategoria(
    seleccion: string
  ): Promise<{ texto: string; imagen?: MessageMedia }> {
    // se verifica si la selección es un número o un nombre
    const seleccionNumero = parseInt(seleccion);
    let categoriaSeleccionada: Categoria | undefined;

    if (
      !isNaN(seleccionNumero) &&
      seleccionNumero > 0 &&
      seleccionNumero <= this.productos.length
    ) {
      // se selecciona por número
      categoriaSeleccionada = this.productos[seleccionNumero - 1];
    } else {
      // se selecciona por nombre
      categoriaSeleccionada = this.productos.find((cat) =>
        cat.categoria.toLowerCase().includes(seleccion.toLowerCase())
      );
    }

    if (!categoriaSeleccionada) {
      return {
        texto: "❌ Categoría no encontrada. Por favor, elige una categoría válida del menú.",
      };
    }

    const productos = categoriaSeleccionada.productos;
    let mensaje = `🛒 *Productos de ${categoriaSeleccionada.categoria}:*\n\n`;

    productos.forEach((producto) => {
      const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
      mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
    });

    mensaje +=
      "\n💬 Para hacer un pedido, escribe: *quiero comprar* seguido del producto.";

    try {
      // se intenta cargar la imagen del primer producto
      if (productos.length > 0 && productos[0].imagen) {
        const imagenPath = productos[0].imagen;
        // se construye la ruta completa del archivo de imagen
        const mediaPath = path.resolve(process.cwd(), "src/data", imagenPath);

        logger.info(`Intentando cargar imagen desde: ${mediaPath}`);

        if (fs.existsSync(mediaPath)) {
          const media = MessageMedia.fromFilePath(mediaPath);
          return { texto: mensaje, imagen: media };
        } else {
          // si el archivo no existe, se registra un error
          logger.error(`Archivo de imagen no encontrado: ${mediaPath}`);
        }
      }
    } catch (error) {
      logger.error(`Error al cargar imagen: ${error}`);
    }

    // si no hay imagen o falla la carga, se devuelve solo el texto
    return { texto: mensaje };
  }

  /**
   * Devuelve un emoji apropiado según la categoría de producto
   */
  private getEmojiForCategory(categoria: string): string {
    const emojis: { [key: string]: string } = {
      "Miel de Abeja": "🍯",
      Cake: "🍰",
      Alfajores: "🍬",
      "Manjar de Leche": "🥛",
      Propóleo: "🌿",
      "Cruces de Tagua": "✝️",
      Cerámicas: "🏺",
      "Fundas Ecológicas": "♻️",
      Cactus: "🌵",
      "CD Himno Monástico": "💿",
      "Medallas de San Benito": "🏅",
      "Cirios por la Paz": "🕯️",
      "Cirios Pascuales": "🕯️",
      "Cirios Litúrgicos": "🕯️",
      "Llaveros y Esferos (Bambú)": "🔑",
      "Pulseras (macramé)": "⚜️",
    };

    return emojis[categoria] || "📦";
  }

  /**
   * Procesa un pedido de compra
   */
  public procesarPedido(pedido: string): {
    texto: string;
    encontrado: boolean;
    producto?: { nombre: string; precio: number; categoria: string };
  } {
    // normalizar el texto del pedido
    const textoPedido = pedido
      .toLowerCase()
      .replace(
        /quiero comprar|comprar|me gustaría|quisiera|necesito|quiero|pedir/gi,
        ""
      )
      .trim();

    // si el texto es muy corto, solicitar más información
    if (textoPedido.length < 3) {
      return {
        texto:
          "Por favor, especifica qué producto deseas comprar.\n\n" +
          "Escribe *ver productos* para ver el catálogo completo, y luego\n" +
          "escribe *quiero comprar* seguido del nombre exacto del producto.\n\n" +
          'Ejemplo: "quiero comprar Frasco de 500 ml"',
        encontrado: false,
      };
    }

    // intentar encontrar el producto, ahora con mejor soporte para variantes
    const productoEncontrado = this.buscarProductoExacto(textoPedido);
    
    if (productoEncontrado) {
      const precioFormateado = productoEncontrado.precio.toFixed(2).replace(".", ",");
      
      return {
        texto:
          `✅ *Producto encontrado:*\n\n` +
          `📦 ${productoEncontrado.nombre}\n` +
          `💰 Precio: $${precioFormateado}\n` +
          `🏷️ Categoría: ${productoEncontrado.categoria}\n\n` +
          `Para confirmar tu pedido, por favor envía los siguientes datos:\n\n` +
          `1️⃣ Tu nombre completo\n` +
          `2️⃣ Tu dirección de entrega (o indica si recogerás en el Monasterio)\n` +
          `3️⃣ Tu número de teléfono\n` +
          `4️⃣ Cantidad de unidades\n\n` +
          `Nota: La información se usará únicamente para procesar tu pedido.`,
        encontrado: true,
        producto: productoEncontrado,
      };
    }

    // buscar categoría para dar sugerencias específicas si no encontramos el producto
    for (const categoria of this.productos) {
      if (textoPedido.includes(categoria.categoria.toLowerCase())) {
        let mensaje = `No has especificado qué producto de *${categoria.categoria}* deseas comprar.\n\n`;
        mensaje += "Algunos productos de esta categoría:\n\n";
        
        categoria.productos.forEach(producto => {
          const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
          
          if (producto.variantes && producto.variantes.length > 0) {
            mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
            mensaje += `  Opciones disponibles:\n`;
            
            producto.variantes.forEach(variante => {
              mensaje += `  • ${variante.nombre}\n`;
            });
            
            // ejemplo específico para este producto
            mensaje += `\n  Ejemplo: "Quiero comprar ${producto.nombre} ${producto.variantes[0].nombre}"\n\n`;
          } else {
            mensaje += `- ${producto.nombre}: $${precioFormateado}\n\n`;
          }
        });
        
        return {
          texto: mensaje,
          encontrado: false
        };
      }
    }

    // producto no encontrado
    return {
      texto:
        `Lo siento, no encontré ese producto en nuestro catálogo.\n\n` +
        `👉 Asegúrate de escribir el nombre exacto como aparece en el catálogo.\n\n` +
        `Escribe *ver productos* para consultar los productos disponibles.\n` +
        `Para productos con colores u opciones, especifícalos claramente.\n` +
        `Ejemplo: "quiero comprar De 12 cm Color blanco"\n\n` +
        `Para obtener ayuda, escribe: *ayuda*`,
      encontrado: false,
    };
  }

  /**
   * Busca productos que coincidan con un término de búsqueda
   */
  public buscarProductos(termino: string): string {
    termino = termino.toLowerCase();
    let resultados = [];

    for (const categoria of this.productos) {
      for (const producto of categoria.productos) {
        // si el nombre del producto incluye el término de búsqueda
        if (producto.nombre?.toLowerCase().includes(termino)) {
          const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
          resultados.push({
            nombre: producto.nombre,
            precio: producto.precio,
            precioFormateado: precioFormateado,
            categoria: categoria.categoria,
          });
        }
      }
    }

    if (resultados.length === 0) {
      return (
        `No encontré productos que coincidan con "${termino}". ` +
        `Escribe *ver productos* para ver todo nuestro catálogo.`
      );
    }

    let mensaje = `🔍 *Resultados de búsqueda para "${termino}":*\n\n`;

    resultados.forEach((resultado) => {
      mensaje +=
        `📦 ${resultado.nombre}\n` +
        `💰 Precio: $${resultado.precioFormateado}\n` +
        `🏷️ Categoría: ${resultado.categoria}\n\n`;
    });

    mensaje += `Para comprar, escribe: *quiero comprar* seguido del nombre del producto.`;

    return mensaje;
  }

  /**
   * Busca un producto exacto por su nombre, incluyendo variantes
   */
  public buscarProductoExacto(nombreProducto: string): {
    nombre: string;
    precio: number;
    categoria: string;
  } | null {
    nombreProducto = nombreProducto.toLowerCase().trim();

    // buscar coincidencias de variantes primero
    for (const categoria of this.productos) {
      for (const producto of categoria.productos) {
        // si el producto tiene variantes
        if (producto.variantes && producto.variantes.length > 0) {
          for (const variante of producto.variantes) {
            const nombreVariante = variante.nombre.toLowerCase();
            const nombreProductoBase = producto.nombre.toLowerCase();
            
            // detectar patrones como "12 cm color blanco" o "12 cm - blanco"
            // extraer información de tamaño y color
            let esTamanoCorrecto = false;
            let esColorCorrecto = false;
            
            // verificar si menciona el tamaño del producto
            if (nombreProductoBase.includes("cm")) {
              const tamanoMatch = nombreProductoBase.match(/(\d+)\s*cm/);
              if (tamanoMatch && nombreProducto.includes(tamanoMatch[1])) {
                esTamanoCorrecto = true;
              }
            } else {
              // si no es un producto con tamaño en cm, usar otra lógica
              esTamanoCorrecto = nombreProducto.includes(nombreProductoBase.split("-")[0].trim());
            }

            // verificar si menciona el color específico
            if (nombreVariante.includes("color")) {
              const colorMatch = nombreVariante.match(/color\s+(\w+)/i);
              if (colorMatch && nombreProducto.includes(colorMatch[1].toLowerCase())) {
                esColorCorrecto = true;
              }
            }
            
            // si coincide tanto en tamaño como en color, o hay una coincidencia exacta
            if ((esTamanoCorrecto && esColorCorrecto) || 
                nombreProducto.includes(nombreVariante) ||
                (nombreProducto.includes(nombreProductoBase) && nombreProducto.includes(nombreVariante))) {
              
              return {
                nombre: `${producto.nombre} - ${variante.nombre}`,
                precio: variante.precio,
                categoria: categoria.categoria
              };
            }
          }
        }
      }
    }

    // si no encontró variante, intentar el método normal

    // busqueda por coincidencias parciales
    let mejorCoincidencia = null;
    let mejorPuntuacion = 0;

    for (const categoria of this.productos) {
      for (const producto of categoria.productos) {
        const nombreActual = producto.nombre?.toLowerCase() || "";

        // calcular puntuación de coincidencia
        let puntuacion = 0;

        // coincidencia exacta (prioridad máxima)
        if (nombreActual === nombreProducto) {
          puntuacion = 100;
        }
        // nombre del producto está completamente dentro del texto del pedido
        else if (nombreProducto.includes(nombreActual)) {
          puntuacion = 75 + (nombreActual.length / nombreProducto.length) * 20;
        }
        // texto del pedido está completamente dentro del nombre del producto
        else if (nombreActual.includes(nombreProducto)) {
          puntuacion = 50 + (nombreProducto.length / nombreActual.length) * 20;
        }

        // bonus si la categoría también está mencionada en el pedido
        if (puntuacion > 0 && nombreProducto.includes(categoria.categoria.toLowerCase())) {
          puntuacion += 25;
        }

        // actualizar la mejor coincidencia si encontramos una mejor
        if (puntuacion > mejorPuntuacion) {
          mejorPuntuacion = puntuacion;
          mejorCoincidencia = {
            nombre: producto.nombre,
            precio: producto.precio,
            categoria: categoria.categoria
          };
        }
      }
    }

    // solo devolver coincidencias que superen cierto umbral
    return mejorPuntuacion > 40 ? mejorCoincidencia : null;
  }

  /**
   * Busca un producto específico dentro de una categoría
   */
  public buscarProductoEnCategoria(nombreCategoria: string, nombreProducto: string): Producto | null {
    const categoriaIndex = this.obtenerIndiceCategoria(nombreCategoria);
    if (categoriaIndex === -1) return null;

    const categoria = this.productos[categoriaIndex];
    return categoria.productos.find((p) =>
      p.nombre.toLowerCase().includes(nombreProducto.toLowerCase())
    ) || null;
  }

  /**
   * Obtiene el índice de una categoría por nombre o número
   */
  public obtenerIndiceCategoria(seleccion: string): number {
    // verificar si es un número
    const seleccionNumero = parseInt(seleccion);

    if (!isNaN(seleccionNumero) && seleccionNumero > 0 && seleccionNumero <= this.productos.length) {
      return seleccionNumero - 1;
    }

    // buscar por nombre
    return this.productos.findIndex(cat =>
      cat.categoria.toLowerCase().includes(seleccion.toLowerCase())
    );
  }

  /**
   * Obtiene la imagen de un producto
   */
  public async obtenerImagenProducto(producto: Producto): Promise<MessageMedia | undefined> {
    try {
      if (producto && producto.imagen) {
        const mediaPath = path.resolve(process.cwd(), 'src/data', producto.imagen);

        if (fs.existsSync(mediaPath)) {
          return MessageMedia.fromFilePath(mediaPath);
        }
      }
      return undefined;
    } catch (error) {
      logger.error(`Error al obtener imagen del producto: ${error}`);
      return undefined;
    }
  }

  /**
   * Genera un texto con todos los productos disponibles, numerados por categoría y subcategoría
   */
  public generarListaProductosNumerados(): string {
    let mensaje = "📦 *Productos disponibles:*\n\n";
    
    this.productos.forEach((categoria, catIndex) => {
      const catNumber = catIndex + 1;
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${catNumber}. ${categoria.categoria}*\n`;

      categoria.productos.forEach((producto, prodIndex) => {
        const prodNumber = `${catNumber}.${prodIndex + 1}`;
        const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
        
        if (producto.variantes && producto.variantes.length > 0) {
          mensaje += `- ${prodNumber} ${producto.nombre}: $${precioFormateado}\n`;
          
          // se muestra cada variante con su precio
          producto.variantes.forEach((variante, varIndex) => {
            const varNumber = `${prodNumber}.${varIndex + 1}`;
            const precioVarianteFormateado = variante.precio.toFixed(2).replace(".", ",");
            mensaje += `  • ${varNumber} ${variante.nombre}: $${precioVarianteFormateado}\n`;
          });
          
          // ejemplo de cómo ordenar con números
          mensaje += `  → Para ordenar, escribe: *${catNumber}* o *${prodNumber}* o *${prodNumber}.1*\n`;
        } else {
          mensaje += `- ${prodNumber} ${producto.nombre}: $${precioFormateado}\n`;
        }
      });
      mensaje += "\n";
    });

    mensaje += "📷 Para ver imágenes, escribe: *ver imágenes*\n\n";
    mensaje += "🛒 *¿Cómo hacer un pedido?*\n";
    mensaje += "1. Escribe el número de la categoría, producto o variante.\n";
    mensaje += "   Ejemplos: *1* (categoría), *1.2* (producto), *1.2.3* (variante)\n";
    mensaje += "2. También puedes escribir *quiero comprar* seguido del número.\n";
    mensaje += "3. Indica la cantidad de unidades que deseas cuando se te pregunte.\n";
    mensaje += "4. Puedes agregar varios productos a tu carrito.\n";
    mensaje += "5. Escribe *carrito* para ver tus productos seleccionados.\n";
    mensaje += "6. Escribe *finalizar compra* cuando estés listo.\n\n";
    mensaje += "Para más ayuda, escribe: *ayuda*";

    return mensaje;
  }

  /**
   * Busca producto por su código numérico (formato: categoria.producto.variante)
   */
  public buscarProductoPorCodigo(codigo: string): {
    nombre: string;
    precio: number;
    categoria: string;
  } | null {
    // Dividir el código en partes (categoría, producto, variante)
    const partes = codigo.split('.').map(num => parseInt(num) - 1);
    
    // Si no hay partes o la primera parte no es un número válido, retornar null
    if (partes.length === 0 || isNaN(partes[0]) || partes[0] < 0 || partes[0] >= this.productos.length) {
      return null;
    }

    const categoria = this.productos[partes[0]];
    
    // Si solo tenemos la categoría, no podemos devolver un producto específico
    if (partes.length === 1) {
      return null;
    }
    
    // Verificar si el índice del producto es válido
    if (isNaN(partes[1]) || partes[1] < 0 || partes[1] >= categoria.productos.length) {
      return null;
    }
    
    const producto = categoria.productos[partes[1]];
    
    // Si hay una tercera parte, es una variante
    if (partes.length > 2 && producto.variantes) {
      // Verificar si el índice de la variante es válido
      if (isNaN(partes[2]) || partes[2] < 0 || partes[2] >= producto.variantes.length) {
        return null;
      }
      
      const variante = producto.variantes[partes[2]];
      
      return {
        nombre: `${producto.nombre} - ${variante.nombre}`,
        precio: variante.precio,
        categoria: categoria.categoria
      };
    }
    
    // Si solo tenemos categoría y producto, o el producto no tiene variantes
    return {
      nombre: producto.nombre,
      precio: producto.precio,
      categoria: categoria.categoria
    };
  }

  /**
   * Genera una lista de productos de una categoría específica con numeración
   */
  public generarListaProductosCategoria(nombreCategoria: string): string {
    const categoriaIndex = this.productos.findIndex(cat => 
      cat.categoria.toLowerCase() === nombreCategoria.toLowerCase()
    );
    
    if (categoriaIndex === -1) {
      return `No encontré la categoría "${nombreCategoria}". Escribe *ver productos* para ver todas las categorías.`;
    }
    
    const categoria = this.productos[categoriaIndex];
    const catNumber = categoriaIndex + 1;
    const emoji = this.getEmojiForCategory(categoria.categoria);
    
    let mensaje = `${emoji} *Productos de ${categoria.categoria} (${catNumber}):*\n\n`;
    
    categoria.productos.forEach((producto, prodIndex) => {
      const prodNumber = `${catNumber}.${prodIndex + 1}`;
      const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
      
      if (producto.variantes && producto.variantes.length > 0) {
        mensaje += `- ${prodNumber} ${producto.nombre}: $${precioFormateado}\n`;
        
        // Mostrar variantes
        producto.variantes.forEach((variante, varIndex) => {
          const varNumber = `${prodNumber}.${varIndex + 1}`;
          const precioVarianteFormateado = variante.precio.toFixed(2).replace(".", ",");
          mensaje += `  • ${varNumber} ${variante.nombre}: $${precioVarianteFormateado}\n`;
        });
      } else {
        mensaje += `- ${prodNumber} ${producto.nombre}: $${precioFormateado}\n`;
      }
    });
    
    mensaje += "\n💬 Para seleccionar un producto, escribe su código numérico (ejemplo: *1.2*)";
    mensaje += "\n💬 También puedes escribir: *quiero comprar 1.2*";
    mensaje += "\n🔙 Para ver todas las categorías escribe: *ver productos*";
    
    return mensaje;
  }
}
