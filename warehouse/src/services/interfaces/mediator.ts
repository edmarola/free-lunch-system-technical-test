import { IngredientName } from "../../models/ingredient";
import { IngredientsRequest } from "./ingredients-request";

export interface Mediator {
  send({
    event,
    data,
  }: {
    event: string;
    data: { request: IngredientsRequest; missingIngredient?: IngredientName };
  }): Promise<void>;
}
