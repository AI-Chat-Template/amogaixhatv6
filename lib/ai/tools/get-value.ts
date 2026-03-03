import { tool } from "ai";
import { z } from "zod";

export const getValue = tool({
  description:
    "Get structured values for numeric, currency, percentage, or other value-type queries. Use this when users ask about populations, prices, statistics, or any numeric values.",
  inputSchema: z.object({
    query: z
      .string()
      .describe("The value query (e.g., 'population of India', 'price of iPhone')"),
    valueType: z
      .enum(["numeric", "currency", "percentage", "temperature", "list"])
      .describe("The type of value being requested"),
    value: z
      .string()
      .describe("The numeric or text value"),
    unit: z
      .string()
      .optional()
      .describe("Optional unit (e.g., 'billion', '%', 'USD')"),
  }),
  needsApproval: false,
  execute: async (input) => {
    return {
      query: input.query,
      valueType: input.valueType,
      value: input.value,
      unit: input.unit,
    };
  },
});
