export function getStateLogic(
  conversationState: Map<string, any>,
  userId: string
): any {
  return conversationState.get(userId);
}