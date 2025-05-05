export const fulfillIngredients = (ingredients: string[]): void => {
  // TODO: Check ingredients in warehouse one by one and lock the existing ones
  // TODO: If some is not available then use the retry patterns with exponential backoff until all are available.
  // TODO: when all are available, unlock the ingredients and discount the total in stock, finally emit the ingredients fulfilled event
};
