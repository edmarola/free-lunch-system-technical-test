import { randomUUID } from "crypto";
import { IngredientName } from "../models/ingredient";
import { Purchase } from "../models/purchase";
import { MarketAdapter } from "./interfaces/market-adapter";
import { Mediator } from "./interfaces/mediator";
import { Repository } from "./interfaces/repository";
import { InventoryEvent } from "./types/inventory-event";
import { IngredientsRequest } from "./interfaces/ingredients-request";

export class PurchasesService {
  private readonly purchasesRepository: Repository<Purchase>;
  private readonly market: MarketAdapter;
  public mediator!: Mediator;

  constructor({
    purchasesRepository,
    market,
  }: {
    purchasesRepository: Repository<Purchase>;
    market: MarketAdapter;
  }) {
    this.purchasesRepository = purchasesRepository;
    this.market = market;
  }

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
    console.log("Creating purchase for ingredient:", ingredient);
    try {
      let attempts = 0;
      const attemptPurchase = async () => {
        attempts++;
        console.log(
          "Attempting to purchase ingredient:",
          ingredient,
          "attempt:",
          attempts
        );
        try {
          const { qtySold } = await this.market.buy({ ingredient });
          console.log(
            "Purchased ingredient:",
            ingredient,
            "purchased quantity:",
            qtySold
          );
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
