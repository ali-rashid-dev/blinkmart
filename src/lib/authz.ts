import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export type AuthErrorCode = "UNAUTHORIZED" | "FORBIDDEN" | "DATABASE_ERROR";

export type AuthActionResult<T, TCode extends string = string> =
  | { success: true; data: T }
  | {
      success: false;
      error: {
        code: TCode | AuthErrorCode;
        message: string;
        details?: Record<string, string>;
      };
    };

export async function getSession() {
  const requestHeaders = await headers();
  return auth.api.getSession({ headers: requestHeaders });
}

export function isAuthError<T, TCode extends string>(
  result: unknown
): result is AuthActionResult<T, TCode> {
  return (
    typeof result === "object" &&
    result !== null &&
    "success" in result &&
    result.success === false &&
    "error" in result
  );
}

export async function requireAdmin<TCode extends string, TResult extends AuthActionResult<never, TCode>>(
  buildError: (
    code: TCode | AuthErrorCode,
    message: string,
    details?: Record<string, string>
  ) => TResult
): Promise<{ userId: string } | TResult> {
  try {
    const session = await getSession();

    if (!session?.user) {
      return buildError("UNAUTHORIZED", "You must be signed in to perform this action.");
    }

    const dbUser = await (await import("@/lib/prisma")).default.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return buildError("FORBIDDEN", "You do not have permission to perform this action.");
    }

    return { userId: session.user.id };
  } catch (error) {
    console.error("[Authz] Authentication check failed.", error);
    return buildError("DATABASE_ERROR", "Authentication check failed. Please try again.");
  }
}
