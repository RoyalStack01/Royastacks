"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import LiveGameTable from "../../components/LiveGameTable";
import { getPool } from "../../lib/server";

const STORAGE_KEY_TOKEN  = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL   = "royalstack:poolId";

export default function GamePage() {
  return (
    <Suspense>
      <GamePageInner />
    </Suspense>
  );
}

type CheckState =
  | { status: "checking" }
  | { status: "live"; token: string; poolId: string; walletAddress: string }
  | { status: "redirect"; reason: string };

function GamePageInner() {
  const router = useRouter();
  const [check, setCheck] = useState<CheckState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    const t = localStorage.getItem(STORAGE_KEY_TOKEN);
    const p = localStorage.getItem(STORAGE_KEY_POOL);
    const w = localStorage.getItem(STORAGE_KEY_WALLET);

    if (!t || !p || !w) {
      const reason = !t ? "no session token" : !p ? "no pool id" : "no wallet";
      console.warn("[RoyalStack/game] missing storage:", reason);
      setCheck({ status: "redirect", reason });
      return;
    }

    getPool(t, p)
      .then((pool: any) => {
        if (cancelled) return;

        console.log("[RoyalStack/game] getPool response:", {
          status: pool.status,
          gameStarted: pool.gameStarted,
          playerCount: pool.playerCount,
          players: pool.players,
        });

        if (pool.status === "CLOSED") {
          localStorage.removeItem(STORAGE_KEY_POOL);
          setCheck({ status: "redirect", reason: `pool ${p} is CLOSED` });
          return;
        }

        const players: any[] = Array.isArray(pool.players) ? pool.players : [];
        const isPlayer = players.some(pl => {
          const addr = typeof pl === "string"
            ? pl
            : (pl.address ?? pl.walletAddress ?? pl.id ?? "");
          return addr.toLowerCase() === w.toLowerCase();
        });

        console.log("[RoyalStack/game] isPlayer:", isPlayer, "| wallet:", w, "| pool players:", players);

        if (isPlayer) {
          setCheck({ status: "live", token: t, poolId: p, walletAddress: w });
        } else {
          localStorage.removeItem(STORAGE_KEY_POOL);
          setCheck({ status: "redirect", reason: `wallet ${w.slice(0,8)}… not found in pool ${p} (${players.length} players)` });
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        const msg: string = err?.message ?? "unknown error";
        console.error("[RoyalStack/game] getPool error:", msg);

        const isAuthError =
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("forbidden") ||
          msg.toLowerCase().includes("session");

        if (isAuthError) {
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          setCheck({ status: "redirect", reason: `auth error: ${msg}` });
        } else {
          // Server blip — keep poolId, go to lobby so they can retry
          setCheck({ status: "redirect", reason: `server error: ${msg}` });
        }
      });

    return () => { cancelled = true; };
  }, []);

  // ── Checking ──────────────────────────────────────────────────────────────
  if (check.status === "checking") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0A", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "monospace", gap: 16,
      }}>
        <div style={{ fontSize: 32 }}>⏳</div>
        <div style={{ fontSize: 14, color: "#888", letterSpacing: 2 }}>VERIFYING SESSION...</div>
      </div>
    );
  }

  // ── Redirect ──────────────────────────────────────────────────────────────
  if (check.status === "redirect") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0A", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "monospace", gap: 16, padding: 24,
      }}>
        <div style={{ fontSize: 32 }}>🃏</div>
        <div style={{ fontSize: 13, color: "#888", letterSpacing: 1, textAlign: "center", maxWidth: 360 }}>
          {check.reason}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
          <button
            onClick={() => router.replace("/lobby")}
            style={{
              background: "#E8003A", color: "#fff", border: "none", borderRadius: 8,
              padding: "10px 24px", fontFamily: "monospace", fontWeight: 700,
              fontSize: 13, letterSpacing: 1, cursor: "pointer",
            }}
          >
            GO TO LOBBY
          </button>
          <button
            onClick={() => { setCheck({ status: "checking" }); window.location.reload(); }}
            style={{
              background: "transparent", color: "#888", border: "1px solid #333",
              borderRadius: 8, padding: "10px 24px", fontFamily: "monospace",
              fontSize: 13, letterSpacing: 1, cursor: "pointer",
            }}
          >
            RETRY
          </button>
        </div>
      </div>
    );
  }

  // ── Live table ────────────────────────────────────────────────────────────
  return (
    <LiveGameTable
      sessionToken={check.token}
      poolId={check.poolId}
      walletAddress={check.walletAddress}
    />
  );
}
