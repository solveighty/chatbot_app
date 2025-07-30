import fs from 'fs';
import path from 'path';
import logger from '../utils/logger';
import { IResponseService } from '../interfaces/services';
import { ResponseCollection } from './logic/responseService/types/responseCollection';
import { getRandomResponseLogic } from './logic/responseService/logic/getRandomResponse';
import { determineCategoryLogic } from './logic/responseService/logic/determineCategory';
import { containsAnyLogic } from './logic/responseService/logic/containsAny';
import { getHelpMessageLogic } from './logic/responseService/logic/getHelpMessage';
import { getImageHelpMessageLogic } from './logic/responseService/logic/getImageHelpMessage';

export class ResponseService implements IResponseService {
  private responses: ResponseCollection;

  constructor() {
    try {
      const filePath = path.resolve(process.cwd(), 'dist/data/responses.json');
      const data = fs.readFileSync(filePath, 'utf8');
      this.responses = JSON.parse(data);
      logger.info('Respuestas cargadas correctamente');
    } catch (error) {
      logger.error(`Error al cargar las respuestas: ${error}`);
      this.responses = {
        default: ["Lo siento, estoy teniendo problemas técnicos."]
      };
    }
  }

  public getRandomResponse(category: string): string {
    return getRandomResponseLogic(this.responses, category);
  }

  public determineCategory(message: string): string {
    return determineCategoryLogic(message, this.containsAny.bind(this));
  }

  private containsAny(text: string, keywords: string[]): boolean {
    return containsAnyLogic(text, keywords);
  }
  
  public getHelpMessage(): string {
    return getHelpMessageLogic();
  }

  public getImageHelpMessage(): string {
    return getImageHelpMessageLogic();
  }
}