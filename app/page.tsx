import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 20px" }}>
      
      {/* HERO */}
      <section style={{ paddingBottom: 80 }}>
        <h1 style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>
          Китайский язык онлайн <br />
          для детей и взрослых
        </h1>

        <p style={{ fontSize: 18, color: "#666", marginTop: 20 }}>
          Учите китайский с нуля до HSK с преподавателями уровня HSK5–6.
          <br />
          Онлайн-уроки, AI-практика и персональный трек обучения.
        </p>

        <div style={{ marginTop: 30, display: "flex", gap: 12 }}>
          <a
            href="https://app.chinachild.ru/register"
            style={{
              background: "#FF3D00",
              color: "#fff",
              padding: "14px 20px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Записаться <ArrowRight size={16} />
          </a>

          <a
            href="#courses"
            style={{
              background: "#f3f3f3",
              color: "#111",
              padding: "14px 20px",
              borderRadius: 14,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Смотреть курсы
          </a>
        </div>
      </section>

      {/* CARDS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16 }}>
        {[
          ["👶 Дети", "Игровое обучение китайскому"],
          ["🧑 Подростки", "HSK и школьная программа"],
          ["🧑‍💼 Взрослые", "Разговорный китайский"],
          ["💼 Бизнес", "Деловой китайский язык"],
        ].map(([title, desc]) => (
          <div
            key={title}
            style={{
              padding: 24,
              borderRadius: 20,
              background: "#f7f7f8",
              transition: "0.2s",
              cursor: "pointer",
            }}
          >
            <h3 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h3>
            <p style={{ color: "#666", marginTop: 8 }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* BENEFITS */}
      <section style={{ marginTop: 80 }}>
        <h2 style={{ fontSize: 32, fontWeight: 800 }}>
          Почему ChinaChild
        </h2>

        <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
          <div>✔ Преподаватели HSK 5–6</div>
          <div>✔ Онлайн 1-на-1 и группы</div>
          <div>✔ Запись всех уроков</div>
          <div>✔ AI-тренажёр языка</div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section style={{ marginTop: 80 }}>
        <div style={{ fontSize: 24, fontWeight: 700 }}>
          1200+ учеников уже учатся
        </div>
        <div style={{ color: "#666", marginTop: 8 }}>
          Средняя оценка: 4.9 / 5
        </div>
      </section>

    </main>
  );
}
