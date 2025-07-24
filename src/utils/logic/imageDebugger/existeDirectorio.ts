import fs from 'fs';

export function existeDirectorio(ruta: string): boolean {
  return fs.existsSync(ruta);
}