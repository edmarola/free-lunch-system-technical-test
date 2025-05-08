import { Dish } from "./dish";

export type OrderStatus = "PENDING" | "COMPLETED";
export const OrderStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
} as const;

export interface Order {
  userId: string;
  orderId: string;
  status: OrderStatus;
  createdAt: number;
  dishesTotal: number;
  dishesCompleted: number;
  dishes: Dish[];
}
