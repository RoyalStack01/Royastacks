"use client";

import Link from "next/link";
import PokerTable from "../../components/tablescreen";

export default function DemoPage() {
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
        background: "rgba(10,10,10,0.92)", borderBottom: "1px solid rgba(232,0,58,0.25)",
        padding: "6px 16px", backdropFilter: "blur(8px)",
      }}>
        <span style={{ color: "#888", fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>
          DEMO MODE — play without real funds
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
        <PokerTable />
      </div>
    </div>
  );
}
