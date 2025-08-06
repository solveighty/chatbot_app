import { CartItem } from "../services/cartService";
import { ServiceService } from "../services/serviceService";

export interface IProductService {
  getProductos(): any[];
  getCategorias(): string[];
  getProductosPorCategoria(categoria: string): any[];
  buscarProductos(termino: string): any[];
  buscarProductoExacto(nombre: string): any;
  buscarProductoPorCodigo(codigo: string): any;
  buscarProductoEnCategoria(categoria: string, nombre: string): any;
  generarMenuCategorias(): string;
  generarListaProductos(): string;
  generarListaProductosCategoria(categoria: string): string;
  generarListaProductosNumerados(): string;
  generarMenuImagenesNumerado(): string;
  procesarSeleccionCategoria(mensaje: string): Promise<{ texto: string; imagen?: any }>;
  obtenerImagenProducto(producto: any): Promise<any>;
  procesarPedido(productos: any[]): any;
  procesarSolicitudImagen(mensaje: string): Promise<{ texto: string; imagen?: any; esCategoria?: boolean }>;
  getProductById(id: number): any;
  generarMenuCompletoConServicios(serviceService: any): string;
}

export interface ICartService {
  addItemToCart(userId: string, item: CartItem, cantidad: number): void;
  removeItemFromCart(userId: string, index: number): boolean;
  getCart(userId: string): CartItem[];
  getCartTotal(userId: string): number;
  clearCart(userId: string): void;
  generateCartSummary(userId: string): string;
}

export interface IConversationStateManager {
  getState(userId: string): any;
  updateState(userId: string, updates: any): void;
  clearState(userId: string): void;
}

export interface IResponseService {
  getRandomResponse(category: string): string;
  determineCategory(message: string): string;
  containsAny(message: string, keywords: string[]): boolean;
  getHelpMessage(): string;
  getImageHelpMessage(): string;
}

export interface IServiceService {
  getServices(): any[];
  getServiceCategories(): string[];
  getServiceByCategory(categoria: string): any;
  getServiceProduct(categoria: string, nombre: string): any;
  getServiceById(id: number): any;
  generateServicesMenu(): string;
  generateServiceDetails(categoria: string): string;
  getContactHours(): string;
  isContactCommand(message: string): boolean;
  getServiceContactInfo(categoria: string, nombre: string): string;
  processServiceInquiry(userId: string, serviceId: number, userData: { nombre: string; cedula: string; telefono: string }): Promise<string>;
  getServiceInquiries(): any[];
}