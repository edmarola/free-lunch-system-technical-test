import { describe, expect, it, jest, beforeEach } from "@jest/globals";
import { PurchasesService } from "../src/services/purchases-service";
import { IngredientName } from "../src/models/ingredient";
import { Repository } from "../src/services/interfaces/repository";
import { Mediator } from "../src/services/interfaces/mediator";
import { MarketAdapter } from "../src/services/interfaces/market-adapter";
import { Purchase } from "../src/models/purchase";
import { IngredientsRequest } from "../src/services/interfaces/ingredients-request";

class PurchasesRepositoryMock implements Repository<Purchase> {
  updateMany(items: Purchase[]): Promise<Purchase[]> {
    throw new Error("Method not implemented.");
  }
  findAllByIds(ids: string[]): Promise<Purchase[]> {
    throw new Error("Method not implemented.");
  }
  create = jest.fn((item: Purchase) => Promise.resolve(item));
  update = jest.fn((id: string, item: Purchase) => Promise.resolve(item));
  findAll = jest.fn((filter?: Partial<Record<keyof Purchase, any>>) =>
    Promise.resolve([] as Purchase[])
  );
  findById = jest.fn((id: string) => Promise.resolve(null as Purchase | null));
  delete = jest.fn((id: string) => Promise.resolve());
}

class MediatorMock implements Mediator {
  send = jest.fn(
    async ({
      event,
      data,
    }: {
      event: string;
      data: {
        request: IngredientsRequest;
        missingIngredient?: IngredientName;
      };
    }) => {}
  );
}

class MarketAdapterMock implements MarketAdapter {
  buy = jest.fn(async ({ ingredient }: { ingredient: IngredientName }) =>
    Promise.resolve({ qtySold: 0 })
  );
}

describe("Purchases Service", () => {
  const purchasesRepository = new PurchasesRepositoryMock();
  const mediator = new MediatorMock();
  const marketAdapter = new MarketAdapterMock();

  const purchasesService = new PurchasesService({
    purchasesRepository,
    market: marketAdapter,
  });
  purchasesService.mediator = mediator; // Inject the mediator

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock call history before each test
  });

  it("should make a purchase in a single attempt when the market returns enough quantity", async () => {
    // Mock market adapter to return enough quantity in a single call
    marketAdapter.buy.mockResolvedValueOnce({ qtySold: 12 });

    const ingredientName: IngredientName = "Tomato";
    const quantity = 10;
    const request: IngredientsRequest = {
      userId: "testUserId",
      orderId: "testOrderId",
      dishId: "testDishId",
      ingredients: [{ name: ingredientName, quantity }],
    };

    await purchasesService.createPurchase({
      request,
      ingredient: ingredientName,
    });

    // Assert that the market adapter's buy method is called once
    expect(marketAdapter.buy).toHaveBeenCalledTimes(1);
    expect(marketAdapter.buy).toHaveBeenCalledWith({
      ingredient: ingredientName,
    });

    // Assert that the purchases repository's create method is called once
    expect(purchasesRepository.create).toHaveBeenCalledTimes(1);
    expect(purchasesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ingredientName,
        quantity: 12,
      })
    );

    // Assert that the mediator's send method is called once
    expect(mediator.send).toHaveBeenCalledTimes(1);
    expect(mediator.send).toHaveBeenCalledWith({
      event: "CHECK_INGREDIENTS",
      data: { request },
    });
  });

  it("should make a purchase in two attempts when the market sells insufficient quantity initially", async () => {
    // Mock market adapter to return insufficient quantity on the first call
    marketAdapter.buy
      .mockResolvedValueOnce({ qtySold: 0 }) // First attempt
      .mockResolvedValueOnce({ qtySold: 10 }); // Second attempt

    const ingredientName: IngredientName = "Tomato";
    const quantity = 10;
    const request: IngredientsRequest = {
      userId: "testUserId",
      orderId: "testOrderId",
      dishId: "testDishId",
      ingredients: [{ name: ingredientName, quantity }],
    };

    await purchasesService.createPurchase({
      request,
      ingredient: ingredientName,
    });

    // Pause for 10,000 ms
    await new Promise((resolve) => setTimeout(resolve, 10000));

    // Assert that the market adapter's buy method is called twice
    expect(marketAdapter.buy).toHaveBeenCalledTimes(2);
    expect(marketAdapter.buy).toHaveBeenCalledWith({
      ingredient: ingredientName,
    });

    // Assert that the purchases repository's create method is called twice
    expect(purchasesRepository.create).toHaveBeenCalledTimes(1);
    expect(purchasesRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ingredientName,
        quantity: 10,
      })
    );

    // Assert that the mediator's send method is called once
    expect(mediator.send).toHaveBeenCalledTimes(1);
    expect(mediator.send).toHaveBeenCalledWith({
      event: "CHECK_INGREDIENTS",
      data: { request },
    });
  }, 15000);
});
