import { Ingredient, IngredientName } from "../models/ingredient";
import { IngredientsRequest } from "./interfaces/ingredients-request";
import { Mediator } from "./interfaces/mediator";
import { Repository } from "./interfaces/repository";
import { InventoryEvent } from "./types/inventory-event";

export class IngredientsService {
  constructor(
    private readonly ingredientsRepository: Repository<Ingredient>,
    private readonly mediator: Mediator
  ) {}

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
      this.mediator.send({
        event: InventoryEvent.FULFILL_INGREDIENTS,
        data: { request },
      });
    }
  }
}
