import { Recipe } from "./recipe";

export type DishStatus = "PENDING" | "COMPLETED";
export const DishStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
} as const;

export interface Dish {
  id: string;
  status: DishStatus;
  recipe: Recipe;
}
