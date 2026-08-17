/**
 * Canonical "Согласие на получение рекламных сообщений" content — single source of
 * truth for the /advertising-consent page and the server-side content hash stored
 * as lead-consent evidence in app/api/contact/route.ts. Same shape as
 * lib/legal/consent-pd.ts, kept as an entirely separate document: this consent is
 * optional and must never be required to submit a lead or receive service
 * communication about an existing application or enrollment.
 */

import type { ConsentSection } from "./consent-pd.ts"

export const CONSENT_MARKETING_VERSION = "2026-08-17.1"

export const CONSENT_MARKETING_PATH = "/advertising-consent"

export const CONSENT_MARKETING_SECTIONS: ConsentSection[] = [
  {
    id: "consent-marketing-1",
    title: "Общие положения",
    paragraphs: [
      "Настоящее согласие на получение рекламных сообщений — отдельный и добровольный документ. Оно не является условием отправки заявки, обработки заявки, проведения пробного занятия или организации обучения и никак не ограничивает права, описанные в Согласии на обработку персональных данных и Политике конфиденциальности.",
      "Согласие даёт пользователь, отмечающий соответствующую необязательную отметку в форме на сайте chinachild.ru, оператору — Индивидуальному предпринимателю Толкачевой Ирине Владимировне, ИНН 323101941586, ОГРНИП 323774600710570, адрес: 108834, г. Москва, ул. Эдварда Грига, д. 18, к. 3, кв. 84.",
    ],
  },
  {
    id: "consent-marketing-2",
    title: "Что понимается под рекламными сообщениями",
    paragraphs: [
      "Рекламные сообщения — это информация о курсах, наборах в группы, скидках, акциях и специальных предложениях школы ChinaChild, направляемая на email и/или номер телефона (включая мессенджеры), указанные пользователем.",
      "Рекламные сообщения не включают сервисные сообщения, необходимые для обработки уже поданной заявки, организации пробного занятия, исполнения договора или сопровождения обучения — такие сообщения направляются независимо от наличия настоящего согласия, на основании Согласия на обработку персональных данных и заключённого договора.",
    ],
  },
  {
    id: "consent-marketing-3",
    title: "Срок действия и отзыв согласия",
    paragraphs: [
      "Согласие действует до момента его отзыва. Отказ от получения рекламных сообщений или отзыв ранее данного согласия можно оформить в любой момент: перейдя по ссылке отписки в рекламном письме, написав на info@chinachild.ru или позвонив по телефону +7 (495) 005-25-82.",
      "Отзыв настоящего согласия не влияет на обработку заявки, оказание образовательных услуг и получение сервисных сообщений, связанных с обучением.",
    ],
  },
]

/** Deterministic plain-text serialization used for the content hash. Never reorder/rename fields. */
export function serializeConsentMarketingContent(): string {
  return JSON.stringify({ version: CONSENT_MARKETING_VERSION, sections: CONSENT_MARKETING_SECTIONS })
}
