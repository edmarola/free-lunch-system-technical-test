import { Dish } from "./dish";

export type OrderStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export const OrderStatus: Record<string, OrderStatus> = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
};

export interface Order {
  id: string;
  status: OrderStatus;
  dishesTotal: number;
  dishesCompleted: number;
  dishes: Dish[];
}
