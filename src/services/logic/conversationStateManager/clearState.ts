export function clearStateLogic(
  conversationState: Map<string, any>,
  userId: string
): void {
  conversationState.delete(userId);
}