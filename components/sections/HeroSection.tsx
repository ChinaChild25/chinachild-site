"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import JsonLd from "@/components/seo/JsonLd";
import { GlobeCharacter, HskCoin, Sparkle, SpeechBubbles } from "@/components/decor/Decor";
import { buttonStyles } from "@/components/ui/button";
import { REGISTER_URL } from "@/lib/site-config";
import { createEducationalOrganizationSchema } from "@/lib/schema";
import { socialProof } from "@/lib/site-data";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="page-shell pt-6 pb-10 sm:pt-10 lg:pb-16">
      <JsonLd data={createEducationalOrganizationSchema()} id="home-edu-org-schema" />

      <div className="card-block card-block-lg card-violet relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute right-[8%] top-[12%]"
          animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkle className="h-10 w-10 opacity-50" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute right-[18%] top-[28%]"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        >
          <Sparkle className="h-6 w-6 opacity-40" />
        </motion.div>
        <motion.div
          className="pointer-events-none absolute left-[6%] bottom-[18%]"
          animate={{ y: [0, -6, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Sparkle className="h-7 w-7 opacity-40" />
        </motion.div>

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.08 } },
            }}
          >
            <motion.span
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
              <span aria-hidden>🌐</span>
              Лицензированная программа HSK 1–2
            </motion.span>

            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-6 text-[2.4rem] font-bold leading-[1.02] tracking-[-0.04em] text-white sm:text-[3.2rem] lg:text-[3.8rem]"
            >
              Китайский язык —<br />
              разговорный уровень за 6 месяцев
            </motion.h1>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-6 max-w-xl text-base leading-7 text-white/85 sm:text-lg"
            >
              Онлайн-школа ChinaChild. Мини-группы до 5 человек, индивидуальные
              занятия и подготовка к HSK. Преподаватели ЮФУ и ДГТУ с опытом 10+ лет.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-8 flex flex-wrap gap-3"
            >
              <Link
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer"
                className={buttonStyles({ size: "large" })}
              >
                Записаться на пробное
              </Link>
              <Link
                href="/kursy"
                className={buttonStyles({ variant: "secondary", size: "large" })}
              >
                Смотреть курсы
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.55 }}
              className="mt-8 flex flex-wrap gap-2 text-sm font-medium"
            >
              <span className="tag-pill">{socialProof.students}</span>
              <span className="tag-pill">{socialProof.rating}</span>
              <span className="tag-pill">{socialProof.since}</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="relative aspect-[5/4] overflow-hidden rounded-[28px] bg-white/12 p-6 backdrop-blur-sm">
              <motion.div
                className="absolute inset-0 grid place-items-center"
                animate={{ rotate: [0, 4, 0, -4, 0] }}
                transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
              >
                <GlobeCharacter className="h-[72%] w-[72%] opacity-95" />
              </motion.div>
              <motion.div
                className="absolute -right-8 -top-8"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <HskCoin className="h-44 w-44 drop-shadow-2xl" />
              </motion.div>
              <motion.div
                className="absolute -bottom-6 -left-6"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <SpeechBubbles className="h-40 w-44 drop-shadow-xl" />
              </motion.div>
            </div>
            <div className="pointer-events-none absolute -right-4 top-1/2 hidden h-20 w-20 rounded-full bg-white/20 sm:block" aria-hidden />
            <div className="pointer-events-none absolute -bottom-6 left-12 hidden h-14 w-14 rounded-full bg-white/15 sm:block" aria-hidden />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
