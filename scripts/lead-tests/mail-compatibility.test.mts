import assert from "node:assert/strict";
import test from "node:test";
import nodemailer from "nodemailer";
import { buildLeadEmail } from "../../lib/email/lead-template.ts";
import { isValidHttpUrl } from "../../lib/careers/application-validation.ts";

test("updated mail library builds a real multipart message without an SMTP connection", async () => {
  const email = buildLeadEmail({
    id: "compatibility-test", name: "Тестовый ученик", phone: "+79991234567",
    consent_pd: true, consent_marketing: false,
    consent_pd_version: "test", consent_pd_content_hash: "a".repeat(64),
    consent_marketing_version: "test", consent_marketing_content_hash: "b".repeat(64),
    consent_accepted_at: "2026-11-19T00:00:00Z",
  }, { siteUrl: "https://chinachild.ru", recipient: "lead@example.test" });
  const transport = nodemailer.createTransport({ streamTransport: true, buffer: true, newline: "unix" });
  const info = await transport.sendMail({
    from: "ChinaChild <site@example.test>", to: "lead@example.test",
    replyTo: "parent@example.test", subject: "Заявка ChinaChild",
    text: email.text, html: email.html,
    headers: { "X-ChinaChild-Type": "lead" },
    attachments: [{ filename: "resume.txt", content: Buffer.from("local attachment"), contentType: "text/plain" }],
  });
  assert.deepEqual(info.envelope, { from: "site@example.test", to: ["lead@example.test"] });
  const mime = info.message.toString();
  assert.match(mime, /multipart\/mixed/);
  assert.match(mime, /multipart\/alternative/);
  assert.match(mime, /Content-Type: text\/plain; charset=utf-8/);
  assert.match(mime, /Content-Type: text\/html; charset=utf-8/);
  assert.match(mime, /Reply-To: parent@example\.test/);
  assert.match(mime, /X-Chinachild-Type: lead/i);
  assert.match(mime, /filename=resume\.txt/);
  assert.ok(info.messageId);
});

test("resume link validation accepts web URLs and rejects executable URLs", () => {
  assert.equal(isValidHttpUrl("https://example.test/resume.pdf"), true);
  for (const value of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "//example.test/resume", "file:///etc/passwd"]) {
    assert.equal(isValidHttpUrl(value), false, value);
  }
});
