"use client";

import Image from "next/image";
import { useState } from "react";
import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import type { PricingTier } from "@/lib/site-data";
import styles from "./PricingFlip.module.css";

/** Молния — бейдж «Самостоятельная практика» на светлых тарифах. */
function LightningIcon() {
  return (
    <svg
      className={styles.badgeIcon}
      viewBox="0 0 28 28"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6.32021 16.3751H13.003L9.54919 25.265C8.9974 26.6649 10.4688 27.4109 11.4191 26.2869L22.2914 13.422C22.5264 13.1461 22.6388 12.8702 22.6388 12.5739C22.6388 12.0119 22.1995 11.6134 21.6272 11.6134H14.9445L18.3983 2.73366C18.9398 1.33375 17.4786 0.587815 16.5283 1.71183L5.6458 14.5767C5.41078 14.8424 5.30859 15.1183 5.30859 15.4248C5.30859 15.9868 5.73776 16.3751 6.32021 16.3751Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Огонёк — бейдж «Востребованный курс» на центральном тарифе. */
function FireIcon() {
  return (
    <svg
      className={styles.badgeIcon}
      viewBox="0 0 18 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M9 24C13.971 24 18 21 18 15.75C18 13.5 17.25 9.75 14.25 6.75C14.625 9 12.375 9.75 12.375 9.75C13.5 6 10.5 0.75 6 0C6.5355 3 6.75 6 3 9C1.125 10.5 0 13.0935 0 15.75C0 21 4.029 24 9 24ZM9 22.5C6.5145 22.5 4.5 21 4.5 18.375C4.5 17.25 4.875 15.375 6.375 13.875C6.1875 15 7.5 15.75 7.5 15.75C6.9375 13.875 8.25 10.875 10.5 10.5C10.2315 12 10.125 13.5 12 15C12.9375 15.75 13.5 17.046 13.5 18.375C13.5 21 11.4855 22.5 9 22.5Z"
        fill="#FF6C26"
      />
    </svg>
  );
}

/** Изогнутая двойная стрелка — подсказка «тапни, карточка перевернётся». */
function FlipArrowIcon() {
  return (
    <svg
      className={styles.flipHintIcon}
      width="34"
      height="23"
      viewBox="0 0 43 29"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M10.0742 22.7402C10.483 22.807 10.8685 22.5297 10.9353 22.1209C11.0021 21.7121 10.7248 21.3266 10.316 21.2598L10.0742 22.7402ZM26.3396 7.76224C26.7089 7.5747 26.8563 7.12327 26.6687 6.75394L23.6126 0.735436C23.425 0.36611 22.9736 0.218744 22.6043 0.406285C22.2349 0.593826 22.0876 1.04525 22.2751 1.41458L24.9917 6.76437L19.6419 9.48094C19.2726 9.66848 19.1252 10.1199 19.3128 10.4892C19.5003 10.8586 19.9517 11.0059 20.3211 10.8184L26.3396 7.76224ZM10.316 21.2598C8.68452 20.9933 6.75626 20.1853 5.24949 18.9779C3.73952 17.7679 2.75 16.2418 2.75 14.5468H1.25C1.25 16.8648 2.60194 18.7785 4.31149 20.1484C6.02423 21.5209 8.19353 22.433 10.0742 22.7402L10.316 21.2598ZM2.75 14.5468C2.75 12.9712 3.54501 11.5906 4.98848 10.4165C6.44171 9.23458 8.50851 8.30427 10.8982 7.67551C15.6846 6.41612 21.5354 6.42504 25.7673 7.80649L26.2327 6.38054C21.6841 4.89567 15.5349 4.90444 10.5165 6.22489C8.00368 6.88605 5.71683 7.89065 4.04201 9.25284C2.35743 10.623 1.25 12.3957 1.25 14.5468H2.75Z"
        fill="currentColor"
      />
      <path
        d="M33.9258 6.25981C33.517 6.19304 33.1315 6.4703 33.0647 6.8791C32.9979 7.2879 33.2752 7.67342 33.684 7.74019L33.9258 6.25981ZM17.6604 21.2378C17.2911 21.4253 17.1437 21.8767 17.3313 22.2461L20.3874 28.2646C20.575 28.6339 21.0264 28.7813 21.3957 28.5937C21.765 28.4062 21.9124 27.9547 21.7249 27.5854L19.0083 22.2356L24.3581 19.5191C24.7274 19.3315 24.8748 18.8801 24.6872 18.5108C24.4997 18.1414 24.0483 17.9941 23.6789 18.1816L17.6604 21.2378ZM33.684 7.74019C35.3155 8.00667 37.2437 8.81469 38.7505 10.0221C40.2605 11.2321 41.25 12.7582 41.25 14.4532L42.75 14.4532C42.75 12.1352 41.3981 10.2215 39.6885 8.8516C37.9758 7.4791 35.8065 6.56699 33.9258 6.25981L33.684 7.74019ZM41.25 14.4532C41.25 16.0288 40.455 17.4094 39.0115 18.5835C37.5583 19.7654 35.4915 20.6957 33.1018 21.3245C28.3154 22.5839 22.4646 22.575 18.2327 21.1935L17.7673 22.6195C22.3159 24.1043 28.4651 24.0956 33.4835 22.7751C35.9963 22.114 38.2832 21.1093 39.958 19.7472C41.6426 18.377 42.75 16.6043 42.75 14.4532L41.25 14.4532Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function PricingFlipCard({ tier }: { tier: PricingTier }) {
  // Тап-разворот для тач-устройств (на десктопе разворот по :hover/:focus в CSS).
  const [flipped, setFlipped] = useState(false);
  const featured = Boolean(tier.featured);

  const badge = (
    <span className={styles.badge}>
      {featured ? <FireIcon /> : <LightningIcon />}
      {tier.badge}
    </span>
  );

  // Цена + подсказка-стрелка о развороте. Сетка 1fr·auto·1fr держит цену по
  // центру, а стрелку — у правого края. Стрелка видна только на тач-устройствах
  // (нет hover) — см. .flipHint в CSS.
  const price = (
    <div className={styles.price}>
      <span aria-hidden="true" />
      <span className={styles.priceValue}>{tier.price}</span>
      <span className={styles.flipHint} aria-hidden="true">
        <FlipArrowIcon />
      </span>
    </div>
  );

  // stopPropagation: клик по кнопке открывает модалку и не переворачивает карточку.
  const cta = (
    <div className={styles.cta} onClick={(event) => event.stopPropagation()}>
      <LeadModal
        triggerClassName={buttonStyles({ variant: "primary", className: "w-full" })}
        source={`pricing-${tier.title}`}
        suppressFloatingCta
      >
        Оставить заявку
      </LeadModal>
    </div>
  );

  return (
    // Разворот — прогрессивное улучшение: контент обеих граней присутствует в DOM
    // и доступен скринридеру независимо от состояния. Десктоп переворачивает по
    // hover/focus (CSS), тач — по тапу. Поэтому клавиатурный обработчик не нужен.
    <div
      className={styles.card}
      data-featured={featured}
      data-flipped={flipped}
      role="group"
      onClick={() => setFlipped((value) => !value)}
    >
      <div className={styles.viewport}>
        <div className={styles.inner}>
          {/* Лицо — иллюстрация и краткое описание */}
          <article className={`${styles.face} ${styles.front}`}>
            {badge}
            <h3 className={styles.title}>{tier.title}</h3>
            <p className={styles.desc}>{tier.description}</p>
            <div className={styles.illoWrap}>
              <Image
                src={tier.image.src}
                alt={tier.image.alt}
                width={tier.image.width}
                height={tier.image.height}
                className={styles.illo}
                sizes="(min-width: 768px) 360px, 90vw"
              />
            </div>
            {price}
            {cta}
          </article>

          {/* Оборот — что входит в тариф */}
          <article className={`${styles.face} ${styles.back}`}>
            {badge}
            <h3 className={styles.title}>{tier.title}</h3>
            <ul className={styles.features}>
              {tier.features.map((feature) => (
                <li key={feature} className={styles.feature}>
                  <span className={styles.bullet} aria-hidden="true" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            {price}
            {cta}
          </article>
        </div>
      </div>
    </div>
  );
}
