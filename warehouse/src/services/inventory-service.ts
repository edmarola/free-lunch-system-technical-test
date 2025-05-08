import { IngredientName } from "../models/ingredient";
import { IngredientsService } from "./ingredients-service";
import { IngredientsRequest } from "./interfaces/ingredients-request";
import { Mediator } from "./interfaces/mediator";
import { PurchasesService } from "./purchases-service";
import { InventoryEvent } from "./types/inventory-event";

export class InventoryService implements Mediator {
  public async send({
    sender,
    event,
    data: { request, missingIngredient },
  }: {
    sender: IngredientsService | PurchasesService;
    event: InventoryEvent;
    data: { request: IngredientsRequest; missingIngredient?: IngredientName };
  }): Promise<void> {
    if (
      event === InventoryEvent.CHECK_INGREDIENTS &&
      sender instanceof IngredientsService
    ) {
      sender.checkIngredients(request);
    }
    if (
      event === InventoryEvent.PURCHASE_INGREDIENT &&
      sender instanceof PurchasesService
    ) {
      sender.createPurchase({
        request,
        ingredient: missingIngredient!,
      });
    }
  }
}
