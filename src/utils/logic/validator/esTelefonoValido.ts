export function esTelefonoValido(telefono: string): boolean {
  return /\d{7,15}/.test(telefono.replace(/\D/g, ''));
}