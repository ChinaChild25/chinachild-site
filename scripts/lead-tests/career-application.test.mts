import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import {
  CAREER_CONSENT_PATH,
  CAREER_CONSENT_VERSION,
} from "../../lib/legal/career-consent.ts";
import {
  isValidCandidateName,
  isValidEmail,
  normalizeRussianPhone,
} from "../../lib/careers/application-validation.ts";

const ROOT = process.cwd();

test("career contact validation rejects malformed submissions", () => {
  assert.equal(isValidCandidateName("Анна-Мария"), true);
  assert.equal(isValidCandidateName("12345"), false);
  assert.equal(normalizeRussianPhone("+7 (999) 123-45-67"), "+79991234567");
  assert.equal(normalizeRussianPhone("8 495 123-45-67"), "+74951234567");
  assert.equal(normalizeRussianPhone("1234567890"), null);
  assert.equal(normalizeRussianPhone("+7 999 999-99-99"), null);
  assert.equal(isValidEmail("candidate@gmail.com"), true);
  assert.equal(isValidEmail("candidate@yandex.ru"), true);
  assert.equal(isValidEmail("candidate@company.travel"), true);
  assert.equal(isValidEmail("candidate@mail"), false);
  assert.equal(isValidEmail("candidate@@mail.ru"), false);
  assert.equal(isValidEmail("candidate..name@mail.ru"), false);
});

test("career applications use an isolated email-only flow", async () => {
  const route = await readFile(
    path.join(ROOT, "app/api/careers/apply/route.ts"),
    "utf8",
  );

  assert.match(route, /CAREER_EMAIL_TO/);
  assert.match(route, /chinachild@yandex.ru/);
  assert.match(route, /await sendEmail/);
  assert.doesNotMatch(route, /storeLead|dispatchLead|from(["']leads["'])|supabase/i);
});

test("candidate consent and attachment checks happen before email delivery", async () => {
  const route = await readFile(
    path.join(ROOT, "app/api/careers/apply/route.ts"),
    "utf8",
  );
  const consentCheck = route.indexOf('form.get("consent_pd")');
  const attachmentCheck = route.indexOf("readAttachments(files)");
  const sendCall = route.indexOf("await sendEmail");

  assert.ok(consentCheck >= 0 && consentCheck < sendCall);
  assert.ok(attachmentCheck >= 0 && attachmentCheck < sendCall);
  assert.match(route, /MAX_FILES = 4/);
  assert.match(route, /MAX_FILES_BYTES = 3_000_000/);
  assert.match(route, /CAREER_CONSENT_VERSION/);
});

test("mail can be filtered in Yandex and includes salary expectations", async () => {
  const template = await readFile(
    path.join(ROOT, "lib/email/career-template.ts"),
    "utf8",
  );

  assert.match(template, /subject: `\[КАНДИДАТ\]/);
  assert.match(template, /Пожелания по оплате/);
  assert.match(template, /salaryExpectations/);
});

test("career form keeps candidate consent explicit and matches the application reference", async () => {
  const form = await readFile(
    path.join(ROOT, "components/careers/CareerApplicationForm.tsx"),
    "utf8",
  );
  const consentPage = await readFile(
    path.join(ROOT, "app/consent-career-personal-data/page.tsx"),
    "utf8",
  );

  assert.equal(CAREER_CONSENT_PATH, "/consent-career-personal-data");
  assert.ok(CAREER_CONSENT_VERSION.length > 0);
  assert.match(form, /name="consent_pd"/);
  assert.match(form, /required/);
  assert.match(form, /useState\(false\)/);
  assert.match(form, /checked=\{consentPd\}/);
  assert.doesNotMatch(form, /defaultChecked/);
  assert.match(form, /name="first_name"/);
  assert.match(form, /name="last_name"/);
  assert.match(form, /formData\.delete\("avatar"\)/);
  assert.match(form, /name="comment"/);
  assert.match(form, /Сопроводительное письмо/);
  assert.match(form, /Сохранить данные/);
  assert.match(consentPage, /откликам на вакансии/);
});
