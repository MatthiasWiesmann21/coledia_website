import Image from "next/image";

import { cn } from "@/lib/utils";

function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/coledia-mark.svg"
      alt=""
      width={36}
      height={36}
      className={className}
      aria-hidden="true"
      loading="eager"
      unoptimized
    />
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
      {variant === "icon" && <span className="sr-only">coledia</span>}
      {variant === "full" && (
        <div className="flex min-w-0 flex-col leading-none">
          <span className="text-xl font-bold tracking-tight text-navy dark:text-white">
            coledia
          </span>
          {showTagline && (
            <span className="mt-1 text-[10px] font-medium leading-snug tracking-wide text-muted-foreground">
              connecting knowledge. empowering futures.
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { LogoIcon };
