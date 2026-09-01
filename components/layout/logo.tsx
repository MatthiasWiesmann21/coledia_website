import { cn } from "@/lib/utils";

function LogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18 12c-6 4-9 10-9 17s3 12 9 15c7 3.5 14 3.5 21 0"
        stroke="#31A354"
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M46 12c6 4 9 10 9 17s-3 12-9 15"
        stroke="#1F78B4"
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M46 52c-6-4-9-10-9-17s3-12 9-15"
        stroke="#008080"
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
      <path
        d="M18 52c6-4 9-10 9-17s-3-12-9-15c-1.5-1-3.5-1.5-5-1.5"
        stroke="#E6550D"
        strokeWidth="7.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

export function Logo({
  className,
  showTagline = false,
  variant = "full",
}: {
  className?: string;
  showTagline?: boolean;
  variant?: "full" | "icon";
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoIcon className="h-9 w-9 shrink-0" />
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight text-navy dark:text-white">
            coledia<span className="text-teal-brand">.com</span>
          </span>
          {showTagline && (
            <span className="mt-1 text-[10px] font-medium tracking-wide text-muted-foreground">
              connecting knowledge. empowering futures.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { LogoIcon };
