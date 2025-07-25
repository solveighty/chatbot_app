import { CartItem } from "../../cartService/types/cartItem";

export interface OrderData {
  orderId: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
  paymentMethod?: string;
  notes?: string;
}