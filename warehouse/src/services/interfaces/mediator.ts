import { IngredientName } from "../../models/ingredient";
import { IngredientsRequest } from "./ingredients-request";

export interface Mediator {
  send({
    sender,
    event,
    data,
  }: {
    sender: any;
    event: string;
    data: { request: IngredientsRequest; missingIngredient?: IngredientName };
  }): Promise<void>;
}
