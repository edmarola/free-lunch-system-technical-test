import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  ORDERS_TABLE: z.string(),
  FULFILLED_INGREDIENTS_BROKER_DESTINATION: z
    .string()
    .url()
    .startsWith("https://sqs."),
  REQUESTED_INGREDIENTS_BROKER_DESTINATION: z
    .string()
    .url()
    .startsWith("https://sqs."),
  BROKER_URL: z.string().url(),
});

export const config = envSchema.parse(process.env);
