export interface Variante {
  nombre: string;
  precio: number;
}

export interface Producto {
  nombre: string;
  precio: number;
  imagen?: string;
  variantes?: Variante[];
}

export interface Categoria {
  categoria: string;
  productos: Producto[];
}