import { z } from "zod";

const httpsUrlSchema = (message: string) =>
  z.string().trim().url({ protocol: /^https$/i, error: message });

const uploadThingImageUrlSchema = z.string().trim().url({
  protocol: /^https$/i,
  hostname: /^(utfs\.io|[^.]+\.ufs\.sh)$/i,
  error: "Image URL must be a valid HTTPS UploadThing URL",
});

// ──────────────────────────────────────────────────────────
//  Create
// ──────────────────────────────────────────────────────────
export const createAdBannerSchema = z
  .object({
    imageUrl: uploadThingImageUrlSchema.min(1, "Image URL is required"),
    altText: z
      .string()
      .trim()
      .max(200, "Alt text must be at most 200 characters")
      .optional()
      .default("Advertisement"),
    linkUrl: httpsUrlSchema("Link must be a valid URL")
      .or(z.literal(""))
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v ?? null)),
    isEnabled: z.boolean().optional().default(false),
    startDate: z.coerce.date({ error: "Start date is required" }),
    endDate: z.coerce.date({ error: "End date is required" }),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export type CreateAdBannerInput = z.infer<typeof createAdBannerSchema>;

// ──────────────────────────────────────────────────────────
//  Update
// ──────────────────────────────────────────────────────────
export const updateAdBannerSchema = z
  .object({
    id: z.string().min(1, "Banner ID is required"),
    imageUrl: uploadThingImageUrlSchema.optional(),
    altText: z
      .string()
      .trim()
      .max(200, "Alt text must be at most 200 characters")
      .optional(),
    linkUrl: httpsUrlSchema("Link must be a valid URL")
      .or(z.literal(""))
      .nullable()
      .optional()
      .transform((v) => (v === "" ? null : v)),
    isEnabled: z.boolean().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  );

export type UpdateAdBannerInput = z.infer<typeof updateAdBannerSchema>;

// ──────────────────────────────────────────────────────────
//  Toggle
// ──────────────────────────────────────────────────────────
export const toggleAdBannerSchema = z.object({
  id: z.string().min(1, "Banner ID is required"),
  isEnabled: z.boolean({ error: "Enabled status is required" }),
});

export type ToggleAdBannerInput = z.infer<typeof toggleAdBannerSchema>;
