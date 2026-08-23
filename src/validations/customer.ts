import { z } from "zod";

export const customerQuerySchema = z.object({
  search: z.string().optional().default(""),
  role: z.enum(["ALL", "USER", "ADMIN"]).optional().default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "BANNED"]).optional().default("ALL"),
  sortBy: z
    .enum(["createdAt", "name", "totalSpent", "ordersCount"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CustomerQueryParams = z.infer<typeof customerQuerySchema>;

export const updateCustomerSchema = z.object({
  id: z.string().min(1, "Customer ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["USER", "ADMIN"]),
  phone: z.string().nullable().optional(),
  houseNo: z.string().nullable().optional(),
  street: z.string().nullable().optional(),
  area: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
});

export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;

export const banCustomerSchema = z.object({
  id: z.string().min(1, "Customer ID is required"),
  banReason: z
    .string()
    .max(500, "Ban reason must be 500 characters or less")
    .optional()
    .default(""),
});

export type BanCustomerInput = z.infer<typeof banCustomerSchema>;

export const unbanCustomerSchema = z.object({
  id: z.string().min(1, "Customer ID is required"),
});

export type UnbanCustomerInput = z.infer<typeof unbanCustomerSchema>;

export function getFieldErrors<T extends Record<string, unknown>>(
  error: z.ZodError<T>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
