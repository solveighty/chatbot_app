import { OrderData } from "../types/orderData";

export function getOrdersByProductLogic(orders: OrderData[], product: string): OrderData[] {
  if (!product) return orders;

  const productLower = product.toLowerCase();

  return orders.filter(order =>
    order.items.some(item =>
      item.nombre.toLowerCase().includes(productLower) ||
      item.categoria.toLowerCase().includes(productLower)
    )
  );
}