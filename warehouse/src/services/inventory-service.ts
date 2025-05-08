import { IngredientName } from "../models/ingredient";
import { IngredientsService } from "./ingredients-service";
import { IngredientsRequest } from "./interfaces/ingredients-request";
import { Mediator } from "./interfaces/mediator";
import { PurchasesService } from "./purchases-service";
import { InventoryEvent } from "./types/inventory-event";

export class InventoryService implements Mediator {
  private readonly ingredientsService: IngredientsService;
  private readonly purchasesService: PurchasesService;

  constructor({
    ingredientsService,
    purchasesService,
  }: {
    ingredientsService: IngredientsService;
    purchasesService: PurchasesService;
  }) {
    ingredientsService.mediator = this;
    purchasesService.mediator = this;
    this.ingredientsService = ingredientsService;
    this.purchasesService = purchasesService;
  }

  public async send({
    event,
    data: { request, missingIngredient },
  }: {
    event: InventoryEvent;
    data: { request: IngredientsRequest; missingIngredient?: IngredientName };
  }): Promise<void> {
    if (event === InventoryEvent.CHECK_INGREDIENTS) {
      this.ingredientsService.checkIngredients(request);
    }
    if (event === InventoryEvent.PURCHASE_INGREDIENT) {
      this.purchasesService.createPurchase({
        request,
        ingredient: missingIngredient!,
      });
    }
  }
}
