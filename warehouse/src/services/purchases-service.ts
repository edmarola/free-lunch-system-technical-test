import { IngredientName } from "@/models/ingredient";
import { Purchase } from "@/models/purchase";
import { Repository } from "./interfaces/repository";

export class PurchasesService {
  constructor(private readonly purchasesRepository: Repository<Purchase>) {}

  public async getPurchases(): Promise<Purchase[]> {
    return await this.purchasesRepository.findAll();
  }

  private async attemptPurchase(
    ingredientName: IngredientName
  ): Promise<{ qtySold: number }> {
    return { qtySold: 0 }; // Replace 0 with the actual logic to determine qtySold
  }

  public async handlePurchase(
    ingredientName: IngredientName
  ): Promise<Purchase> {
    // if fails retry with exponential backoff (use attemptPurchase)
    // if success then create a purchase order
    // !forget about locking, just make the purchase and then check ingredients again and if another left, purchase again and so on.
    const purchase: Purchase = {
      id: "",
      date: new Date(),
      ingredientName,
      quantity: 0,
    };
    return purchase;
  }

  private async createPurchase(purchase: Purchase): Promise<Purchase> {
    // TODO: this function is called only then the ingredients are not available in the warehouse.
    // TODO: a request is sent to the farmers market API.
    // TODO: this market api is a dependency inyected
    // TODO: a record is created in the database for purchase order. If a retry is needed then
    // TODO: the record is stored with the value ON HOLD, otherwise it is stored with the value COMPLETED
    // TODO: when the retry finally completes, the record is updated with the value COMPLETED
    return await this.purchasesRepository.create(purchase);
  }
}

export const createPurchaseOrder = (ingredients: string[]): void => {};
