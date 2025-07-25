export function containsAnyLogic(text: string, keywords: string[]): boolean {
  return keywords.some(keyword => text.includes(keyword));
}