import HeroSection from "@/components/sections/HeroSection";

export const metadata = {
  title: "Китайский язык онлайн — ChinaChild | Курсы для детей и взрослых",
  description:
    "Учите китайский язык онлайн с нуля. Курсы для детей, подростков и взрослых. Подготовка к HSK. Первый урок бесплатно.",
};

export default function Home() {
  return (
    <main>
      <HeroSection />

      {/* SEO BLOCK: сегментация */}
      <section style={{ padding: "60px 20px" }}>
        <h2>Кому подходит обучение</h2>

        <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
          <div>👶 Дети 5–10 лет — игровое обучение</div>
          <div>🧑‍🎓 Подростки — HSK и школа</div>
          <div>🧑 Взрослые — разговорный китайский</div>
          <div>💼 Бизнес — деловой китайский</div>
        </div>
      </section>

      {/* SEO BLOCK: преимущества */}
      <section style={{ padding: "60px 20px", background: "#f7f7f8" }}>
        <h2>Почему ChinaChild</h2>

        <ul style={{ marginTop: "20px" }}>
          <li>Преподаватели HSK 5–6</li>
          <li>Онлайн-уроки 1 на 1 и группы</li>
          <li>Запись всех занятий</li>
          <li>AI-платформа для практики</li>
        </ul>
      </section>

      {/* SEO BLOCK: доверие */}
      <section style={{ padding: "60px 20px" }}>
        <h2>Результаты учеников</h2>
        <p>1200+ учеников уже обучаются китайскому языку</p>
        <p>Средний рейтинг: 4.9 / 5</p>
      </section>
    </main>
  );
}
