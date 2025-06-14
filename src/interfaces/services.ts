import { Message, MessageMedia } from 'whatsapp-web.js';
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
}

export interface ICartService {
  addItemToCart(userId: string, producto: { nombre: string; precio: number; categoria: string }, cantidad?: number): CartItem[];
  getCart(userId: string): CartItem[];
  getCartTotal(userId: string): number;
  generateCartSummary(userId: string): string;
  removeItemFromCart(userId: string, index: number): boolean;
  clearCart(userId: string): void;
}

export interface IConversationStateManager {
  updateState(userId: string, state: any): void;
  getState(userId: string): any;
}