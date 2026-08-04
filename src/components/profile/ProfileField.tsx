import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { AlertCircle, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  success?: string | undefined;
  tooltip?: string | undefined;
  adornment?: ReactNode | undefined;
};

export function ProfileField({
  label,
  hint,
  error,
  success,
  tooltip,
  adornment,
  id,
  disabled,
  ...rest
}: Props) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const [focused, setFocused] = useState(false);
  const state = error ? "error" : success ? "success" : "default";

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex items-center gap-1.5">
        <label htmlFor={inputId} className="text-xs font-semibold tracking-wide text-foreground">
          {label}
        </label>
        {tooltip && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`About ${label}`}
                  className="flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">{tooltip}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div
        className={cn(
          "field-shell relative flex h-12 items-center rounded-xl border bg-card px-3.5",
          state === "default" && "border-border hover:border-primary/45",
          state === "default" &&
            focused &&
            "border-primary shadow-[0_0_0_4px_var(--color-accent)] hover:border-primary",
          state === "error" && "border-destructive shadow-[0_0_0_4px_oklch(0.552_0.155_30/0.10)]",
          state === "success" && "border-success shadow-[0_0_0_4px_oklch(0.605_0.058_125/0.12)]",
          disabled && "cursor-not-allowed border-border bg-muted opacity-70 hover:border-border",
        )}
      >
        <input
          id={inputId}
          disabled={disabled}
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
          className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70 disabled:cursor-not-allowed"
        />
        {adornment && <span className="ml-2 shrink-0">{adornment}</span>}
      </div>

      {(error || success || hint) && (
        <p
          id={`${inputId}-msg`}
          className={cn(
            "mt-1.5 flex items-start gap-1.5 px-0.5 text-xs leading-relaxed",
            error ? "text-destructive" : success ? "text-success" : "text-muted-foreground",
          )}
        >
          {error && <AlertCircle className="mt-px size-3.5 shrink-0" />}
          {!error && success && <Check className="mt-px size-3.5 shrink-0" />}
          <span>{error || success || hint}</span>
        </p>
      )}
    </div>
  );
}
