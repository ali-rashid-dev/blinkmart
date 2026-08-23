import { z } from "zod";

export const getReportsSchema = z.object({
  range: z
    .preprocess((val) => {
      if (typeof val === "string") {
        const trimmed = val.trim().toLowerCase();
        if (["7d", "30d", "12m"].includes(trimmed)) return trimmed;
      }
      return val;
    }, z.enum(["7d", "30d", "12m"]))
    .default("7d"),
});

export type GetReportsInput = z.infer<typeof getReportsSchema>;
