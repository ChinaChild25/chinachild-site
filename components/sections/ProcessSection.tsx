import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { processSteps } from "@/lib/site-data";

export default function ProcessSection() {
  return (
    <SectionShell
      id="kak-prokhodit"
      label="Процесс"
      title="Как проходят занятия в ChinaChild"
      description="Онлайн-уроки не заканчиваются на созвоне: маршрут строится вокруг диагностики, живой практики, платформы и измеримого отчёта по прогрессу."
    >
      <div className="grid items-start gap-8 xl:grid-cols-[0.92fr_1.08fr]">
        <Reveal>
          <div className="surface-card overflow-hidden rounded-[30px] bg-[#eef0ff] p-4">
            <Image
              src="/platform-shot.svg"
              alt="Скриншот платформы ChinaChild со словарём, заданиями и трекером прогресса"
              width={760}
              height={640}
              className="h-auto w-full rounded-[24px]"
            />
          </div>
        </Reveal>

        <div className="grid gap-4">
          {processSteps.map((step, index) => (
            <Reveal key={step.title}>
              <article className="surface-card rounded-[26px] p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#1A1A2E] text-lg font-extrabold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold tracking-[-0.03em] text-[#1A1A2E]">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-[#4B5563]">
                      {step.description}
                    </p>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
