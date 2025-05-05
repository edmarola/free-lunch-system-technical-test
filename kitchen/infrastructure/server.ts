import { RecipesService } from "../services/recipes-service";
import { OrdersService } from "../services/orders-service";
import { OrdersRepository } from "./repositories/orders-repository";

export const bootstrap = async () => {
  const ordersService = new OrdersService(new OrdersRepository());
  const recipesService = new RecipesService();

  // TODO GET/ get orders
  // TODO post orders
  // TODO: get recipes
};
