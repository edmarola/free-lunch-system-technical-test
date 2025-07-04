import { describe, expect, it, jest } from "@jest/globals";
import { OrdersEventHandler } from "../src/application/events/sqs/orders-event-handler";
import { Order, OrderStatus } from "../src/models/order";
import { Repository } from "../src/services/interfaces/repository";
import { OrdersService } from "../src/services/orders-service";
import { DishStatus } from "../src/models/dish";

class OrdersRepositoryMock implements Repository<Order> {
  create = jest.fn(({ item }: { item: Order }) => Promise.resolve(item));
  update = jest.fn(
    ({ id, userId, item }: { id: string; userId: string; item: Order }) =>
      Promise.resolve(item)
  );
  findAll = jest.fn(() => Promise.resolve([]));
  findById = jest.fn(({ id, userId }: { id: string; userId: string }) =>
    Promise.resolve({
      dishes: [
        {
          recipe: {
            name: "Tomato and Cheese Salad",
            ingredients: [
              {
                name: "Tomato",
                quantity: 2,
              },
              {
                name: "Cheese",
                quantity: 1,
              },
              {
                name: "Lettuce",
                quantity: 1,
              },
              {
                name: "Onion",
                quantity: 1,
              },
            ],
            id: "1",
          },
          id: "c7355002-188e-4149-b024-15b04cd293f2",
          status: DishStatus.PENDING,
        },
        {
          recipe: {
            name: "Cheesy Meat Sandwich",
            ingredients: [
              {
                name: "Meat",
                quantity: 1,
              },
              {
                name: "Cheese",
                quantity: 1,
              },
              {
                name: "Lettuce",
                quantity: 1,
              },
              {
                name: "Tomato",
                quantity: 1,
              },
            ],
            id: "5",
          },
          id: "f20cc778-2fb9-4110-8524-66a48e85ba38",
          status: DishStatus.PENDING,
        },
      ],
      dishesCompleted: 0,
      userId: "3f8c2b1e-9d4b-4a6f-8c7e-2a5d9f3b7e1a",
      orderId: "2437542b-61ff-4013-b137-bbf92806acb8",
      status: OrderStatus.PENDING,
      createdAt: 1746499973471,
      dishesTotal: 2,
    } as Order | null)
  );
  delete = jest.fn(({ id, userId }: { id: string; userId: string }) =>
    Promise.resolve()
  );
}

class OrdersEventHandlerMock implements OrdersEventHandler {
  send = jest.fn(({ queue, data }: { queue: string; data: any }) =>
    Promise.resolve()
  );
  receive = jest.fn(
    ({ queue, callback }: { queue: string; callback: (data: any) => void }) =>
      Promise.resolve()
  );
}

describe("Orders Service", () => {
  const ordersRepository = new OrdersRepositoryMock();
  const ordersEventHandler = new OrdersEventHandlerMock();
  const ordersService = new OrdersService(ordersRepository, ordersEventHandler); // SUT

  it("must create an order", async () => {
    const dishesQuantity = 1;

    const order = await ordersService.createOrder({
      dishesQuantity,
    });
    expect(order).toBeTruthy();
    expect(order.dishes.length).toBe(dishesQuantity);
    expect(order.dishesCompleted).toBe(0);
    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.dishesTotal).toBe(dishesQuantity);
  });

  it("must prepare a dish", async () => {
    const orderId = "2437542b-61ff-4013-b137-bbf92806acb8";
    const dishId = "c7355002-188e-4149-b024-15b04cd293f2";
    const userId = "3f8c2b1e-9d4b-4a6f-8c7e-2a5d9f3b7e1a";

    const order = await ordersService.prepareDish({
      orderId,
      dishId,
      userId,
    });

    expect(order).toBeTruthy();
    expect(order!.dishes.find((d) => d.id === dishId)!.status).toBe(
      DishStatus.COMPLETED
    );
    expect(order!.dishesCompleted).toBe(1);
    expect(order!.status).toBe(OrderStatus.PENDING);
    expect(ordersEventHandler.send).toHaveBeenCalled();
  });

  it("must mark order as completed when all dishes are completed", async () => {
    const orderId = "2437542b-61ff-4013-b137-bbf92806acb8";
    const dishId = "f20cc778-2fb9-4110-8524-66a48e85ba38";
    const userId = "3f8c2b1e-9d4b-4a6f-8c7e-2a5d9f3b7e1a";

    ordersRepository.findById.mockResolvedValueOnce({
      dishes: [
        {
          recipe: {
            name: "Tomato and Cheese Salad",
            ingredients: [
              {
                name: "Tomato",
                quantity: 2,
              },
              {
                name: "Cheese",
                quantity: 1,
              },
              {
                name: "Lettuce",
                quantity: 1,
              },
              {
                name: "Onion",
                quantity: 1,
              },
            ],
            id: "1",
          },
          id: "c7355002-188e-4149-b024-15b04cd293f2",
          status: DishStatus.COMPLETED,
        },
        {
          recipe: {
            name: "Cheesy Meat Sandwich",
            ingredients: [
              {
                name: "Meat",
                quantity: 1,
              },
              {
                name: "Cheese",
                quantity: 1,
              },
              {
                name: "Lettuce",
                quantity: 1,
              },
              {
                name: "Tomato",
                quantity: 1,
              },
            ],
            id: "5",
          },
          id: "f20cc778-2fb9-4110-8524-66a48e85ba38",
          status: DishStatus.PENDING,
        },
      ],
      dishesCompleted: 1,
      userId: "3f8c2b1e-9d4b-4a6f-8c7e-2a5d9f3b7e1a",
      orderId: "2437542b-61ff-4013-b137-bbf92806acb8",
      status: OrderStatus.PENDING,
      createdAt: 1746499973471,
      dishesTotal: 2,
    } as Order | null);

    const order = await ordersService.prepareDish({
      orderId,
      dishId,
      userId,
    });

    expect(order).toBeTruthy();
    expect(order!.dishes.find((d) => d.id === dishId)!.status).toBe(
      DishStatus.COMPLETED
    );
    expect(order!.dishesCompleted).toBe(2);
    expect(order!.status).toBe(OrderStatus.COMPLETED);
  });
});
