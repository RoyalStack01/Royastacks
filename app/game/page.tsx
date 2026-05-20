"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import PokerTable from "../../components/tablescreen";
import LiveGameTable from "../../components/LiveGameTable";
import { getPool } from "../../lib/server";

const STORAGE_KEY_TOKEN = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL = "royalstack:poolId";

export default function GamePage() {
  return (
    <Suspense>
      <GamePageInner />
    </Suspense>
  );
}

function GamePageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mode, setMode] = useState<"demo" | "live" | null>(null);
  const [demoReason, setDemoReason] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    // ?demo in URL → always demo, no server check needed
    if (searchParams.get("demo") !== null) {
      setMode("demo");
      return;
    }

    const t = localStorage.getItem(STORAGE_KEY_TOKEN);
    const p = localStorage.getItem(STORAGE_KEY_POOL);
    const w = localStorage.getItem(STORAGE_KEY_WALLET);

    // Without all three pieces there's nothing to verify
    if (!t || !p || !w) {
      setMode("demo");
      setDemoReason(!t ? "no session" : !p ? "no pool" : "no wallet");
      return;
    }

    // Explicitly verify with the server: session valid + pool active + user is a player
    getPool(t, p)
      .then((pool: any) => {
        console.log("[RoyalStack] getPool response:", {
          status: pool.status,
          gameStarted: pool.gameStarted,
          playerCount: pool.playerCount,
          players: (pool.players ?? []).map((pl: any) => pl.address),
        });

        if (pool.status === "CLOSED") {
          localStorage.removeItem(STORAGE_KEY_POOL);
          setDemoReason("pool closed");
          setMode("demo");
          return;
        }

        const players: any[] = Array.isArray(pool.players) ? pool.players : [];
        const isPlayer = players.some(
          pl => (pl.address ?? "").toLowerCase() === w.toLowerCase()
        );

        console.log("[RoyalStack] isPlayer check:", { wallet: w, isPlayer });

        if (isPlayer) {
          setToken(t);
          setPoolId(p);
          setWalletAddress(w);
          setMode("live");
        } else {
          setDemoReason(`not in pool ${p} (${players.length} players found)`);
          setMode("demo");
        }
      })
      .catch((err: any) => {
        const msg: string = err?.message ?? "unknown error";
        console.error("[RoyalStack] getPool failed:", msg);

        const isAuthError =
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("invalid") ||
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("forbidden") ||
          msg.toLowerCase().includes("session");

        if (isAuthError) {
          // Session expired — clear stale token and force re-auth
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          router.replace("/connect");
        } else {
          setDemoReason(msg);
          setMode("demo");
        }
      });
  }, [searchParams, router]);

  // Hydration guard — don't render until we know which mode
  if (mode === null) return null;

  if (mode === "live" && token && poolId && walletAddress) {
    return (
      <div style={{ position: "relative" }}>
        {/* Exit to demo link */}
        <div style={{ position: "fixed", top: 12, right: 16, zIndex: 2000 }}>
          <Link
            href="/game?demo=1"
            onClick={() => setMode("demo")}
            style={{ color: "#888", fontSize: 11, fontFamily: "monospace", textDecoration: "none", letterSpacing: 1, background: "rgba(0,0,0,0.6)", padding: "4px 10px", borderRadius: 6, border: "1px solid #333" }}
          >
            DEMO MODE
          </Link>
        </div>
        <LiveGameTable sessionToken={token} poolId={poolId} walletAddress={walletAddress} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Demo mode banner */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(10,10,10,0.92)", borderBottom: "1px solid rgba(232,0,58,0.25)", padding: "6px 16px", backdropFilter: "blur(8px)" }}>
        <span style={{ color: "#888", fontSize: 11, fontFamily: "monospace", letterSpacing: 2 }}>
          DEMO MODE{demoReason ? ` — ${demoReason}` : " — play without real funds"}
        </span>
        <Link
          href="/connect"
          style={{ color: "#E8003A", fontSize: 11, fontFamily: "monospace", fontWeight: 700, textDecoration: "none", letterSpacing: 1, border: "1px solid rgba(232,0,58,0.4)", borderRadius: 6, padding: "3px 10px" }}
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
