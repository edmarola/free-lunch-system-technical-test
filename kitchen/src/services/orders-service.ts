import { Dish, DishStatus } from "../models/dish";
import { Ingredient } from "../models/ingredient";
import { Order, OrderStatus } from "../models/order";
import { RECIPES } from "../models/recipe";
import { Repository } from "./interfaces/repository";
import { USER_ID } from "@/constants";

export class OrdersService {
  // TODO: Filter by real userId logged into the system.

  constructor(private readonly ordersRepository: Repository<Order>) {
    //listen kafka event and trigger prepareDish
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

  public prepareDish({ dishId }: { dishId: string }): void {
    // TODO: this is used when the event fulfiledIngredients is received.
    // TODO: when the ingredients are fulfilled then the dish is marked as READY
    // TODO: and the dishCompleted field is incremented by one.
    // TODO: IF dishCompleted is equal to dishTotal then the dish is marked as COMPLETED
  }

  public requestIngredients({
    dishId,
    ingredients,
  }: {
    dishId: string;
    ingredients: Ingredient[];
  }): void {
    // triggers kafka event
    // TODO: take the ingredients and send through SQS a message to the warehouse to fulfill the ingredients.
    // TODO: this is an async message to the warehouse microservice.
  }
}
