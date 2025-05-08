import { IngredientName } from "../../models/ingredient";

export interface MarketAdapter {
  buy(item: { ingredient: IngredientName }): Promise<{ qtySold: number }>;
}
