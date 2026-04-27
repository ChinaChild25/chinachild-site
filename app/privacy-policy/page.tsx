import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Политика конфиденциальности | ChinaChild",
    description:
      "Политика конфиденциальности сайта ChinaChild: как обрабатываются заявки, контактные данные и сообщения пользователей.",
    path: "/privacy-policy",
  });
}

export default function PrivacyPolicyPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Политика конфиденциальности", path: "/privacy-policy" },
        ]}
      />
      <section className="page-shell section-space pt-8">
        <div className="max-w-3xl">
          <span className="section-label">Legal</span>
          <h1 className="section-title">Политика конфиденциальности</h1>
          <div className="prose-article mt-8">
            <p>
              Мы используем данные из форм только для связи по заявке,
              согласования пробного урока и сопровождения обучения на платформе
              ChinaChild.
            </p>
            <p>
              Передавая имя, телефон, email и дополнительную информацию о цели
              обучения, пользователь соглашается на обработку этих данных для
              консультации, записи на урок и последующего сервиса.
            </p>
            <p>
              Доступ к персональным данным ограничен сотрудниками и подрядчиками,
              которым эта информация необходима для работы с заявкой и обучением.
            </p>
            <p>
              По запросу пользователя данные могут быть уточнены, удалены или
              переданы в машиночитаемом виде, если это не противоречит
              законодательству РФ.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
