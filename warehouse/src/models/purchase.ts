import { IngredientName } from "./ingredient";

export interface Purchase {
  id: string;
  date: Date;
  ingredientName: IngredientName;
  quantity: number;
}
