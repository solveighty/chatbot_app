import fs from 'fs';

export function listarArchivosDirectorio(ruta: string): string[] {
  try {
    return fs.readdirSync(ruta);
  } catch {
    return [];
  }
}