import { randomUUID } from "crypto";
import { IngredientName } from "../models/ingredient";
import { Purchase } from "../models/purchase";
import { MarketProvider } from "./interfaces/market-provider";
import { Mediator } from "./interfaces/mediator";
import { Repository } from "./interfaces/repository";
import { InventoryEvent } from "./types/inventory-event";
import { IngredientsRequest } from "./interfaces/ingredients-request";

export class PurchasesService {
  constructor(
    private readonly purchasesRepository: Repository<Purchase>,
    private readonly mediator: Mediator,
    private readonly marketProvider: MarketProvider
  ) {}

  public async getPurchases(): Promise<Purchase[]> {
    return await this.purchasesRepository.findAll();
  }

  public async createPurchase({
    request,
    ingredient,
  }: {
    request: IngredientsRequest;
    ingredient: IngredientName;
  }): Promise<void> {
    try {
      let attempts = 0;
      const attemptPurchase = async () => {
        attempts++;
        try {
          const { qtySold } = await this.marketProvider.buy({ ingredient });
          if (qtySold <= 0) {
            setTimeout(attemptPurchase, attempts * 10000);
          } else {
            try {
              await this.purchasesRepository.create({
                purchaseId: randomUUID(),
                createdAt: Date.now(),
                ingredientName: ingredient,
                quantity: qtySold,
              });
              this.mediator.send({
                event: InventoryEvent.CHECK_INGREDIENTS,
                data: { request },
              });
            } catch (error) {
              console.error("Error storing purchase", error);
            }
          }
        } catch (error) {
          console.error("Error attempting purchase", error);
        }
      };
      attemptPurchase();
    } catch (error) {
      console.error("Error creating purchase", error);
    }
  }
}
