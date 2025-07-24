export function esNombreValido(nombre: string): boolean {
  return nombre.length >= 3 && !/^\d+$/.test(nombre);
}