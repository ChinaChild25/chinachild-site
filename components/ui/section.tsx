export default function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 80 }}>
      <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 20 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
