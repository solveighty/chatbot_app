import { MessageMedia } from 'whatsapp-web.js';
import { CartItem } from '../services/cartService';

export interface PedidoResult {
  texto: string;
  encontrado: boolean;
  producto?: { nombre: string; precio: number; categoria: string };
}

export interface IResponseService {
  getRandomResponse(category: string): string;
  determineCategory(message: string): string;
  getHelpMessage(): string;
}

export interface IProductService {
  getCategorias(): string[];
  getProductosPorCategoria(nombreCategoria: string): any[];
  generarListaProductos(): string;
  generarMenuCategorias(): string;
  procesarSeleccionCategoria(seleccion: string): Promise<{ texto: string; imagen?: MessageMedia }>;
  procesarPedido(pedido: string): PedidoResult;
  buscarProductos(termino: string): string;
  buscarProductoExacto(nombreProducto: string): { nombre: string; precio: number; categoria: string } | null;
  buscarProductoEnCategoria(nombreCategoria: string, nombreProducto: string): any | null;
  obtenerIndiceCategoria(seleccion: string): number;
  obtenerImagenProducto(producto: any): Promise<MessageMedia | undefined>;
  buscarProductoPorCodigo(codigo: string): { nombre: string; precio: number; categoria: string } | null;
  generarListaProductosCategoria(nombreCategoria: string): string;
  generarListaProductosNumerados(): string;
}

export interface ICartService {
  getCart(userId: string): CartItem[];
  addItemToCart(userId: string, producto: { nombre: string; precio: number; categoria: string }, cantidad?: number): CartItem[];
  removeItemFromCart(userId: string, index: number): boolean;
  clearCart(userId: string): void;
  getCartTotal(userId: string): number;
  generateCartSummary(userId: string): string;
}

export interface IConversationStateManager {
  getState(userId: string): any;
  updateState(userId: string, updates: any): void;
  clearState(userId: string): void;
}