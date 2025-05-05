import { Ingredient } from "./ingredients";

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}
