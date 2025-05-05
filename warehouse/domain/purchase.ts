import { IngredientName } from "./ingredient";

export type PurchaseStatus = "ON_HOLD" | "COMPLETED";
export const PurchaseStatus: Record<string, PurchaseStatus> = {
  ON_HOLD: "ON_HOLD",
  COMPLETED: "COMPLETED",
};

export interface Purchase {
  id: string;
  date: Date;
  status: PurchaseStatus;
  ingredientName: IngredientName;
  quantity: number;
}
