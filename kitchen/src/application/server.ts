import { RecipesService } from "@/services/recipes-service";
import { OrdersService } from "@/services/orders-service";
import { OrdersRepository } from "@/application/repositories/orders-repository";
import { OrderSchema } from "@/application/schemas/order-schema";
import { createServer } from "http";
import { ZodError } from "zod";
import { Order, OrderStatus } from "@/models/order";
import { OrdersEventHandler } from "./events/orders-event-handler";

export const bootstrap = async () => {
  const ordersService = new OrdersService(
    new OrdersRepository(),
    new OrdersEventHandler()
  );
  const recipesService = new RecipesService();

  createServer(async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Content-Type", "application/json");

    if (req.method === "GET") {
      try {
        const url = new URL(req.url || "", `http://${req.headers.host}`);
        if (url.pathname === "/kitchen/orders") {
          let filter: Partial<Record<keyof Order, any>> = {};
          const status = url.searchParams.get("status");
          if (status) {
            if (
              status !== OrderStatus.PENDING &&
              status !== OrderStatus.COMPLETED
            ) {
              res.writeHead(400);
              res.end(
                JSON.stringify({
                  message:
                    "Invalid status filter. Allowed values are PENDING or COMPLETED.",
                })
              );
            }
            filter.status = status as OrderStatus;
          }
          const orders = await ordersService.getOrders(filter);
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
      } catch (error) {
        console.error(error);
        res.writeHead(500);
        res.end(JSON.stringify({ message: "Internal Server Error" }));
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
              const order = await ordersService.createOrder({ dishesQuantity });
              res.writeHead(201);
              res.end(JSON.stringify({ data: order }));
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
                console.log(error);
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
    // status codes: 200, 201, 204, 400, 404, 405, 415, 500
  }).listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};
