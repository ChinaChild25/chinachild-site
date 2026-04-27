import Image from "next/image";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto px-6">

      {/* HERO */}
      <section className="py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-sm text-gray-500 mb-3">ChinaChild • онлайн-школа</div>

          <h1 className="text-5xl font-extrabold leading-tight">
            Китайский язык <span className="text-orange-500">онлайн</span> для детей и взрослых
          </h1>

          <p className="mt-5 text-gray-600 text-lg">
            Учите китайский с преподавателями HSK 5–6.
            Первый результат уже через 2 недели занятий.
          </p>

          <div className="flex gap-3 mt-8">
            <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition">
              Записаться на урок
            </button>

            <button className="bg-gray-100 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition">
              Программы
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            ⭐ 4.9 • 1200+ учеников • с 2020 года
          </div>
        </div>

        <div className="relative">
          <Image
            src="https://images.unsplash.com/photo-1584697964154-7c5c1a1b0f1f"
            width={600}
            height={400}
            alt="Chinese learning"
            className="rounded-3xl shadow-xl"
          />
        </div>
      </section>

      {/* BENEFITS */}
      <section className="py-16 grid md:grid-cols-3 gap-6">
        {[
          ["👶", "Дети 5–10 лет", "Игровое обучение китайскому языку"],
          ["🎓", "Подростки", "Подготовка к HSK и школе"],
          ["💼", "Взрослые", "Разговорный китайский для жизни и работы"]
        ].map((b) => (
          <div key={b[1]} className="p-6 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition border">
            <div className="text-3xl">{b[0]}</div>
            <div className="font-bold mt-3">{b[1]}</div>
            <div className="text-gray-500 mt-2">{b[2]}</div>
          </div>
        ))}
      </section>

      {/* WHY US */}
      <section className="py-20">
        <h2 className="text-3xl font-bold mb-10">Почему ChinaChild</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border hover:shadow-md transition">
            <div className="text-xl font-bold">🔥 Преподаватели HSK 5–6</div>
            <p className="text-gray-500 mt-2">Опыт 5+ лет, международная сертификация</p>
          </div>

          <div className="p-6 rounded-2xl border hover:shadow-md transition">
            <div className="text-xl font-bold">📈 AI-платформа</div>
            <p className="text-gray-500 mt-2">Тренировка произношения и словарного запаса</p>
          </div>

          <div className="p-6 rounded-2xl border hover:shadow-md transition">
            <div className="text-xl font-bold">🎥 Запись уроков</div>
            <p className="text-gray-500 mt-2">Можно пересматривать занятия в любое время</p>
          </div>

          <div className="p-6 rounded-2xl border hover:shadow-md transition">
            <div className="text-xl font-bold">💬 Живые уроки</div>
            <p className="text-gray-500 mt-2">1 на 1 и мини-группы</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center bg-orange-50 rounded-3xl">
        <h2 className="text-3xl font-bold">Начни изучать китайский уже сегодня</h2>
        <p className="text-gray-600 mt-3">Первый урок бесплатно</p>

        <button className="mt-6 bg-orange-500 text-white px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition">
          Записаться бесплатно
        </button>
      </section>

    </main>
  );
}
