import { IngredientName } from "./ingredient";

export interface Purchase {
  purchaseId: string;
  createdAt: number;
  ingredientName: IngredientName;
  quantity: number;
}
