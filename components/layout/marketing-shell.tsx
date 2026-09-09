import type { ReactNode } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return <><Header /><main>{children}</main><Footer /></>;
}
