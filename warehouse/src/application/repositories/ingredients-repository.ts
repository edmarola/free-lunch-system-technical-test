import {
  BatchGetCommand,
  DynamoDBDocumentClient,
  ScanCommand,
  TransactWriteCommand,
  UpdateCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { config } from "../../config";
import { Ingredient } from "../../models/ingredient";
import { Repository } from "../../services/interfaces/repository";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

export class IngredientsRepository implements Repository<Ingredient> {
  private tableName: string = config.INGREDIENTS_TABLE;

  async findAllByIds(names: string[]): Promise<Ingredient[]> {
    const command = new BatchGetCommand({
      RequestItems: {
        [this.tableName]: {
          Keys: names.map((name) => ({ name })),
        },
      },
    });
    const { Responses } = await docClient.send(command);
    return Responses?.[this.tableName] as Ingredient[];
  }
  async updateMany(items: Ingredient[]): Promise<Ingredient[]> {
    const transactItems = items.map((ingredient) => ({
      Update: {
        TableName: this.tableName,
        Key: { name: ingredient.name },
        UpdateExpression: "set stock = :stock",
        ExpressionAttributeValues: {
          ":stock": ingredient.stock,
        },
      },
    }));
    const params = { TransactItems: transactItems };
    const command = new TransactWriteCommand(params);
    await docClient.send(command);
    return items;
  }
  create(item: Ingredient): Promise<Ingredient> {
    throw new Error("Method not implemented.");
  }
  update(id: string, item: Ingredient): Promise<Ingredient> {
    throw new Error("Method not implemented.");
  }
  findById(id: string): Promise<Ingredient | null> {
    throw new Error("Method not implemented.");
  }
  async findAll(
    filter?: Partial<Record<keyof Ingredient, any>> | undefined
  ): Promise<Ingredient[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });
    const { Items } = await docClient.send(command);
    return Items as Ingredient[];
  }
  delete(id: string): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
