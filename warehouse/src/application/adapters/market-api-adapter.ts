import { IngredientName } from "../../models/ingredient";
import { MarketAdapter } from "../../services/interfaces/market-adapter";
import axios from "axios";
export class MarketApiAdapter implements MarketAdapter {
  constructor(private readonly baseUrl: string) {}

  async buy({
    ingredient,
  }: {
    ingredient: IngredientName;
  }): Promise<{ qtySold: number }> {
    // Simulate a network request to the market API
    // return new Promise((resolve) => {
    //   setTimeout(() => {
    //     resolve({ qtySold: Math.floor(Math.random() * 6) });
    //   }, 1000);
    // });

    try {
      const {
        data: { quantitySold },
      } = await axios.get<{ quantitySold: number }>(
        `${this.baseUrl}?ingredient=${ingredient.toLowerCase()}`
      );
      return { qtySold: quantitySold };
    } catch (error) {
      console.error("Error buying item from market API:", error);
      return { qtySold: 0 };
    }
  }
}
