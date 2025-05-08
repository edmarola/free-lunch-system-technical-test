import { IngredientName } from "../../models/ingredient";

export interface IngredientRequested {
  name: IngredientName;
  quantity: number;
}

export interface IngredientsRequest {
  userId: string;
  orderId: string;
  dishId: string;
  ingredients: IngredientRequested[];
}
