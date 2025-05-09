import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { config } from "../../config";
import { Purchase } from "../../models/purchase";
import { Repository } from "../../services/interfaces/repository";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);
export class PurchasesRepository implements Repository<Purchase> {
  private tableName = config.PURCHASES_TABLE;

  async findAll(
    filter?: Partial<Record<keyof Purchase, any>> | undefined
  ): Promise<Purchase[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });
    const { Items } = await docClient.send(command);
    return Items as Purchase[];
  }

  async create(item: Purchase): Promise<Purchase> {
    // * SRP violation in benefit of atomicity.
    const command = new TransactWriteCommand({
      TransactItems: [
        {
          Put: {
            TableName: this.tableName,
            Item: item,
          },
        },
        {
          Update: {
            TableName: config.INGREDIENTS_TABLE,
            Key: { name: item.ingredientName },
            UpdateExpression: "SET stock = stock + :quantity",
            ExpressionAttributeValues: {
              ":quantity": item.quantity,
            },
          },
        },
      ],
    });

    await docClient.send(command);
    return item;
  }

  updateMany(items: Purchase[]): Promise<Purchase[]> {
    throw new Error("Method not implemented.");
  }
  findAllByIds(ids: string[]): Promise<Purchase[]> {
    throw new Error("Method not implemented.");
  }
  update(id: string, item: Purchase): Promise<Purchase> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Purchase | null> {
    throw new Error("Method not implemented.");
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
