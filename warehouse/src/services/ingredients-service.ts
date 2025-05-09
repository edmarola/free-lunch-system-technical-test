import { config } from "../config";
import { Ingredient, IngredientName } from "../models/ingredient";
import { EventHandler } from "./interfaces/event-handler";
import { IngredientsRequest } from "./interfaces/ingredients-request";
import { Mediator } from "./interfaces/mediator";
import { Repository } from "./interfaces/repository";
import { InventoryEvent } from "./types/inventory-event";

export class IngredientsService {
  private readonly ingredientsRepository: Repository<Ingredient>;
  private readonly ingredientsEventHandler: EventHandler;
  public mediator!: Mediator;

  constructor({
    ingredientsRepository,
    ingredientsEventHandler,
  }: {
    ingredientsRepository: Repository<Ingredient>;
    ingredientsEventHandler: EventHandler;
  }) {
    this.ingredientsRepository = ingredientsRepository;
    this.ingredientsEventHandler = ingredientsEventHandler;
    this.ingredientsEventHandler.receive({
      queue: config.REQUESTED_INGREDIENTS_QUEUE_URL,
      callback: (payload) => {
        const data = JSON.parse(payload);
        this.checkIngredients(data as IngredientsRequest);
      },
    });
  }

  public async getIngredients(): Promise<Ingredient[]> {
    return this.ingredientsRepository.findAll();
  }

  public async checkIngredients(request: IngredientsRequest): Promise<void> {
    const { ingredients } = request;
    const quantities: Record<IngredientName, number> = Object.fromEntries(
      ingredients.map(({ name, quantity }) => [name, quantity])
    ) as Record<IngredientName, number>;
    const existingIngredients = await this.ingredientsRepository.findAllByIds(
      Object.keys(quantities) // will receive the ingredient names required.
    );
    let missingIngredient = false;
    const ingredientsToUpdate: Ingredient[] = [];

    for (const { name, stock } of existingIngredients) {
      if (quantities[name] > stock) {
        missingIngredient = true;
        this.mediator.send({
          event: InventoryEvent.PURCHASE_INGREDIENT,
          data: { request, missingIngredient: name },
        });
        break;
      } else {
        ingredientsToUpdate.push({ name, stock: stock - quantities[name] });
      }
    }

    if (!missingIngredient) {
      await this.ingredientsRepository.updateMany(ingredientsToUpdate);
      console.debug(
        "FULFILLED INGREDIENTS FOR DISH: ",
        request.dishId,
        "ORDER:",
        request.orderId
      );
      await this.ingredientsEventHandler.send({
        queue: config.FULFILLED_INGREDIENTS_QUEUE_URL,
        data: request,
      });
    }
  }
}
