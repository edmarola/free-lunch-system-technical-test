export type IngredientName =
  | "Tomato"
  | "Lemon"
  | "Potato"
  | "Rice"
  | "Ketchup"
  | "Lettuce"
  | "Onion"
  | "Cheese"
  | "Meat"
  | "Chicken";

export const IngredientName = {
  Tomato: "Tomato",
  Lemon: "Lemon",
  Potato: "Potato",
  Rice: "Rice",
  Ketchup: "Ketchup",
  Lettuce: "Lettuce",
  Onion: "Onion",
  Cheese: "Cheese",
  Meat: "Meat",
  Chicken: "Chicken",
};

export interface Ingredient {
  name: IngredientName;
  quantity: number;
}
