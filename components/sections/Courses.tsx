import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";

const courses = [
  { title: "Китайский для детей", tag: "5–10 лет" },
  { title: "HSK подготовка", tag: "экзамен" },
  { title: "Разговорный китайский", tag: "взрослые" },
];

export default function Courses() {
  return (
    <section id="courses" style={{ marginTop: 80 }}>
      <h2 style={{ fontSize: 32, fontWeight: 800 }}>Курсы</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 16,
          marginTop: 20,
        }}
      >
        {courses.map((c) => (
          <Card key={c.title}>
            <Badge>{c.tag}</Badge>
            <h3 style={{ marginTop: 10, fontWeight: 700 }}>{c.title}</h3>
            <p style={{ color: "#666", marginTop: 8 }}>
              Онлайн обучение с преподавателями HSK 5–6
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
}
