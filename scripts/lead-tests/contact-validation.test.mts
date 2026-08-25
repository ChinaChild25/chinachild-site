import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPhoneInput,
  normalizeEmail,
  normalizePhone,
} from "../../lib/leads/contact-validation.ts";

test("Russian phones are formatted consistently for common input variants", () => {
  assert.equal(formatPhoneInput("9991234567"), "+7 999 123 45 67");
  assert.equal(formatPhoneInput("8 (999) 123-45-67"), "+7 999 123 45 67");
  assert.equal(formatPhoneInput("+7 (999) 123-45-67"), "+7 999 123 45 67");
  assert.equal(formatPhoneInput("+36 70 789 3622"), "+36707893622");
});

test("phone normalization stores valid numbers in E.164 form and rejects malformed values", () => {
  assert.equal(normalizePhone("9991234567"), "+79991234567");
  assert.equal(normalizePhone("89991234567"), "+79991234567");
  assert.equal(normalizePhone("79991234567"), "+79991234567");
  assert.equal(normalizePhone("+7 999 999-99-99"), null);
  assert.equal(normalizePhone("+7 call-me-now"), null);
});

test("email normalization rejects malformed addresses and canonicalizes the domain", () => {
  assert.equal(normalizeEmail("User@YANDEX.RU"), "User@yandex.ru");
  assert.equal(normalizeEmail("user..name@example.ru"), null);
  assert.equal(normalizeEmail("user@example"), null);
  assert.equal(normalizeEmail("user@@example.ru"), null);
});
