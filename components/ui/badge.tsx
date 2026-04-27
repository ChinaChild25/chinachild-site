export default function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        background: "#f3f3f3",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}
