import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPhoneInput,
  normalizeEmail,
  normalizePhone,
} from "../../lib/leads/contact-validation.ts";

test("российские номера принимаются во всех привычных вариантах ввода", () => {
  assert.equal(normalizePhone("9991234567"), "+79991234567");
  assert.equal(normalizePhone("89991234567"), "+79991234567");
  assert.equal(normalizePhone("79991234567"), "+79991234567");
  assert.equal(normalizePhone("+7 (999) 123-45-67"), "+79991234567");
  assert.equal(normalizePhone("8 999 123 45 67"), "+79991234567");
  assert.equal(normalizePhone("+7 495 123 45 67"), "+74951234567");
  assert.equal(normalizePhone("+7 812 123 45 67"), "+78121234567");
});

test("Казахстан и остальное СНГ не отсекаются", () => {
  // Регрессия 25.08.2026: RU-регэксп /^7[3489]\d{9}$/ отклонял весь Казахстан.
  assert.equal(normalizePhone("+7 701 234 56 78"), "+77012345678");
  assert.equal(normalizePhone("+7 727 123 45 67"), "+77271234567");
  assert.equal(normalizePhone("+7 612 345 67 89"), "+76123456789");
  assert.equal(normalizePhone("+375 29 123 45 67"), "+375291234567");
  assert.equal(normalizePhone("+380 67 123 45 67"), "+380671234567");
  assert.equal(normalizePhone("+998 90 123 45 67"), "+998901234567");
  assert.equal(normalizePhone("+996 555 123 456"), "+996555123456");
  assert.equal(normalizePhone("+374 91 123 456"), "+37491123456");
});

test("международный номер без плюса не превращается в фальшивый +7", () => {
  // Регрессия 25.08.2026: `375291234567` форматировался в `+7 375 291 23 45`
  // и уходил в базу как валидный российский номер.
  assert.equal(normalizePhone("375291234567"), "+375291234567");
  assert.equal(formatPhoneInput("375291234567"), "+375291234567");
  assert.notEqual(formatPhoneInput("375291234567"), "+7 375 291 23 45");
});

test("международные номера с плюсом проходят", () => {
  assert.equal(normalizePhone("+1 202 555 0143"), "+12025550143");
  assert.equal(normalizePhone("+36 70 789 3622"), "+36707893622");
  assert.equal(normalizePhone("+49 151 12345678"), "+4915112345678");
});

test("мусор и фродовые номера отсекаются", () => {
  assert.equal(normalizePhone("+7 999 999-99-99"), null);
  assert.equal(normalizePhone("0000000000"), null);
  assert.equal(normalizePhone("1111111111"), null);
  assert.equal(normalizePhone("1234567890"), null);
  assert.equal(normalizePhone("+7 call-me-now"), null);
  assert.equal(normalizePhone("12345678901234567890"), null);
  assert.equal(normalizePhone("123"), null);
  assert.equal(normalizePhone(""), null);
  assert.equal(normalizePhone("   "), null);
  // служебные префиксы внутри +7
  assert.equal(normalizePhone("+7 199 123 45 67"), null);
  assert.equal(normalizePhone("+7 099 123 45 67"), null);
});

test("форматирование не портит то, что набрал пользователь", () => {
  assert.equal(formatPhoneInput("9991234567"), "+7 999 123 45 67");
  assert.equal(formatPhoneInput("8 (999) 123-45-67"), "+7 999 123 45 67");
  assert.equal(formatPhoneInput("+7 (999) 123-45-67"), "+7 999 123 45 67");
  assert.equal(formatPhoneInput("+36 70 789 3622"), "+36707893622");
  // нераспознанный ввод возвращается как есть, а не переписывается
  assert.equal(formatPhoneInput("не помню"), "не помню");
  assert.equal(formatPhoneInput("+7 999"), "+7 999");
  assert.equal(formatPhoneInput(""), "");
});

test("частичный ввод не ломается на полпути", () => {
  // пользователь набирает по одному символу — ни один шаг не должен бросать
  const target = "+7 999 123 45 67";
  for (let i = 1; i <= target.length; i += 1) {
    assert.doesNotThrow(() => formatPhoneInput(target.slice(0, i)));
    assert.doesNotThrow(() => normalizePhone(target.slice(0, i)));
  }
});

test("email нормализуется и проверяется", () => {
  assert.equal(normalizeEmail("User@YANDEX.RU"), "User@yandex.ru");
  assert.equal(normalizeEmail("  user@mail.ru  "), "user@mail.ru");
  assert.equal(normalizeEmail("имя@почта.рф"), "имя@почта.рф");
  assert.equal(normalizeEmail("user..name@example.ru"), null);
  assert.equal(normalizeEmail("user@example"), null);
  assert.equal(normalizeEmail("user@@example.ru"), null);
  assert.equal(normalizeEmail(""), null);
});
