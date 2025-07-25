import { OrderData } from "../types/orderData";

export function getOrdersByStatusLogic(orders: OrderData[], status: string): OrderData[] {
  if (!status) return orders;
  return orders.filter(order => order.status === status);
}