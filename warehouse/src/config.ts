import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  PURCHASES_TABLE: z.string(),
  INGREDIENTS_TABLE: z.string(),
  FULFILLED_INGREDIENTS_QUEUE_URL: z.string().url().startsWith("https://sqs."),
  REQUESTED_INGREDIENTS_QUEUE_URL: z.string().url().startsWith("https://sqs."),
  MARKET_API_URL: z.string().url(),
});

export const config = envSchema.parse(process.env);
