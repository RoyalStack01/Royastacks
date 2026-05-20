"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import PokerTable from "../../components/tablescreen";

const DEMO_CONFIGS: Record<string, { label: string; smallBlind: number; bigBlind: number; speed: "normal" | "fast" }> = {
  "demo-1": { label: "Practice Table I",  smallBlind: 50,  bigBlind: 100, speed: "normal" },
  "demo-2": { label: "Practice Table II", smallBlind: 50,  bigBlind: 100, speed: "normal" },
  "demo-3": { label: "Speed Table",       smallBlind: 100, bigBlind: 200, speed: "fast"   },
};

function DemoInner() {
  const params = useSearchParams();
  const tableId = params.get("t") ?? "demo-1";
  const cfg = DEMO_CONFIGS[tableId] ?? DEMO_CONFIGS["demo-1"];

  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        background: "rgba(10,10,10,0.92)", borderBottom: "1px solid rgba(232,0,58,0.25)",
        padding: "6px 16px", backdropFilter: "blur(8px)",
      }}>
        <span style={{ color: "#888", fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>
          DEMO · {cfg.label} · play without real funds
        </span>
        <Link
          href="/connect"
          style={{
            color: "#E8003A", fontSize: 11, fontFamily: "monospace", fontWeight: 700,
            textDecoration: "none", letterSpacing: 1,
            border: "1px solid rgba(232,0,58,0.4)", borderRadius: 6, padding: "3px 10px",
          }}
        >
          PLAY FOR REAL →
        </Link>
      </div>
      <div style={{ paddingTop: 32 }}>
        <PokerTable
          smallBlind={cfg.smallBlind}
          bigBlind={cfg.bigBlind}
          label={cfg.label}
          speed={cfg.speed}
        />
      </div>
    </div>
  );
}

export default function DemoPage() {
  return (
    <Suspense>
      <DemoInner />
    </Suspense>
  );
}
