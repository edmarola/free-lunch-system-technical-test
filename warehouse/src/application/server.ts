import { RecipesService } from "@/services/recipes-service";
import { OrdersService } from "@/services/orders-service";
import { OrdersRepository } from "@/application/repositories/orders-repository";
import { createServer } from "http";

export const bootstrap = async () => {
  const ordersService = new OrdersService(new OrdersRepository());
  const recipesService = new RecipesService();

  createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    try {
      if (req.method === "GET") {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        if (url.pathname === "/warehouse/purchases") {
          const orders = await ordersService.getOrders();
          res.writeHead(200);
          res.end(JSON.stringify(orders));
        } else if (url.pathname === "/warehouse/ingredients") {
          const recipes = await recipesService.getRecipes();
          res.writeHead(200);
          res.end(JSON.stringify(recipes));
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
  }).listen(3001, () => {
    console.log("Server is running on port 3001");
  });
};
