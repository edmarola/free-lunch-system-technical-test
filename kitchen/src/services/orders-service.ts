import { Dish, DishStatus } from "../models/dish";
import { Ingredient } from "../models/ingredient";
import { Order, OrderStatus } from "../models/order";
import { RECIPES } from "../models/recipe";
import { EventHandler } from "./interfaces/event-handler";
import { Repository } from "./interfaces/repository";
import { USER_ID } from "@/constants";

export class OrdersService {
  // TODO: Filter by real userId logged into the system.

  constructor(
    private readonly ordersRepository: Repository<Order>,
    private readonly ordersEventHandler: EventHandler
  ) {
    this.ordersEventHandler.receive({
      queue:
        "https://sqs.us-east-1.amazonaws.com/181939780845/fulfilledIngredients",
      callback: (payload) => {
        const { dishId, userId, orderId } = JSON.parse(payload);
        this.prepareDish({ dishId, userId, orderId });
      },
    });
  }

  public async createOrder({
    dishesQuantity,
  }: {
    dishesQuantity: number;
  }): Promise<Order> {
    let selectedDishes: Dish[] = [];
    for (let i = 0; i < dishesQuantity; i++) {
      const randomIndex = Math.floor(Math.random() * RECIPES.length);
      const recipe = RECIPES[randomIndex];
      const dish: Dish = {
        id: crypto.randomUUID(),
        status: DishStatus.PENDING,
        recipe,
      };
      selectedDishes.push(dish);
    }

    const order: Order = {
      userId: USER_ID,
      orderId: crypto.randomUUID(),
      status: OrderStatus.PENDING,
      dishesTotal: dishesQuantity,
      dishesCompleted: 0,
      dishes: selectedDishes,
      createdAt: Date.now(),
    };

    await this.ordersRepository.create(order);
    selectedDishes.forEach((dish) => {
      this.requestIngredients({
        userId: order.userId,
        orderId: order.orderId,
        dishId: dish.id,
        ingredients: dish.recipe.ingredients,
      });
    });
    return order;
  }

  public async getOrders(
    filter?: Partial<Record<keyof Order, any>>
  ): Promise<Order[]> {
    return await this.ordersRepository.findAll(filter);
  }

  public async prepareDish({
    userId,
    orderId,
    dishId,
  }: {
    userId: string;
    orderId: string;
    dishId: string;
  }): Promise<void> {
    console.log(
      `Preparing dish ${dishId} for user ${userId} and order ${orderId}`
    );
    // TODO: this is used when the event fulfiledIngredients is received.
    // TODO: when the ingredients are fulfilled then the dish is marked as READY
    // TODO: and the dishCompleted field is incremented by one.
    // TODO: IF dishCompleted is equal to dishTotal then the dish is marked as COMPLETED
  }

  private requestIngredients({
    userId,
    orderId,
    dishId,
    ingredients,
  }: {
    userId: string;
    orderId: string;
    dishId: string;
    ingredients: Ingredient[];
  }): void {
    this.ordersEventHandler.send({
      queue:
        "https://sqs.us-east-1.amazonaws.com/181939780845/requestedIngredients.fifo", // TODO: change to env variable
      data: {
        userId,
        orderId,
        dishId,
        ingredients,
      },
    });
  }
}
