import { Purchase } from "@/models/purchase";
import { Repository } from "@/services/interfaces/repository";

export class PurchasesRepository implements Repository<Purchase> {
  create(item: Purchase): Promise<Purchase> {
    throw new Error("Method not implemented.");
  }
  update(id: string, item: Purchase): Promise<Purchase> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Purchase | null> {
    throw new Error("Method not implemented.");
  }
  findAll(
    filter?: Partial<Record<keyof Purchase, any>> | undefined
  ): Promise<Purchase[]> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
