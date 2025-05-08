import { createServer } from "http";
import { InventoryService } from "../services/inventory-service";
import { PurchasesService } from "../services/purchases-service";
import { IngredientsEventHandler } from "./events/ingredients-event-handler";
import { IngredientsService } from "../services/ingredients-service";
import { IngredientsRepository } from "./repositories/ingredients-repository";
import { MarketApiAdapter } from "./adapters/market-api-adapter";
import { PurchasesRepository } from "./repositories/purchases-repository";
import { config } from "../config";

export const bootstrap = async () => {
  const inventoryService = new InventoryService();
  const purchasesService = new PurchasesService({
    mediator: inventoryService,
    market: new MarketApiAdapter(config.MARKET_API_URL),
    purchasesRepository: new PurchasesRepository(),
  });
  const ingredientsService = new IngredientsService({
    mediator: inventoryService,
    ingredientsRepository: new IngredientsRepository(),
    ingredientsEventHandler: new IngredientsEventHandler(),
  });

  createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    try {
      if (req.method === "GET") {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        if (url.pathname === "/warehouse/purchases") {
          const purchases = await purchasesService.getPurchases();
          res.writeHead(200);
          res.end(JSON.stringify(purchases));
        } else if (url.pathname === "/warehouse/ingredients") {
          const ingredients = await ingredientsService.getIngredients;
          res.writeHead(200);
          res.end(JSON.stringify(ingredients));
        } else {
          res.writeHead(404);
          res.end(JSON.stringify({ message: "Not Found" }));
        }
      } else if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
      } else {
        res.writeHead(405);
        res.end(JSON.stringify({ message: "Method Not Allowed" }));
      }
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }

    // status codes: 200, 201, 204, 400, 404, 405, 500
  }).listen(config.PORT, () => {
    console.log("Server is running on port " + config.PORT);
  });
};
