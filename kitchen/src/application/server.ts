import { RecipesService } from "@/services/recipes-service";
import { OrdersService } from "@/services/orders-service";
import { OrdersRepository } from "@/application/repositories/orders-repository";
import { createServer } from "http";

export const bootstrap = async () => {
  const ordersService = new OrdersService(new OrdersRepository());
  const recipesService = new RecipesService();

  createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET") {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      if (url.pathname === "/kitchen/orders") {
        const orders = await ordersService.getOrders();
        res.writeHead(200);
        res.end(JSON.stringify(orders));
      } else if (url.pathname === "/kitchen/recipes") {
        const recipes = await recipesService.getRecipes();
        res.writeHead(200);
        res.end(JSON.stringify(recipes));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "Not Found" }));
      }
    } else if (req.method === "POST") {
      if (req.url === "/kitchen/orders") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", async () => {
          const order = JSON.parse(body);
          await ordersService.createOrder(order); // ! FIX PARAMETER
          res.writeHead(201);
          res.end(JSON.stringify({ message: "Order created" }));
        });
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

    // status codes: 200, 201, 204, 400, 404, 405
  }).listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};
