import { CONSENT_MARKETING_PATH } from "./consent-marketing.ts"
import { CONSENT_PD_PATH } from "./consent-pd.ts"

/**
 * Single source of truth for lead-form consent copy, shared by every lead-capturing
 * form on the site (components/forms/LeadForm.tsx and
 * components/hsk-test/HskTestLeadInline.tsx). Do not fork this text per form — the
 * whole point is one wording, one set of links, one validation message everywhere.
 */

export const PD_CONSENT_REQUIRED_MESSAGE =
  "Подтвердите согласие на обработку персональных данных"

/** Renders inside whatever <label>/<span> wrapper the consuming form already uses. */
export function PdConsentLabelText() {
  return (
    <>
      Я даю{" "}
      <a href={CONSENT_PD_PATH} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        согласие на обработку персональных данных
      </a>{" "}
      для обработки заявки, проведения пробного занятия и организации обучения в ChinaChild.{" "}
      <a href="/privacy-policy" target="_blank" rel="noreferrer" className="underline underline-offset-2">
        Политика обработки персональных данных
      </a>
      .
    </>
  )
}

export function MarketingConsentLabelText() {
  return (
    <>
      Я согласен получать рекламные сообщения о курсах и специальных предложениях ChinaChild.{" "}
      <a href={CONSENT_MARKETING_PATH} target="_blank" rel="noreferrer" className="underline underline-offset-2">
        Условия рекламного согласия
      </a>
      .
    </>
  )
}
