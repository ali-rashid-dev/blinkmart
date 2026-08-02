import { z } from "zod";

const emailSchema = z.string().trim().email("Enter a valid email address");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name"),
  email: emailSchema,
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/\d/, "One number")
    .regex(/[^A-Za-z0-9]/, "One symbol"),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;

export function getLoginFieldErrors(values: LoginValues) {
  const result = loginSchema.safeParse(values);
  return result.success ? {} : result.error.flatten().fieldErrors;
}

export function getSignupFieldErrors(values: SignupValues) {
  const result = signupSchema.safeParse(values);
  return result.success ? {} : result.error.flatten().fieldErrors;
}

export function isValidEmail(value: string) {
  return emailSchema.safeParse(value).success;
}
