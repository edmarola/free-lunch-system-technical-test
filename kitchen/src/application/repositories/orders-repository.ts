import { USER_ID } from "@/constants";
import { Order, OrderStatus } from "@/models/order";
import { Repository } from "@/services/interfaces/repository";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  QueryCommandInput,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export class OrdersRepository implements Repository<Order> {
  private tableName = "orders";

  async create(order: Order): Promise<Order> {
    const command = new PutCommand({
      TableName: this.tableName,
      Item: order,
    });

    const response = await docClient.send(command);
    console.log("Response from DynamoDB:", response);
    return order;
  }
  update(id: string, item: Order): Promise<Order> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Order | null> {
    throw new Error("Method not implemented.");
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

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
