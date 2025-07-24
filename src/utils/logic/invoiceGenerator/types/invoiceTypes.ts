import { CartItem } from "../../../../services/cartService";

export interface InvoiceData {
  cliente: {
    nombre: string;
    direccion: string;
    telefono: string;
  };
  items: CartItem[];
  total: number;
  fecha: Date;
  invoiceNumber: string;
}