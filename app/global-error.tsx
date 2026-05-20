"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#05000f", color: "#fff", fontFamily: "monospace", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "32px" }}>
        <div style={{ fontSize: 13, letterSpacing: 3, opacity: 0.5, marginBottom: 40 }}>ROYAL STACKS</div>
        <div style={{ fontSize: 36, marginBottom: 20, opacity: 0.5 }}>⚠</div>
        <div style={{ fontSize: 16, letterSpacing: 2, marginBottom: 12 }}>THIS PAGE COULDN&apos;T LOAD</div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 36, letterSpacing: 1 }}>Reload to try again, or go back.</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", background: "#FF0A54", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}
          >
            Reload
          </button>
          <button
            onClick={() => window.history.back()}
            style={{ padding: "10px 24px", background: "transparent", color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, fontSize: 12, letterSpacing: 2, cursor: "pointer", textTransform: "uppercase" }}
          >
            Go Back
          </button>
        </div>
      </body>
    </html>
  );
}
