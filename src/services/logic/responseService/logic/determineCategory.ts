export function determineCategoryLogic(
  message: string,
  containsAny: (text: string, keywords: string[]) => boolean
): string {
  const lowerMessage = message.toLowerCase();

  if (containsAny(lowerMessage, ['ayuda', 'cómo comprar', 'como comprar', 'instrucciones', 'help'])) {
    return 'ayuda';
  }
  if (containsAny(lowerMessage, ['comprar', 'quiero', 'pedir', 'adquirir', 'precio', 'cuesta', 'valor'])) {
    return 'compra';
  }
  if (containsAny(lowerMessage, ['hola', 'buenos días', 'buenas', 'saludos', 'hey'])) {
    return 'saludos';
  }
  if (containsAny(lowerMessage, ['adiós', 'chao', 'hasta luego', 'bye', 'nos vemos'])) {
    return 'despedidas';
  }
  if (containsAny(lowerMessage, ['gracias', 'te agradezco', 'muchas gracias'])) {
    return 'agradecimientos';
  }
  if (containsAny(lowerMessage, ['producto', 'catálogo', 'venden', 'tienen', 'disponible'])) {
    return 'productos';
  }
  return 'default';
}