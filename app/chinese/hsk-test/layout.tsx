import type { ReactNode } from "react";
import { HskTestProvider } from "@/lib/hsk-test/state";

export default function HskTestLayout({ children }: { children: ReactNode }) {
  return <HskTestProvider>{children}</HskTestProvider>;
}
