import { Recipe } from "./recipe";

export type DishStatus = "PENDING" | "COMPLETED";
export const DishStatus: Record<string, DishStatus> = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
};

export interface Dish {
  id: string;
  status: DishStatus;
  recipe: Recipe;
}
