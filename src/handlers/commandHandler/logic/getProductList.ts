import { IProductService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function getProductList(
  productService: IProductService
): CommandResult {
  return {
    response: productService.generarListaProductosNumerados()
  };
}