import { z } from "zod";

export const OrderSchema = z.object({
  dishesQuantity: z
    .number({
      invalid_type_error: "The dishesQuantity field must be a number.",
      required_error: "The dishesQuantity field must be present.",
    })
    .int({ message: "The dishesQuantity field must be an integer." })
    .positive({
      message: "The dishesQuantity field must be a positive number.",
    }),
});

export type OrderSchema = z.infer<typeof OrderSchema>;
