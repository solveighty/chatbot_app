export const MENSAJE_DATOS_INVALIDOS =
  `❌ *Los datos proporcionados no son válidos*\n\n` +
  `Por favor, proporciona la siguiente información en formato correcto:\n\n` +
  `1️⃣ *Tu nombre completo* (mínimo 3 caracteres)\n` +
  `2️⃣ *Tu dirección de entrega* (o indica si recogerás en el Monasterio)\n` +
  `3️⃣ *Tu número de teléfono* (formato válido)\n\n` +
  `Ejemplo:\n` +
  `María Pérez\n` +
  `Calle Principal 123, Ciudad\n` +
  `0991234567`;

export const MENSAJE_PEDIDO_CONFIRMADO = (invoiceNumber: string, total: string, nombre: string, telefono: string) =>
  `✅ *¡Pedido confirmado!*\n\n` +
  `Tu pedido Nº ${invoiceNumber} por un total de $${total} ha sido registrado a nombre de ${nombre}.\n\n` +
  `Una hermana del monasterio se pondrá en contacto contigo al ${telefono} pronto para coordinar el pago y la entrega.\n\n` +
  `A continuación te enviamos tu factura digital en formato PDF.\n\n` +
  `¡Gracias por tu compra! Dios te bendiga.`;

export const MENSAJE_PEDIDO_CONFIRMADO_SIMPLE = (nombre: string) =>
  `✅ *¡Pedido confirmado!*\n\n` +
  `Tu pedido ha sido registrado correctamente a nombre de ${nombre}.\n\n` +
  `Una hermana del monasterio se pondrá en contacto contigo pronto para coordinar el pago y la entrega.\n\n` +
  `¡Gracias por tu compra! Dios te bendiga.`;

export const MENSAJE_PEDIDO_CANCELADO =
  `❌ *Pedido cancelado*\n\n` +
  `Has cancelado tu pedido. Tu carrito ha sido vaciado.\n\n` +
  `Si deseas realizar otra consulta o pedido, estamos a tu disposición.`;

export const MENSAJE_SOLICITAR_INFO =
  `Por favor, proporciona la información solicitada para continuar con tu pedido.`;