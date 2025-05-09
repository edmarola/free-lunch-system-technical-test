import { config } from "@/config";
import { Dish, DishStatus } from "../models/dish";
import { Ingredient } from "../models/ingredient";
import { Order, OrderStatus } from "../models/order";
import { RECIPES } from "../models/recipe";
import { EventHandler } from "./interfaces/event-handler";
import { Repository } from "./interfaces/repository";
import { USER_ID } from "@/constants";
// TODO: Filter by real userId logged into the system.

export class OrdersService {
  constructor(
    private readonly ordersRepository: Repository<Order>,
    private readonly ordersEventHandler: EventHandler
  ) {
    this.ordersEventHandler.receive({
      queue: config.FULFILLED_INGREDIENTS_QUEUE_URL,
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

    await this.ordersRepository.create({ item: order });
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
  }): Promise<Order | undefined> {
    try {
      const order = await this.ordersRepository.findById({
        userId,
        id: orderId,
      });
      if (!order) {
        console.error(`Order ${orderId} not found`);
      } else {
        const dish = order.dishes.find((dish) => dish.id === dishId);
        if (!dish) {
          console.error(`Dish ${dishId} not found`);
        } else {
          if (dish.status === DishStatus.PENDING) {
            dish.status = DishStatus.COMPLETED;
            order.dishesCompleted += 1;
            if (order.dishesCompleted === order.dishesTotal) {
              order.status = OrderStatus.COMPLETED;
            }
            return await this.ordersRepository.update({
              userId,
              id: orderId,
              item: order,
            });
          }
          console.log(`Dish ${dishId} is ready`);
        }
      }
    } catch (error) {
      console.error(
        `Error preparing dish ${dishId} for user ${userId} and order ${orderId}: ${error}`
      );
    }
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
      queue: config.REQUESTED_INGREDIENTS_QUEUE_URL,
      data: {
        userId,
        orderId,
        dishId,
        ingredients,
      },
    });
  }
}
