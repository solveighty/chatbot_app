import { IProductService } from '../../../interfaces/services';

export class CategoryHelper {
  constructor(private readonly productService: IProductService) {}

  public esPosibleCategoria(mensaje: string): boolean {
    const categorias = this.productService.getCategorias();
    return categorias.some(categoria =>
      mensaje.toLowerCase().includes(categoria.toLowerCase())
    );
  }
}