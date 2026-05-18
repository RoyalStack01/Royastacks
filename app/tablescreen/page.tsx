import Link from "next/link";
import PokerTable from "@/components/tablescreen";

export default function TablescreenPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        padding: "24px",
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflowX: "hidden",
      }}
    >
      <div style={{ width: "100%", maxWidth: 1160, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#aaa" }}>
              Route
            </p>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>Royal Stack Table</h1>
          </div>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.18)",
              background: "rgba(255,255,255,0.06)",
              color: "#ffffff",
              borderRadius: 12,
              padding: "10px 16px",
              fontWeight: 700,
            }}
          >
            Back home
          </Link>
        </div>
        <PokerTable />
      </div>
    </main>
  );
}
