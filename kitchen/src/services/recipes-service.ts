import { Recipe, RECIPES } from "../models/recipe";

export class RecipesService {
  public getRecipes(): Recipe[] {
    // TODO: Allow recipes to scale by setting a database table for them.
    return RECIPES;
  }
}
