"use client";

import { useRouter } from "next/navigation";
import { useHskTest } from "@/lib/hsk-test/state";
import { HskTestGoals } from "@/lib/hsk-test/analytics";
import type { HskTestLevel, HskTestMode } from "@/lib/hsk-test/types";

type StartTestButtonProps = {
  level: HskTestLevel;
  mode: HskTestMode;
  className?: string;
  children: React.ReactNode;
};

export default function StartTestButton({
  level,
  mode,
  className,
  children,
}: StartTestButtonProps) {
  const router = useRouter();
  const { start } = useHskTest();

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        start(level, mode);
        HskTestGoals.started(level, mode);
        router.push("/chinese/hsk-test/take");
      }}
    >
      {children}
    </button>
  );
}
