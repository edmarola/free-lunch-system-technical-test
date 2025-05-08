import { config } from "../config";
import { Ingredient, IngredientName } from "../models/ingredient";
import { EventHandler } from "./interfaces/event-handler";
import { IngredientsRequest } from "./interfaces/ingredients-request";
import { Mediator } from "./interfaces/mediator";
import { Repository } from "./interfaces/repository";
import { InventoryEvent } from "./types/inventory-event";

export class IngredientsService {
  private readonly ingredientsRepository: Repository<Ingredient>;
  private readonly mediator: Mediator;
  private readonly ingredientsEventHandler: EventHandler;

  constructor({
    ingredientsRepository,
    mediator,
    ingredientsEventHandler,
  }: {
    ingredientsRepository: Repository<Ingredient>;
    mediator: Mediator;
    ingredientsEventHandler: EventHandler;
  }) {
    this.ingredientsRepository = ingredientsRepository;
    this.mediator = mediator;
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
        this.mediator.send({
          sender: this,
          event: InventoryEvent.PURCHASE_INGREDIENT,
          data: { request, missingIngredient: name },
        });
        break;
      } else {
        ingredientsToUpdate.push({ name, stock: stock - quantities[name] });
      }
    }

    if (!missingIngredient) {
      this.ingredientsRepository.updateMany(ingredientsToUpdate);
      this.ingredientsEventHandler.send({
        queue: config.FULFILLED_INGREDIENTS_QUEUE_URL,
        data: JSON.stringify(request),
      });
    }
  }
}
