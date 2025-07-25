import fs from "fs";
import path from "path";
import logger from "../utils/logger";
import { MessageMedia } from "whatsapp-web.js";
import { IProductService } from "../interfaces/services";
import {
  Variante,
  Producto,
  Categoria,
} from "./logic/productService/types/product";
import { getCategoriasLogic } from "./logic/productService/logic/getCategorias";
import { getProductosPorCategoriaLogic } from "./logic/productService/logic/getProductosPorCategoria";
import { generarMenuCategoriasLogic } from "./logic/productService/logic/generarMenuCategorias";
import { procesarSeleccionCategoriaLogic } from "./logic/productService/logic/procesarSeleccionCategoria";
import { getEmojiForCategoryLogic } from "./logic/productService/logic/getEmojiForCategory";
import { procesarPedidoLogic } from './logic/productService/logic/procesarPedido';
import { buscarProductoExactoLogic } from './logic/productService/logic/buscarProductoExacto';
import { buscarProductoEnCategoriaLogic } from './logic/productService/logic/buscarProductoEnCategoria';
import { obtenerIndiceCategoriaLogic } from './logic/productService/logic/obtenerIndiceCategoria';
import { obtenerImagenProductoLogic } from './logic/productService/logic/obtenerImagenProducto';
import { generarListaProductosNumeradosLogic } from './logic/productService/logic/generarListaProductosNumerados';
import { buscarProductoPorCodigoLogic } from './logic/productService/logic/buscarProductoPorCodigo';
import { generarListaProductosCategoriaLogic } from './logic/productService/logic/generarListaProductosCategoria';
import { procesarSolicitudImagenLogic } from './logic/productService/logic/procesarSolicitudImagen';
import { generarMenuImagenesNumeradoLogic } from './logic/productService/logic/generarMenuImagenesNumerado';
import { buscarProductosLogic } from './logic/productService/logic/buscarProductos';
import { generarListaProductosLogic } from './logic/productService/logic/generarListaProductos';

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
    return getCategoriasLogic(this.productos);
  }

  /**
   * Obtiene los productos de una categoría específica
   */
  public getProductosPorCategoria(nombreCategoria: string): Producto[] {
    return getProductosPorCategoriaLogic(this.productos, nombreCategoria);
  }

  /**
   * Genera un texto con todos los productos disponibles mostrando variantes
   */
  public generarListaProductos(): string {
    return generarListaProductosLogic(this.productos, this.getEmojiForCategory.bind(this));
  }

  /**
   * Genera un menú para seleccionar categoría de imágenes
   */
  public generarMenuCategorias(): string {
    return generarMenuCategoriasLogic(this.productos);
  }

  /**
   * Procesa la selección de categoría para imágenes
   */
  public async procesarSeleccionCategoria(
    seleccion: string
  ): Promise<{ texto: string; imagen?: MessageMedia }> {
    return procesarSeleccionCategoriaLogic(this.productos, seleccion);
  }

  /**
   * Devuelve un emoji apropiado según la categoría de producto
   */
  private getEmojiForCategory(categoria: string): string {
    return getEmojiForCategoryLogic(categoria);
  }

  /**
   * Procesa un pedido de compra
   */
  public procesarPedido(pedido: string): {
    texto: string;
    encontrado: boolean;
    producto?: { nombre: string; precio: number; categoria: string };
  } {
    return procesarPedidoLogic(
      this.productos,
      pedido,
      this.buscarProductoExacto.bind(this)
    );
  }

  /**
   * Busca productos que coincidan with un término de búsqueda
   */
  public buscarProductos(termino: string): string {
    return buscarProductosLogic(this.productos, termino);
  }

  /**
   * Busca un producto exacto por su nombre, incluyendo variantes
   */
  public buscarProductoExacto(nombreProducto: string): {
    nombre: string;
    precio: number;
    categoria: string;
  } | null {
    return buscarProductoExactoLogic(this.productos, nombreProducto);
  }

  /**
   * Busca un producto específico dentro de una categoría
   */
  public buscarProductoEnCategoria(
    nombreCategoria: string,
    nombreProducto: string
  ): Producto | null {
    return buscarProductoEnCategoriaLogic(this.productos, nombreCategoria, nombreProducto);
  }

  /**
   * Obtiene el índice de una categoría por nombre o número
   */
  public obtenerIndiceCategoria(seleccion: string): number {
    return obtenerIndiceCategoriaLogic(this.productos, seleccion);
  }

  /**
   * Obtiene la imagen de un producto
   */
  public async obtenerImagenProducto(
    producto: Producto
  ): Promise<MessageMedia | undefined> {
    return obtenerImagenProductoLogic(producto);
  }

  /**
   * Genera un texto con todos los productos disponibles, numerados por categoría y subcategoría
   */
  public generarListaProductosNumerados(): string {
    return generarListaProductosNumeradosLogic(this.productos, this.getEmojiForCategory.bind(this));
  }

  /**
   * Busca producto por su código numérico (formato: categoria.producto.variante)
   */
  public buscarProductoPorCodigo(codigo: string): {
    nombre: string;
    precio: number;
    categoria: string;
  } | null {
    return buscarProductoPorCodigoLogic(this.productos, codigo);
  }

  /**
   * Genera una lista de productos de una categoría específica con numeración
   */
  public generarListaProductosCategoria(nombreCategoria: string): string {
    return generarListaProductosCategoriaLogic(
      this.productos,
      nombreCategoria,
      this.getEmojiForCategory.bind(this)
    );
  }

  /**
   * Procesa la solicitud de imágenes basada en códigos numéricos
   * @param codigo Código numérico (formato: categoria o categoria.producto)
   */
  public async procesarSolicitudImagen(codigo: string): Promise<{
    texto: string;
    imagen?: MessageMedia;
    esCategoria: boolean;
  }> {
    return procesarSolicitudImagenLogic(
      this.productos,
      codigo,
      this.obtenerImagenProducto.bind(this)
    );
  }

  /**
   * Genera un menú numerado para ver imágenes por categoría
   */
  public generarMenuImagenesNumerado(): string {
    return generarMenuImagenesNumeradoLogic(this.productos, this.getEmojiForCategory.bind(this));
  }
}
