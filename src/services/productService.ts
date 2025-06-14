import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import { MessageMedia } from "whatsapp-web.js";

interface Producto {
  nombre: string;
  precio: number;
  imagen: string;
}

interface Categoria {
  categoria: string;
  productos: Producto[];
}

export class ProductService {
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
   * Genera un texto con todos los productos disponibles
   */
  public generarListaProductos(): string {
    let mensaje = "📦 *Productos disponibles:*\n\n";

    this.productos.forEach((categoria) => {
      const emoji = this.getEmojiForCategory(categoria.categoria);
      mensaje += `${emoji} *${categoria.categoria}*\n`;

      categoria.productos.forEach((producto) => {
        const precioFormateado = producto.precio.toFixed(2).replace(".", ",");
        mensaje += `- ${producto.nombre}: $${precioFormateado}\n`;
      });
      mensaje += "\n";
    });

    mensaje += "Para ver imágenes, escribe: *ver imágenes*\n\n";
    mensaje += "📌 *¿Cómo hacer un pedido?*\n";
    mensaje +=
      "Escribe *quiero comprar* seguido del nombre exacto del producto.\n";
    mensaje += 'Ejemplo: "quiero comprar Frasco de 500 ml"\n\n';
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
        texto:
          "❌ Categoría no encontrada. Por favor, elige una categoría válida del menú.",
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

    // se retoma la lógica para cargar la imagen del primer producto
    if (productos.length > 0 && productos[0].imagen) {
      try {
        const mediaPath = path.resolve(
          process.cwd(),
          "src/data/images/" + productos[0].imagen
        );
        if (fs.existsSync(mediaPath)) {
          const media = MessageMedia.fromFilePath(mediaPath);
          return { texto: mensaje, imagen: media };
        }
      } catch (error) {
        logger.error(`Error al cargar imagen: ${error}`);
      }
    }

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
   * @param pedido El texto del pedido del usuario
   * @returns Objeto con respuesta y datos del pedido
   */
  public procesarPedido(pedido: string): {
    texto: string;
    encontrado: boolean;
    producto?: { nombre: string; precio: number; categoria: string };
  } {
    // se normaliza el texto del pedido
    const textoPedido = pedido
      .toLowerCase()
      .replace(
        /quiero comprar|comprar|me gustaría|quisiera|necesito|quiero|pedir/gi,
        ""
      )
      .trim();

    // si el texto es muy corto, se solicita más información
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

    // se busca el producto en todas las categorías
    for (const categoria of this.productos) {
      for (const producto of categoria.productos) {
        const nombreProducto = producto.nombre?.toLowerCase() || "";

        // si el nombre del producto contiene el texto del pedido
        if (
          nombreProducto.includes(textoPedido) ||
          textoPedido.includes(nombreProducto)
        ) {
          const precioFormateado = producto.precio.toFixed(2).replace(".", ",");

          return {
            texto:
              `✅ *Producto encontrado:*\n\n` +
              `📦 ${producto.nombre}\n` +
              `💰 Precio: $${precioFormateado}\n` +
              `🏷️ Categoría: ${categoria.categoria}\n\n` +
              `Para confirmar tu pedido, por favor envía los siguientes datos:\n\n` +
              `1️⃣ Tu nombre completo\n` +
              `2️⃣ Tu dirección de entrega (o indica si recogerás en el Monasterio)\n` +
              `3️⃣ Tu número de teléfono\n` +
              `4️⃣ Cantidad de unidades\n\n` +
              `Nota: La información se usará únicamente para procesar tu pedido.`,
            encontrado: true,
            producto: {
              nombre: producto.nombre,
              precio: producto.precio,
              categoria: categoria.categoria,
            },
          };
        }
      }
    }

    // si también se busca por categoría
    for (const categoria of this.productos) {
      if (categoria.categoria.toLowerCase().includes(textoPedido)) {
        let sugerencias = "";
        if (categoria.productos.length > 0) {
          sugerencias = "Algunos productos de esta categoría:\n\n";
          categoria.productos.forEach((producto) => {
            const precioFormateado = producto.precio
              .toFixed(2)
              .replace(".", ",");
            sugerencias += `- ${producto.nombre}: $${precioFormateado}\n`;
          });
        }

        return {
          texto:
            `No has especificado qué producto de *${categoria.categoria}* deseas comprar.\n\n` +
            `${sugerencias}\n` +
            `Por favor, escribe *quiero comprar* seguido del nombre exacto del producto.\n` +
            `Ejemplo: "Quiero comprar ${
              categoria.productos.length > 0
                ? categoria.productos[0].nombre
                : "un producto específico"
            }"`,
          encontrado: false,
        };
      }
    }

    // producto no encontrado
    return {
      texto:
        `Lo siento, no encontré ese producto en nuestro catálogo.\n\n` +
        `👉 Asegúrate de escribir el nombre exacto como aparece en el catálogo.\n\n` +
        `Escribe *ver productos* para consultar los productos disponibles.\n` +
        `Recuerda que debes usar el formato: "quiero comprar [nombre exacto del producto]"\n\n` +
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
}
