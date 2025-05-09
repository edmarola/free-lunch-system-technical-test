import { config } from "@/config";
import { USER_ID } from "@/constants";
import { Order, OrderStatus } from "@/models/order";
import { Repository } from "@/services/interfaces/repository";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandInput,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export class OrdersRepository implements Repository<Order> {
  private tableName: string = config.ORDERS_TABLE;

  async create({ item: order }: { item: Order }): Promise<Order> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: order,
    });
    await docClient.send(command);
    return order;
  }
  async update({
    id,
    userId,
    item: order,
  }: {
    id: string;
    userId: string;
    item: Order;
  }): Promise<Order> {
    const params: UpdateCommandInput = {
      TableName: this.tableName,
      Key: {
        userId,
        orderId: id,
      },
      UpdateExpression:
        "set #status = :status, dishes = :dishes, dishesCompleted = :dishesCompleted",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": order.status,
        ":dishes": order.dishes,
        ":dishesCompleted": order.dishesCompleted,
      },
      ReturnValues: "ALL_NEW",
    };
    const command = new UpdateCommand(params);
    try {
      await docClient.send(command);
      return order;
    } catch (error) {
      console.error("Error from DynamoDB (UpdateCommand):", error);
      throw new Error("Failed to update order");
    }
  }

  async findById({
    id: orderId,
    userId,
  }: {
    id: string;
    userId: string;
  }): Promise<Order | null> {
    const params: GetCommandInput = {
      TableName: this.tableName,
      Key: {
        userId,
        orderId,
      },
    };

    const command = new GetCommand(params);
    const { Item } = await docClient.send(command);
    return Item as Order;
  }

  async findAll(
    filter?: Partial<Record<keyof Order, any>> | undefined
  ): Promise<Order[]> {
    const params: QueryCommandInput = {
      TableName: this.tableName,
      IndexName: "userId-createdAt-index",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":userId": USER_ID,
      },
      ScanIndexForward: false,
    };

    if (filter?.status) {
      params["FilterExpression"] = "#status = :status";
      params.ExpressionAttributeValues![":status"] = filter.status;
    } else {
      params["FilterExpression"] = "#status IN (:pending, :completed)";
      params.ExpressionAttributeValues![":pending"] = OrderStatus.PENDING;
      params.ExpressionAttributeValues![":completed"] = OrderStatus.COMPLETED;
    }

    const command = new QueryCommand(params);
    const { Items } = await docClient.send(command);
    return Items as Order[];
  }

  delete({ id, userId }: { id: string; userId: string }): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
