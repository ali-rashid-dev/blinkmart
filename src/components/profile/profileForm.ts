import { z } from "zod";

export const profileFormSchema = z.object({
  fullName: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .union([
      z.string()
        .trim()
        .transform((v) => v.replace(/\s+/g, ""))
        .refine((v) => /^(?:\+92|92|0)3[0-9]{9}$/.test(v), { message: "Enter a valid Pakistani phone number" }),
      z.literal("")
    ])
    .optional()
    .default(""),
  house: z.string().trim().max(50).optional().default(""),
  street: z.string().trim().max(150).optional().default(""),
  area: z.string().trim().max(100).optional().default(""),
  city: z.string().trim().max(100).optional().default(""),
  postal: z.string().trim().max(20).optional().default(""),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

export const initialProfileForm: ProfileForm = {
  fullName: "",
  email: "",
  phone: "",
  house: "",
  street: "",
  area: "",
  city: "",
  postal: "",
};

export function getPhoneError(phone: string) {
  if (!phone) return "";

  const result = profileFormSchema.shape.phone.safeParse(phone);
  return result.success ? "" : result.error.issues[0]?.message ?? "";
}

export function getPostalError(postal: string) {
  const trimmed = postal.trim();

  if (!trimmed) return "";

  return !/^\d{5}$/.test(trimmed) ? "Postal code must be 5 digits" : "";
}

export function getCompletion(form: ProfileForm) {
  const entries: [string, string][] = [
    ["Name added", form.fullName],
    ["Email verified", form.email],
    ["Phone number", form.phone],
    ["Delivery address", form.street && form.area ? "y" : ""],
    ["Postal code", form.postal],
  ];
  const done = entries.filter(([, value]) => value.trim().length > 0).map(([label]) => label);
  const remaining = entries.filter(([, value]) => value.trim().length === 0).map(([label]) => label);

  return { percent: Math.round((done.length / entries.length) * 100), done, remaining };
}

export function getAddressLines(form: ProfileForm) {
  return [
    form.house && `House ${form.house}`,
    form.street,
    form.area,
    [form.city, form.postal].filter(Boolean).join(" "),
  ].filter(Boolean) as string[];
}
