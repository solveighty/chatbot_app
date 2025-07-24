export function generarResumenPedido(carrito: any[], datosCliente: any, total: number): string {
  let resumen = `¡Gracias por proporcionar tus datos!\n\n*Resumen de tu pedido:*\n\n`;

  carrito.forEach((item, index) => {
    const subtotal = item.precio * item.cantidad;
    const precioFormateado = item.precio.toFixed(2).replace('.', ',');
    const subtotalFormateado = subtotal.toFixed(2).replace('.', ',');

    resumen += `${index + 1}. ${item.nombre} (${item.categoria})\n` +
               `   $${precioFormateado} x ${item.cantidad} = $${subtotalFormateado}\n\n`;
  });

  const totalFormateado = total.toFixed(2).replace('.', ',');

  resumen += `💰 *Total a pagar: $${totalFormateado}*\n\n`;
  resumen += `👤 *Datos del cliente:*\n`;
  resumen += `📝 Nombre: ${datosCliente.nombre}\n`;
  resumen += `🏠 Dirección: ${datosCliente.direccion}\n`;
  resumen += `📱 Teléfono: ${datosCliente.telefono}\n\n`;
  resumen += `¿Deseas confirmar este pedido? Responde con *SI* para confirmar o *NO* para cancelar.`;

  return resumen;
}