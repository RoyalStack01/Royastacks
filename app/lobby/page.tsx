"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { listPools, createRoom } from "../../lib/server";

const STORAGE_KEY_TOKEN  = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL   = "royalstack:poolId";

const REFRESH_MS = 5000;

type Tab = "live" | "demo";

type PoolCard = {
  id: string;
  status: string;
  playerCount: number;
  isFull: boolean;
};

function parsePools(raw: Record<string, unknown>[]): PoolCard[] {
  return raw.map((p) => {
    const count = typeof p.playerCount === "number" ? p.playerCount : 0;
    return {
      id: String(p.id ?? p.poolId ?? "?"),
      status: String(p.status ?? "ACTIVE"),
      playerCount: count,
      isFull: count >= 5,
    };
  });
}

// Static demo tables — purely client-side, no funds
const DEMO_TABLES = [
  { id: "demo-1", label: "Practice Table I",   bots: 4, blinds: "50 / 100" },
  { id: "demo-2", label: "Practice Table II",  bots: 4, blinds: "50 / 100" },
  { id: "demo-3", label: "Speed Table",        bots: 4, blinds: "100 / 200" },
];

export default function LobbyPage() {
  const router = useRouter();
  const [token, setToken]         = useState("");
  const [wallet, setWallet]       = useState("");
  const [tab, setTab]             = useState<Tab>("live");
  const [pools, setPools]         = useState<PoolCard[]>([]);
  const [loading, setLoading]     = useState(true);
  const [creating, setCreating]   = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [error, setError]         = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const w = sessionStorage.getItem(STORAGE_KEY_WALLET);
    if (!t || !w) { router.replace("/connect"); return; }
    setToken(t);
    setWallet(w);
    fetchPools(t);
    timerRef.current = setInterval(() => fetchPools(t), REFRESH_MS);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function fetchPools(t: string) {
    try {
      const raw = await listPools(t) as Record<string, unknown>[];
      setPools(parsePools(raw));
    } catch {
      // silently keep stale data
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(poolId: string) {
    setJoiningId(poolId);
    sessionStorage.setItem(STORAGE_KEY_POOL, poolId);
    router.push("/fund");
  }

  async function handleCreate() {
    setError("");
    setCreating(true);
    try {
      const { poolId } = await createRoom(token);
      sessionStorage.setItem(STORAGE_KEY_POOL, poolId);
      router.push("/fund");
    } catch (e: any) {
      setError(e.message ?? "Failed to create room");
    } finally {
      setCreating(false);
    }
  }

  function handleDemo(tableId: string) {
    // Demo goes straight to the game page — no session needed, no funds
    router.push(`/game?demo=${tableId}`);
  }

  const activePools = pools.filter(p => p.status === "ACTIVE");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Electrolize&family=Share+Tech+Mono&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lb-root {
          min-height: 100vh;
          background: #05000f;
          color: #fff;
          font-family: 'Electrolize', sans-serif;
          padding: 0;
        }

        /* top bar */
        .lb-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 32px;
          border-bottom: 1px solid rgba(255,10,84,0.15);
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(20px);
        }
        .lb-logo {
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #fff;
          text-shadow: 0 0 10px rgba(255,10,84,0.5);
          text-decoration: none;
        }
        .lb-topnav {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .lb-topnav a {
          font-family: 'Electrolize', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .lb-topnav a:hover { color: #FF0A54; }
        .lb-topnav a.active { color: #FF0A54; }
        .lb-wallet {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.45);
          letter-spacing: 1px;
        }

        /* main */
        .lb-main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        .lb-header {
          margin-bottom: 32px;
        }
        .lb-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 4px;
          color: #FF0A54;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .lb-title {
          font-family: 'Audiowide', sans-serif;
          font-size: clamp(22px, 4vw, 36px);
          letter-spacing: 2px;
          line-height: 1.2;
        }

        .lb-error {
          margin-bottom: 20px;
          padding: 12px 16px;
          background: rgba(255,10,84,0.1);
          border: 1px solid rgba(255,10,84,0.3);
          border-radius: 4px;
          font-size: 12px;
          color: #FF0A54;
          letter-spacing: 1px;
        }

        /* Tab bar */
        .tab-bar {
          display: flex;
          align-items: center;
          gap: 0;
          margin-bottom: 28px;
          border-bottom: 1px solid rgba(255,10,84,0.12);
        }
        .tab-btn {
          position: relative;
          font-family: 'Audiowide', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: none;
          border: none;
          padding: 14px 28px;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          transition: color 0.2s;
        }
        .tab-btn::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0; right: 0;
          height: 2px;
          background: #FF0A54;
          transform: scaleX(0);
          transition: transform 0.2s;
        }
        .tab-btn.active {
          color: #fff;
        }
        .tab-btn.active::after { transform: scaleX(1); }
        .tab-btn:hover { color: rgba(255,255,255,0.7); }
        .tab-badge {
          display: inline-block;
          margin-left: 8px;
          font-size: 8px;
          padding: 2px 7px;
          background: rgba(255,10,84,0.15);
          border: 1px solid rgba(255,10,84,0.3);
          color: #FF0A54;
          border-radius: 10px;
          font-family: 'Share Tech Mono', monospace;
          letter-spacing: 1px;
          vertical-align: middle;
        }
        .demo-badge {
          background: rgba(0,200,100,0.1);
          border-color: rgba(0,200,100,0.3);
          color: #00c864;
        }

        /* Desc row */
        .tab-desc {
          margin-bottom: 24px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1px;
          font-family: 'Share Tech Mono', monospace;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .live-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: #00ff64;
          animation: blink 1.5s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        /* grid */
        .lb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 20px;
        }

        /* room card */
        .lb-card {
          position: relative;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,10,84,0.15);
          padding: 28px 24px 24px;
          transition: border-color 0.25s, background 0.25s;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
        }
        .lb-card:hover:not(.lb-card--full) {
          border-color: rgba(255,10,84,0.4);
          background: rgba(255,10,84,0.04);
        }
        .lb-card--full { opacity: 0.45; }

        .lb-card-id {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .lb-card-name {
          font-family: 'Audiowide', sans-serif;
          font-size: 16px;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }

        /* seats */
        .lb-seats {
          display: flex;
          gap: 7px;
          margin-bottom: 20px;
          align-items: center;
        }
        .lb-seat {
          width: 28px; height: 28px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,10,84,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          font-family: 'Share Tech Mono', monospace;
          transition: background 0.2s, border-color 0.2s;
        }
        .lb-seat--taken {
          background: rgba(255,10,84,0.2);
          border-color: #FF0A54;
          color: #FF0A54;
        }
        .lb-seat--bot {
          background: rgba(0,180,80,0.15);
          border-color: rgba(0,180,80,0.4);
          color: rgba(0,180,80,0.8);
        }
        .lb-seats-label {
          margin-left: 4px;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 2px;
          font-family: 'Share Tech Mono', monospace;
        }

        /* badge */
        .lb-badge {
          display: inline-block;
          padding: 3px 10px;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          font-family: 'Share Tech Mono', monospace;
          border-radius: 2px;
          margin-bottom: 20px;
        }
        .lb-badge--active { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid rgba(0,255,100,0.25); }
        .lb-badge--full   { background: rgba(255,10,84,0.1);  color: #FF0A54; border: 1px solid rgba(255,10,84,0.25); }
        .lb-badge--demo   { background: rgba(0,180,80,0.1);   color: #00c864; border: 1px solid rgba(0,180,80,0.25); }

        /* button */
        .lb-btn {
          width: 100%;
          padding: 11px;
          background: #FF0A54;
          color: #fff;
          border: none;
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
          transition: box-shadow 0.25s, transform 0.15s;
        }
        .lb-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(255,10,84,0.6);
          transform: translateY(-1px);
        }
        .lb-btn:disabled {
          background: rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.25);
          cursor: not-allowed;
          clip-path: none;
        }
        .lb-btn--demo {
          background: #00c864;
        }
        .lb-btn--demo:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(0,200,100,0.5);
        }

        /* card info row */
        .lb-card-info {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.2);
          margin-bottom: 16px;
          text-transform: uppercase;
        }

        /* create card */
        .lb-create-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          background: rgba(255,10,84,0.04);
          border: 1px dashed rgba(255,10,84,0.25);
          padding: 40px 24px;
          cursor: pointer;
          transition: border-color 0.25s, background 0.25s;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
          text-align: center;
        }
        .lb-create-card:hover:not(:disabled) {
          border-color: rgba(255,10,84,0.5);
          background: rgba(255,10,84,0.07);
        }
        .lb-create-card:disabled { opacity: 0.5; cursor: not-allowed; }
        .lb-create-icon {
          width: 48px; height: 48px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,10,84,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: #FF0A54;
        }
        .lb-create-label {
          font-family: 'Audiowide', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
        }
        .lb-create-sub {
          font-size: 10px;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.25);
          font-family: 'Share Tech Mono', monospace;
        }

        /* skeleton */
        .lb-skeleton {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,10,84,0.08);
          padding: 28px 24px 24px;
          clip-path: polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%);
        }
        .lb-skel-line {
          height: 10px;
          border-radius: 4px;
          background: rgba(255,255,255,0.06);
          margin-bottom: 12px;
          animation: lb-pulse 1.4s ease-in-out infinite;
        }
        .lb-skel-line:nth-child(2) { width: 60%; animation-delay: 0.2s; }
        .lb-skel-line:nth-child(3) { width: 80%; animation-delay: 0.1s; }
        @keyframes lb-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }

        .lb-empty {
          grid-column: 1 / -1;
          padding: 40px;
          text-align: center;
          color: rgba(255,255,255,0.25);
          font-size: 12px;
          letter-spacing: 2px;
          font-family: 'Share Tech Mono', monospace;
        }

        @media (max-width: 600px) {
          .lb-topbar { padding: 14px 16px; }
          .lb-topnav { gap: 10px; }
          .tab-btn { padding: 12px 16px; font-size: 10px; }
        }
      `}</style>

      <div className="lb-root">
        <div className="lb-topbar">
          <a href="/" className="lb-logo">ROYAL STACKS</a>
          <div className="lb-topnav">
            <a href="/lobby" className="active">Lobby</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/profile">Profile</a>
          </div>
          <span className="lb-wallet">
            {wallet ? `${wallet.slice(0, 6)}...${wallet.slice(-4)}` : ""}
          </span>
        </div>

        <main className="lb-main">
          <div className="lb-header">
            <div className="lb-eyebrow">Mezo Testnet · Chain 31611</div>
            <h1 className="lb-title">WAITING FLOOR</h1>
          </div>

          {error && <div className="lb-error">{error}</div>}

          {/* Tab bar */}
          <div className="tab-bar">
            <button
              className={`tab-btn${tab === "live" ? " active" : ""}`}
              onClick={() => setTab("live")}
            >
              Live
              {!loading && activePools.length > 0 && (
                <span className="tab-badge">{activePools.length}</span>
              )}
            </button>
            <button
              className={`tab-btn${tab === "demo" ? " active" : ""}`}
              onClick={() => setTab("demo")}
            >
              Demo
              <span className="tab-badge demo-badge">FREE</span>
            </button>
          </div>

          {/* Live tab */}
          {tab === "live" && (
            <>
              <div className="tab-desc">
                <span className="live-dot" />
                Real money · 1 Mezo Token buy-in · refreshing every 5s
              </div>
              <div className="lb-grid">
                {loading ? (
                  [0, 1, 2].map(i => (
                    <div key={i} className="lb-skeleton">
                      <div className="lb-skel-line" />
                      <div className="lb-skel-line" />
                      <div className="lb-skel-line" />
                    </div>
                  ))
                ) : activePools.length === 0 ? (
                  <div className="lb-empty">NO OPEN TABLES — CREATE ONE BELOW</div>
                ) : (
                  activePools.map(pool => {
                    const seats = Array.from({ length: 5 }, (_, i) => i < pool.playerCount);
                    return (
                      <div key={pool.id} className={`lb-card${pool.isFull ? " lb-card--full" : ""}`}>
                        <div className="lb-card-id">POOL #{pool.id}</div>
                        <div className="lb-card-name">TABLE {pool.id}</div>
                        <div className="lb-seats">
                          {seats.map((taken, i) => (
                            <div key={i} className={`lb-seat${taken ? " lb-seat--taken" : ""}`}>
                              {taken ? "●" : "○"}
                            </div>
                          ))}
                          <span className="lb-seats-label">{pool.playerCount}/5</span>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                          <span className={`lb-badge lb-badge--${pool.isFull ? "full" : "active"}`}>
                            {pool.isFull ? "FULL" : "OPEN"}
                          </span>
                        </div>
                        <button
                          className="lb-btn"
                          disabled={pool.isFull || joiningId === pool.id}
                          onClick={() => handleJoin(pool.id)}
                        >
                          {joiningId === pool.id ? "JOINING..." : pool.isFull ? "FULL" : "JOIN →"}
                        </button>
                      </div>
                    );
                  })
                )}

                {/* Create table card */}
                <button
                  className="lb-create-card"
                  disabled={creating}
                  onClick={handleCreate}
                >
                  <div className="lb-create-icon">{creating ? "⟳" : "+"}</div>
                  <div className="lb-create-label">{creating ? "CREATING..." : "NEW TABLE"}</div>
                  <div className="lb-create-sub">OPEN A ROOM ON-CHAIN</div>
                </button>
              </div>
            </>
          )}

          {/* Demo tab */}
          {tab === "demo" && (
            <>
              <div className="tab-desc">
                No wallet required · Play against bots · No funds at risk
              </div>
              <div className="lb-grid">
                {DEMO_TABLES.map(t => (
                  <div key={t.id} className="lb-card">
                    <div className="lb-card-id">DEMO</div>
                    <div className="lb-card-name">{t.label}</div>
                    <div className="lb-seats">
                      {/* 1 human seat + bot seats */}
                      <div className="lb-seat lb-seat--taken">●</div>
                      {Array.from({ length: t.bots }).map((_, i) => (
                        <div key={i} className="lb-seat lb-seat--bot">B</div>
                      ))}
                      <span className="lb-seats-label">vs {t.bots} bots</span>
                    </div>
                    <div className="lb-card-info">Blinds: {t.blinds}</div>
                    <div style={{ marginBottom: 16 }}>
                      <span className="lb-badge lb-badge--demo">FREE PLAY</span>
                    </div>
                    <button
                      className="lb-btn lb-btn--demo"
                      onClick={() => handleDemo(t.id)}
                    >
                      PLAY →
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
