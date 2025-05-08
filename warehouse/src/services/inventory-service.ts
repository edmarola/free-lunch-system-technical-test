import { IngredientName } from "../models/ingredient";
import { IngredientsService } from "./ingredients-service";
import { EventHandler } from "./interfaces/event-handler";
import { IngredientsRequest } from "./interfaces/ingredients-request";
import { Mediator } from "./interfaces/mediator";
import { PurchasesService } from "./purchases-service";
import { InventoryEvent } from "./types/inventory-event";

export class InventoryService implements Mediator {
  constructor(
    private readonly purchasesService: PurchasesService,
    private readonly ingredientsService: IngredientsService,
    private readonly inventoryEventHandler: EventHandler
  ) {
    this.inventoryEventHandler.receive({
      queue:
        "https://sqs.us-east-1.amazonaws.com/181939780845/requestedIngredients.fifo", // TODO: change to env variable
      callback: (payload) => {
        const data = JSON.parse(payload);
        this.ingredientsService.checkIngredients(data as IngredientsRequest);
      },
    });
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
    if (event === InventoryEvent.FULFILL_INGREDIENTS) {
      this.inventoryEventHandler.send({
        queue:
          "https://sqs.us-east-1.amazonaws.com/181939780845/fulfilledIngredients", // TODO: change to env variable
        data: JSON.stringify(request),
      });
    }
  }
}
