import { MarketAdapter } from "../../services/interfaces/market-adapter";

export class MarketApiAdapter implements MarketAdapter {
  constructor(private readonly baseUrl: string) {}

  async buy(item: { ingredient: string }): Promise<{ qtySold: number }> {
    // TODO: Implement logic to buy an item from the market API
    console.log("Buying item from market API:", item, this.baseUrl);
    // Simulate a network request to the market API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ qtySold: 1 });
      }, 1000);
    });
  }
}
