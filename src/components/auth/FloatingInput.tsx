import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  icon: ReactNode;
  error?: string;
  success?: string;
  hint?: string;
  revealable?: boolean;
};

export function FloatingInput({
  label,
  icon,
  error,
  success,
  hint,
  revealable,
  id,
  type = "text",
  value,
  ...rest
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const filled = typeof value === "string" ? value.length > 0 : false;
  const lifted = focused || filled;
  const state = error ? "error" : success ? "success" : "default";

  return (
    <div>
      <div
        className={cn(
          "field-shell relative rounded-xl border bg-card px-11 pb-2 pt-6",
          state === "default" && "border-border",
          state === "default" && focused && "border-primary shadow-[0_0_0_4px_var(--color-accent)]",
          state === "error" && "border-destructive shadow-[0_0_0_4px_oklch(0.552_0.155_30/0.10)]",
          state === "success" && "border-success shadow-[0_0_0_4px_oklch(0.605_0.058_125/0.12)]",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 [&_svg]:size-[18px]",
            focused ? "text-primary" : "text-muted-foreground",
            state === "error" && "text-destructive",
          )}
        >
          {icon}
        </span>

        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute left-11 origin-left text-muted-foreground transition-all duration-200 ease-out",
            lifted ? "top-1.5 text-[11px] tracking-wide" : "top-1/2 -translate-y-1/2 text-sm",
            focused && "text-primary",
            state === "error" && lifted && "text-destructive",
          )}
        >
          {label}
        </label>

        <input
          id={inputId}
          value={value}
          type={revealable && revealed ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error || success || hint ? `${inputId}-msg` : undefined}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
          className={cn(
            "w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-transparent",
            revealable && "pr-9",
          )}
        />

        {revealable && (
          <button
            type="button"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {revealed ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
          </button>
        )}
      </div>

      {(error || success || hint) && (
        <p
          id={`${inputId}-msg`}
          className={cn(
            "mt-1.5 flex items-center gap-1.5 px-1 text-xs",
            error ? "text-destructive" : success ? "text-success" : "text-muted-foreground",
          )}
        >
          {error && <AlertCircle className="size-3.5 shrink-0" />}
          {!error && success && <Check className="size-3.5 shrink-0" />}
          {error || success || hint}
        </p>
      )}
    </div>
  );
}
