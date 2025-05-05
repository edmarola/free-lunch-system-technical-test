import { RecipesService } from "@/services/recipes-service";
import { OrdersService } from "@/services/orders-service";
import { OrdersRepository } from "@/application/repositories/orders-repository";
import { OrderSchema } from "@/application/schemas/order-schema";
import { createServer } from "http";
import { ZodError } from "zod";

export const bootstrap = async () => {
  const ordersService = new OrdersService(new OrdersRepository());
  const recipesService = new RecipesService();

  createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    try {
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
            if (req.headers["content-type"] === "application/json") {
              try {
                const jsonBody = JSON.parse(body);
                const data = OrderSchema.parse(jsonBody);
                const { dishesQuantity } = data!;
                await ordersService.createOrder({ dishesQuantity });
                res.writeHead(201);
                res.end(JSON.stringify({ message: "Order created" }));
              } catch (error) {
                if (error instanceof SyntaxError) {
                  res.writeHead(400, { "Content-Type": "application/json" });
                  res.end(
                    JSON.stringify({
                      message: "Invalid JSON",
                    })
                  );
                } else if (error instanceof ZodError) {
                  res.writeHead(400);
                  res.end(
                    JSON.stringify({
                      message: "Bad request",
                      description: error.format(),
                    })
                  );
                } else {
                  res.writeHead(500);
                  res.end(JSON.stringify({ message: "Internal Server Error" }));
                }
              }
            } else {
              res.writeHead(415, { "Content-Type": "application/json" });
              res.end(
                JSON.stringify({
                  message: "Unsupported Media Type: Only JSON accepted",
                })
              );
            }
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
    } catch (error) {
      console.error(error);
      res.writeHead(500);
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }

    // status codes: 200, 201, 204, 400, 404, 405, 415, 500
  }).listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};
