import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { IngredientsService } from "../src/services/ingredients-service";
import { Ingredient, IngredientName } from "../src/models/ingredient";
import { Repository } from "../src/services/interfaces/repository";
import { EventHandler } from "../src/services/interfaces/event-handler";
import { Mediator } from "../src/services/interfaces/mediator";
import { IngredientsRequest } from "../src/services/interfaces/ingredients-request";
import { InventoryEvent } from "../src/services/types/inventory-event";

class IngredientsRepositoryMock implements Repository<Ingredient> {
  create(item: Ingredient): Promise<Ingredient> {
    throw new Error("Method not implemented.");
  }
  update(id: string, item: Ingredient): Promise<Ingredient> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Ingredient | null> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
  findAll =
    jest.fn<
      (filter?: Partial<Record<keyof Ingredient, any>>) => Promise<Ingredient[]>
    >();
  findAllByIds = jest.fn<(ids: string[]) => Promise<Ingredient[]>>();
  updateMany = jest.fn<(items: Ingredient[]) => Promise<Ingredient[]>>();
}

class IngredientsEventHandlerMock implements EventHandler {
  send = jest.fn(async ({ queue, data }: { queue: string; data: any }) => {});
  receive = jest.fn(
    async ({
      queue,
      callback,
    }: {
      queue: string;
      callback: (data: any) => void;
    }) => {}
  );
}

class MediatorMock implements Mediator {
  send = jest.fn(
    async ({
      event,
      data,
    }: {
      event: string;
      data: { request: IngredientsRequest; missingIngredient?: IngredientName };
    }) => {}
  );
}

describe("Ingredients Service", () => {
  const ingredientsRepository = new IngredientsRepositoryMock();
  const ingredientsEventHandler = new IngredientsEventHandlerMock();
  const mediator = new MediatorMock();

  const ingredientsService = new IngredientsService({
    ingredientsRepository,
    ingredientsEventHandler,
  });
  ingredientsService.mediator = mediator; // Inject the mediator

  beforeEach(() => {
    jest.clearAllMocks(); // Clear mock call history before each test
  });

  it("should process ingredients successfully when all are available", async () => {
    // Mock repository to return all required ingredients
    ingredientsRepository.findAllByIds.mockResolvedValueOnce([
      { name: "Tomato", stock: 10 },
      { name: "Cheese", stock: 5 },
    ]);

    const request: IngredientsRequest = {
      userId: "user123",
      orderId: "order456",
      dishId: "dish789",
      ingredients: [
        { name: "Tomato", quantity: 2 },
        { name: "Cheese", quantity: 1 },
      ],
    };

    await ingredientsService.checkIngredients(request);

    // Assert that the repository's updateMany method is called once
    expect(ingredientsRepository.updateMany).toHaveBeenCalledTimes(1);
    expect(ingredientsRepository.updateMany).toHaveBeenCalledWith([
      { name: "Tomato", stock: 8 },
      { name: "Cheese", stock: 4 },
    ]);

    // Assert that the event handler's send method is called once
    expect(ingredientsEventHandler.send).toHaveBeenCalledTimes(1);
    expect(ingredientsEventHandler.send).toHaveBeenCalledWith({
      queue: expect.any(String),
      data: request,
    });

    // Assert that the mediator's send method is not called
    expect(mediator.send).not.toHaveBeenCalled();
  });

  it("should request ingredient purchase when some ingredients are missing", async () => {
    // Mock repository to return insufficient stock for one ingredient
    ingredientsRepository.findAllByIds.mockResolvedValueOnce([
      { name: "Tomato", stock: 1 }, // Insufficient stock
      { name: "Cheese", stock: 5 },
    ]);

    const request: IngredientsRequest = {
      userId: "user123",
      orderId: "order456",
      dishId: "dish789",
      ingredients: [
        { name: "Tomato", quantity: 2 },
        { name: "Cheese", quantity: 1 },
      ],
    };

    await ingredientsService.checkIngredients(request);

    // Assert that the mediator's send method is called once
    expect(mediator.send).toHaveBeenCalledTimes(1);
    expect(mediator.send).toHaveBeenCalledWith({
      event: InventoryEvent.PURCHASE_INGREDIENT,
      data: { request, missingIngredient: "Tomato" },
    });

    // Assert that the repository's updateMany method is not called
    expect(ingredientsRepository.updateMany).not.toHaveBeenCalled();

    // Assert that the event handler's send method is not called
    expect(ingredientsEventHandler.send).not.toHaveBeenCalled();
  });
});
