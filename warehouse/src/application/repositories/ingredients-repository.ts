import { Ingredient } from "../../models/ingredient";
import { Repository } from "../../services/interfaces/repository";

export class IngredientsRepository implements Repository<Ingredient> {
  findAllByIds(ids: string[]): Promise<Ingredient[]> {
    throw new Error("Method not implemented.");
  }
  updateMany(items: Ingredient[]): Promise<Ingredient[]> {
    throw new Error("Method not implemented.");
  }
  create(item: Ingredient): Promise<Ingredient> {
    throw new Error("Method not implemented.");
  }
  update(id: string, item: Ingredient): Promise<Ingredient> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Ingredient | null> {
    throw new Error("Method not implemented.");
  }
  findAll(
    filter?: Partial<Record<keyof Ingredient, any>> | undefined
  ): Promise<Ingredient[]> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
