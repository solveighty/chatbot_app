export function updateStateLogic(
  conversationState: Map<string, any>,
  userId: string,
  state: any
): void {
  const currentState = conversationState.get(userId) || {};
  conversationState.set(userId, {
    ...currentState,
    ...state
  });
}