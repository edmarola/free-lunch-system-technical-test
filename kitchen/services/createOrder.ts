import { Order, OrderStatus } from "../models/order";
import { Repository } from "./interfaces/repository";

export class OrderService {
  constructor(private readonly orderRepository: Repository<Order>) {}

  async create({
    dishesQuantityRequested,
  }: {
    dishesQuantityRequested: number;
  }): Promise<Order> {
    const orderRequest: Order = {
      id: crypto.randomUUID(),
      status: OrderStatus.PENDING,
      dishesTotal: dishesQuantityRequested,
      dishesCompleted: 0,
      dishes: [],
    };
    await this.orderRepository.create(order);
  }
}
