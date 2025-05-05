import { Recipe, RECIPES } from "../models/recipe";

export class RecipesService {
  public listRecipes(): Recipe[] {
    // TODO: Allow recipes to scale by setting a database table for them.
    return RECIPES;
  }
}
