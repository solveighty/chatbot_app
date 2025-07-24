import { IResponseService } from '../../../interfaces/services';
import { CommandResult } from '../types/commandResult';

export function getHelpMessage(
  responseService: IResponseService
): CommandResult {
  return {
    response: responseService.getHelpMessage()
  };
}