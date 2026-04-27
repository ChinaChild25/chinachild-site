export default function Home() {
  return (
    <main style={{ fontFamily: "Arial", padding: "60px" }}>
      <h1 style={{ fontSize: "48px", fontWeight: "700" }}>
        Китайский язык онлайн — ChinaChild
      </h1>

      <p style={{ fontSize: "18px", marginTop: "20px", color: "#555" }}>
        Курсы китайского языка для детей, подростков и взрослых. 
        Подготовка к HSK. Первый урок бесплатно.
      </p>

      <div style={{ marginTop: "30px" }}>
        <a
          href="https://app.chinachild.ru/register"
          style={{
            padding: "12px 18px",
            background: "#FF3D00",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "10px",
            marginRight: "10px",
          }}
        >
          Записаться
        </a>

        <a
          href="#courses"
          style={{
            padding: "12px 18px",
            background: "#eee",
            color: "#000",
            textDecoration: "none",
            borderRadius: "10px",
          }}
        >
          Курсы
        </a>
      </div>

      <section style={{ marginTop: "60px" }}>
        <h2>Для кого обучение</h2>
        <ul>
          <li>Дети 5–10 лет</li>
          <li>Подростки (HSK подготовка)</li>
          <li>Взрослые</li>
          <li>Бизнес китайский</li>
        </ul>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Почему ChinaChild</h2>
        <ul>
          <li>Преподаватели HSK 5–6</li>
          <li>Онлайн занятия 1 на 1 и группы</li>
          <li>Запись всех уроков</li>
          <li>AI практика языка</li>
        </ul>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>Результаты</h2>
        <p>1200+ учеников</p>
        <p>4.9 / 5 рейтинг</p>
      </section>
    </main>
  );
}
