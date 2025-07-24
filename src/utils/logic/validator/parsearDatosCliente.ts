export function parsearDatosCliente(datosTexto: string) {
  const lineas = datosTexto.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const nombre = lineas[0] || '';
  const direccion = lineas.length >= 3 ? lineas[1] : 'Recoge en Monasterio';
  const telefono = lineas.length >= 3 ? lineas[2] : lineas[1] || '';
  return { nombre, direccion, telefono, lineas };
}