import { USER_ID } from "@/constants";
import { Order } from "@/models/order";
import { Repository } from "@/services/interfaces/repository";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
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
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: {
        ":userId": USER_ID,
      },
      ScanIndexForward: false,
    });
    const { Items } = await docClient.send(command);
    return Items as Order[];
  }

  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
