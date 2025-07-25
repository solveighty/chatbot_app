import { ResponseCollection } from "../types/responseCollection";

export function getRandomResponseLogic(responses: ResponseCollection, category: string): string {
  const responseList = responses[category] || responses.default;
  const randomIndex = Math.floor(Math.random() * responseList.length);
  return responseList[randomIndex];
}