import { Dish } from "./dish";

export type OrderStatus = "PENDING" | "COMPLETED";
export const OrderStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
};

export interface Order {
  userId: string;
  orderId: string;
  status: OrderStatus;
  createdAt: number;
  dishesTotal: number;
  dishesCompleted: number;
  dishes: Dish[];
}
