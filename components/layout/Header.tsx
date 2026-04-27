import Button from "@/components/ui/button";

export default function Header() {
  return (
    <header style={{
      position: "sticky",
      top: 0,
      background: "white",
      borderBottom: "1px solid #eee",
      padding: "14px 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      zIndex: 50
    }}>
      <div style={{ fontWeight: 800 }}>ChinaChild</div>

      <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
        <a href="#courses">Курсы</a>
        <a href="#teachers">Преподаватели</a>
        <a href="#prices">Цены</a>
      </nav>

      <Button>Начать бесплатно</Button>
    </header>
  );
}
