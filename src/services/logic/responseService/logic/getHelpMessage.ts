export function getHelpMessageLogic(): string {
  return `📝 *¿Cómo hacer un pedido?*\n\n` +
    `Para hacer un pedido, sigue estos pasos:\n\n` +
    `1️⃣ Escribe *ver productos* para ver el catálogo completo con códigos numéricos\n\n` +
    `2️⃣ Identifica el código del producto que deseas comprar\n\n` +
    `3️⃣ Selecciona un producto usando su código numérico:\n` +
    `   ✅ Ejemplo: "1.2" (Categoría 1, Producto 2)\n` +
    `   ✅ Ejemplo: "1.2.3" (Categoría 1, Producto 2, Variante 3)\n` +
    `   ✅ También puedes escribir: "quiero comprar 1.2"\n\n` +
    `4️⃣ *Indica la cantidad de unidades* cuando se te pregunte\n\n` +
    `5️⃣ Puedes añadir más productos a tu carrito repitiendo los pasos anteriores\n\n` +
    `6️⃣ Cuando termines, escribe *carrito* para ver tu selección\n\n` +
    `7️⃣ Escribe *finalizar* para proceder al pago\n\n` +
    `8️⃣ Proporciona tus datos completos de contacto cuando se te soliciten\n\n` +
    `9️⃣ Confirma tu pedido\n\n` +
    `📌 *Comandos del carrito:*\n` +
    `➕ *añadir [código]* - Añadir producto por su código\n` +
    `➕ *añadir [cantidad] [código]* - Añadir cantidad específica\n` +
    `➖ *quitar [número]* - Elimina un producto por su número en el carrito\n` +
    `🛒 *carrito* - Ver tu carrito actual\n` +
    `❌ *vaciar carrito* - Elimina todos los productos\n` +
    `✅ *finalizar* - Procede al pago\n\n` +
    `Si tienes problemas con tu pedido, escribe *ayuda* en cualquier momento.`;
}