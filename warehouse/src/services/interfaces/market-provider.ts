import { IngredientName } from "../../models/ingredient";

export interface MarketProvider {
  buy(item: { ingredient: IngredientName }): Promise<{ qtySold: number }>;
}
