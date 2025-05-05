import { Order } from "@/models/order";
import { Repository } from "@/services/interfaces/repository";

export class OrdersRepository implements Repository<Order> {
  create(item: Order): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  update(id: string, item: Order): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Order | null> {
    throw new Error("Method not implemented.");
  }
  findAll(
    filter?: Partial<Record<keyof Order, any>> | undefined
  ): Promise<Order[]> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
