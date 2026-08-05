import { z } from "zod";

const optionalTrimmedString = (maxLength: number, fieldName: string) =>
  z
    .union([z.string(), z.undefined()])
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : undefined;
    })
    .pipe(z.string().max(maxLength, `${fieldName} must be at most ${maxLength} characters`).optional());

const phoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+92|92|0)3[0-9]{9}$/, "Phone number must be a valid Pakistani mobile number")
  .optional();

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  phone: optionalTrimmedString(20, "Phone number").pipe(phoneSchema),
  houseNo: optionalTrimmedString(50, "House number"),
  street: optionalTrimmedString(150, "Street"),
  area: optionalTrimmedString(100, "Area"),
  city: optionalTrimmedString(100, "City"),
  postalCode: optionalTrimmedString(20, "Postal code"),
});

export type ProfileUpdateInput = z.infer<typeof updateProfileSchema>;

export const profileDataSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  role: z.enum(["USER", "ADMIN"]),
  phone: z.string().nullable(),
  houseNo: z.string().nullable(),
  street: z.string().nullable(),
  area: z.string().nullable(),
  city: z.string().nullable(),
  postalCode: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  memberSince: z.date(),
});

export type ProfileData = z.infer<typeof profileDataSchema>;

export const accountStatusInfoSchema = z.object({
  emailVerified: z.boolean().optional(),
  phone: z.string().nullable().optional(),
  role: z.string().optional(),
  createdAt: z.union([z.date(), z.string()]).optional(),
  updatedAt: z.union([z.date(), z.string()]).optional(),
});

export type AccountStatusInfo = z.infer<typeof accountStatusInfoSchema>;

export function getFieldErrors<TSchema extends z.ZodTypeAny>(schema: TSchema, values: z.input<TSchema>) {
  const result = schema.safeParse(values);

  if (result.success) {
    return {} as Record<string, string>;
  }

  return result.error.issues.reduce<Record<string, string>>((acc, issue) => {
    const field = issue.path[0];

    if (typeof field === "string") {
      acc[field] = issue.message;
    }

    return acc;
  }, {});
}
