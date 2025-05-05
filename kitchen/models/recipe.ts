import { Ingredient, IngredientName } from "./ingredient";

export interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

const RECIPES: Recipe[] = [
  {
    id: "1",
    name: "Tomato and Cheese Salad",
    ingredients: [
      { name: IngredientName.Tomato, quantity: 2 },
      { name: IngredientName.Cheese, quantity: 1 },
      { name: IngredientName.Lettuce, quantity: 1 },
      { name: IngredientName.Onion, quantity: 1 },
    ],
  },
  {
    id: "2",
    name: "Lemon Chicken",
    ingredients: [
      { name: IngredientName.Chicken, quantity: 1 },
      { name: IngredientName.Lemon, quantity: 1 },
      { name: IngredientName.Onion, quantity: 1 },
      { name: IngredientName.Rice, quantity: 2 },
    ],
  },
  {
    id: "3",
    name: "Potato and Meat Stew",
    ingredients: [
      { name: IngredientName.Potato, quantity: 3 },
      { name: IngredientName.Meat, quantity: 2 },
      { name: IngredientName.Onion, quantity: 1 },
      { name: IngredientName.Tomato, quantity: 1 },
    ],
  },
  {
    id: "4",
    name: "Chicken and Rice Bowl",
    ingredients: [
      { name: IngredientName.Chicken, quantity: 1 },
      { name: IngredientName.Rice, quantity: 2 },
      { name: IngredientName.Lettuce, quantity: 1 },
      { name: IngredientName.Ketchup, quantity: 1 },
    ],
  },
  {
    id: "5",
    name: "Cheesy Meat Sandwich",
    ingredients: [
      { name: IngredientName.Meat, quantity: 1 },
      { name: IngredientName.Cheese, quantity: 1 },
      { name: IngredientName.Lettuce, quantity: 1 },
      { name: IngredientName.Tomato, quantity: 1 },
    ],
  },
  {
    id: "6",
    name: "Lemon Potato Salad",
    ingredients: [
      { name: IngredientName.Potato, quantity: 2 },
      { name: IngredientName.Lemon, quantity: 1 },
      { name: IngredientName.Onion, quantity: 1 },
      { name: IngredientName.Ketchup, quantity: 1 },
    ],
  },
];

export { RECIPES };
