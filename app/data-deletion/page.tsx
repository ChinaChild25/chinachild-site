import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { LegalReadingShell } from "@/components/legal/legal-reading-shell";
import {
  LegalTableOfContentsDesktop,
  LegalTableOfContentsMobile,
} from "@/components/legal/legal-table-of-contents";
import { buildMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Удаление персональных данных | ChinaChild",
    description:
      "Инструкция по удалению персональных данных, связанных с сервисами ChinaChild, включая данные из интеграций Meta и WhatsApp.",
    path: "/data-deletion",
  });
}

export default function DataDeletionPage() {
  const sections = [
    "Какие данные можно удалить",
    "Как направить запрос",
    "Что указать в запросе",
    "Как обрабатывается запрос",
    "Контакты",
  ];
  const tocEntries = sections.map((title, index) => ({
    id: `data-deletion-${index + 1}`,
    title,
  }));

  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Удаление персональных данных", path: "/data-deletion" },
        ]}
      />
      <LegalReadingShell
        main={
          <div className="min-w-0">
            <span className="tag-pill">Документ</span>
            <h1 className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1b1b1b] sm:text-[2.6rem]">
              Удаление персональных данных
            </h1>
            <div
              className="prose-article mt-8"
              style={{ zoom: "var(--legal-scale, 1)" } as CSSProperties}
            >
              <p>
                Дата публикации: 23 сентября 2026 г. Текущая версия доступна по
                адресу: <a href={`${SITE_URL}/data-deletion`}>{SITE_URL}/data-deletion</a>.
              </p>

              <LegalTableOfContentsMobile sections={tocEntries} />

              <h2 id="data-deletion-1" className="scroll-mt-24">
                1. Какие данные можно удалить
              </h2>
              <p>
                Пользователь может запросить удаление персональных данных, связанных
                с использованием сервисов {SITE_NAME}, включая данные, полученные через
                интеграции Meta и WhatsApp.
              </p>

              <h2 id="data-deletion-2" className="scroll-mt-24">
                2. Как направить запрос
              </h2>
              <p>
                Для удаления данных отправьте запрос на{" "}
                <a href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Удаление персональных данных")}`}>
                  {CONTACT_EMAIL}
                </a>{" "}
                с темой «Удаление персональных данных».
              </p>

              <h2 id="data-deletion-3" className="scroll-mt-24">
                3. Что указать в запросе
              </h2>
              <p>
                В запросе укажите номер телефона или другой идентификатор, который
                использовался при взаимодействии с {SITE_NAME}. Это необходимо, чтобы
                найти связанные данные и убедиться, что запрос поступил от пользователя
                или его уполномоченного представителя.
              </p>
              <p>
                Не указывайте в письме пароли, платёжные реквизиты или иные сведения,
                которые не требуются для идентификации запроса.
              </p>

              <h2 id="data-deletion-4" className="scroll-mt-24">
                4. Как обрабатывается запрос
              </h2>
              <p>
                После получения запроса мы можем связаться с заявителем, чтобы уточнить
                сведения и подтвердить его право на удаление данных. Такая проверка
                помогает исключить удаление данных по запросу постороннего лица.
              </p>
              <p>
                После проверки запроса связанные с пользователем данные будут удалены
                в сроки, предусмотренные применимым законодательством, за исключением
                данных, которые {SITE_NAME} обязан хранить по закону. Если отдельные
                сведения нельзя удалить сразу, их дальнейшая обработка будет ограничена
                целями обязательного хранения.
              </p>

              <h2 id="data-deletion-5" className="scroll-mt-24">
                5. Контакты
              </h2>
              <p>
                По вопросам обработки персональных данных также можно обратиться по
                адресу электронной почты{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
              </p>
              <p>
                Общие правила обработки и защиты данных описаны в{" "}
                <a href="/privacy-policy">Политике конфиденциальности</a>.
              </p>
            </div>
          </div>
        }
        sidebar={<LegalTableOfContentsDesktop sections={tocEntries} />}
      />
    </main>
  );
}
