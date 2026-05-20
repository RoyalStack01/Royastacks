"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import LiveGameTable from "../../components/LiveGameTable";
import { getPool, listPools } from "../../lib/server";

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
  | { status: "failed"; reason: string };

function matchesWallet(pl: any, wallet: string): boolean {
  const addr = typeof pl === "string"
    ? pl
    : (pl.address ?? pl.walletAddress ?? pl.id ?? "");
  return addr.toLowerCase() === wallet.toLowerCase();
}

function GamePageInner() {
  const router = useRouter();
  const [check, setCheck] = useState<CheckState>({ status: "checking" });

  useEffect(() => {
    let cancelled = false;

    const t = localStorage.getItem(STORAGE_KEY_TOKEN);
    const w = localStorage.getItem(STORAGE_KEY_WALLET);
    let   p = localStorage.getItem(STORAGE_KEY_POOL);

    if (!t || !w) {
      setCheck({ status: "failed", reason: !t ? "no session — connect your wallet first" : "no wallet found" });
      return;
    }

    async function run() {
      // If poolId was wiped from localStorage, scan all active pools on the server
      // to recover the one the user is already seated in.
      if (!p) {
        console.log("[RoyalStack/game] no poolId in storage — scanning server for active seat...");
        try {
          const pools: any[] = await listPools(t!);
          const found = pools.find(pool => {
            if (pool.status === "CLOSED") return false;
            return (Array.isArray(pool.players) ? pool.players : []).some(pl => matchesWallet(pl, w!));
          });
          if (found) {
            p = String(found.id ?? found.poolId ?? "");
            localStorage.setItem(STORAGE_KEY_POOL, p);
            console.log("[RoyalStack/game] recovered poolId:", p);
          }
        } catch (e) {
          console.warn("[RoyalStack/game] listPools scan failed:", e);
        }
      }

      if (!p) {
        setCheck({ status: "failed", reason: "you are not currently seated in any active pool" });
        return;
      }

      // Verify this specific pool
      let pool: any;
      try {
        pool = await getPool(t!, p);
      } catch (err: any) {
        const msg: string = err?.message ?? "unknown error";
        const isAuth = ["unauthorized","invalid","expired","forbidden","session"].some(k => msg.toLowerCase().includes(k));
        if (isAuth) {
          localStorage.removeItem(STORAGE_KEY_TOKEN);
          setCheck({ status: "failed", reason: `session expired — reconnect your wallet` });
        } else {
          setCheck({ status: "failed", reason: `server error: ${msg}` });
        }
        return;
      }

      console.log("[RoyalStack/game] pool:", { status: pool.status, gameStarted: pool.gameStarted, playerCount: pool.playerCount, players: pool.players });

      if (pool.status === "CLOSED") {
        localStorage.removeItem(STORAGE_KEY_POOL);
        setCheck({ status: "failed", reason: `pool ${p} has ended` });
        return;
      }

      const players: any[] = Array.isArray(pool.players) ? pool.players : [];
      const isPlayer = players.some(pl => matchesWallet(pl, w!));
      console.log("[RoyalStack/game] isPlayer:", isPlayer, "wallet:", w, "players:", players);

      if (isPlayer) {
        setCheck({ status: "live", token: t!, poolId: p!, walletAddress: w! });
      } else {
        localStorage.removeItem(STORAGE_KEY_POOL);
        setCheck({ status: "failed", reason: `wallet ${w!.slice(0,8)}… not found in pool ${p} (${players.length} players recorded)` });
      }
    }

    run().catch(err => {
      if (!cancelled) setCheck({ status: "failed", reason: err?.message ?? "unexpected error" });
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

  // ── Failed ────────────────────────────────────────────────────────────────
  if (check.status === "failed") {
    return (
      <div style={{
        minHeight: "100vh", background: "#0A0A0A", display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        color: "#fff", fontFamily: "monospace", gap: 16, padding: 24, textAlign: "center",
      }}>
        <div style={{ fontSize: 32 }}>🃏</div>
        <div style={{ fontSize: 13, color: "#888", letterSpacing: 1, maxWidth: 380 }}>
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
            onClick={() => window.location.reload()}
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
