export default function FAQ() {
  return (
    <section style={{ marginTop: 80 }}>
      <h2 style={{ fontSize: 32, fontWeight: 800 }}>FAQ</h2>

      <div style={{ marginTop: 20 }}>
        <details>
          <summary>Сколько стоит обучение?</summary>
          <p>От 990₽ за занятие в группе.</p>
        </details>

        <details>
          <summary>С какого возраста можно учить китайский?</summary>
          <p>С 5 лет в игровой форме.</p>
        </details>

        <details>
          <summary>Есть ли пробный урок?</summary>
          <p>Да, первый урок бесплатный.</p>
        </details>
      </div>
    </section>
  );
}
