"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getPlayerStats, getLeaderboard } from "../../lib/server";
import { walletEmoji } from "../../lib/avatar";

const STORAGE_KEY_TOKEN  = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL   = "royalstack:poolId";

type Stats = {
  playerId: string;
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  totalRakePaid: number;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [token, setToken]     = useState("");
  const [wallet, setWallet]   = useState("");
  const [stats, setStats]     = useState<Stats | null>(null);
  const [rank, setRank]       = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const w = sessionStorage.getItem(STORAGE_KEY_WALLET);
    if (!t || !w) { router.replace("/connect"); return; }
    setToken(t);
    setWallet(w);
    fetchData(t, w);
  }, []);

  async function fetchData(t: string, w: string) {
    try {
      const [statsData, board] = await Promise.all([
        getPlayerStats(t, w).catch(() => null),
        getLeaderboard(t, 100).catch(() => []),
      ]);
      setStats(statsData);
      const pos = (board as any[]).findIndex(e => e.playerId?.toLowerCase() === w.toLowerCase());
      if (pos !== -1) setRank(pos + 1);
    } catch (e: any) {
      // silently fail — stats show as zeros until tables exist
    } finally {
      setLoading(false);
    }
  }

  function handleDisconnect() {
    sessionStorage.removeItem(STORAGE_KEY_TOKEN);
    sessionStorage.removeItem(STORAGE_KEY_WALLET);
    sessionStorage.removeItem(STORAGE_KEY_POOL);
    router.push("/");
  }

  const winRate = stats && stats.handsPlayed
    ? Math.round((stats.handsWon / stats.handsPlayed) * 100)
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Electrolize&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .pr-root {
          min-height: 100vh;
          background: #05000f;
          color: #fff;
          font-family: 'Electrolize', sans-serif;
        }

        .pr-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 32px;
          border-bottom: 1px solid rgba(255,10,84,0.15);
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(20px);
        }
        .pr-logo {
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #fff;
          text-shadow: 0 0 10px rgba(255,10,84,0.5);
          text-decoration: none;
        }
        .pr-nav {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .pr-nav a {
          font-family: 'Electrolize', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .pr-nav a:hover { color: #FF0A54; }
        .pr-nav a.active { color: #FF0A54; }

        .pr-main {
          max-width: 800px;
          margin: 0 auto;
          padding: 48px 24px 80px;
        }

        /* Hero card */
        .pr-hero {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,10,84,0.2);
          padding: 32px;
          margin-bottom: 32px;
          display: flex;
          align-items: center;
          gap: 24px;
          clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
          flex-wrap: wrap;
        }
        .pr-avatar {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(255,10,84,0.1);
          border: 2px solid rgba(255,10,84,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          flex-shrink: 0;
          box-shadow: 0 0 24px rgba(255,10,84,0.2);
        }
        .pr-hero-info { flex: 1; min-width: 180px; }
        .pr-hero-eyebrow {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .pr-hero-addr {
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          letter-spacing: 1px;
          color: #fff;
          margin-bottom: 6px;
          word-break: break-all;
        }
        .pr-hero-rank {
          font-family: 'Audiowide', sans-serif;
          font-size: 11px;
          letter-spacing: 1px;
          color: #FF0A54;
        }
        .pr-disconnect-btn {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: transparent;
          color: rgba(255,255,255,0.25);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 9px 18px;
          cursor: pointer;
          border-radius: 4px;
          transition: color 0.2s, border-color 0.2s;
          white-space: nowrap;
        }
        .pr-disconnect-btn:hover {
          color: #FF0A54;
          border-color: rgba(255,10,84,0.4);
        }

        /* Stat grid */
        .pr-stats {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 14px;
          margin-bottom: 32px;
        }
        .stat-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 20px 18px;
          border-radius: 4px;
          transition: border-color 0.2s;
        }
        .stat-card:hover { border-color: rgba(255,10,84,0.25); }
        .stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
        }
        .stat-value {
          font-family: 'Audiowide', sans-serif;
          font-size: 26px;
          letter-spacing: 1px;
          color: #fff;
          margin-bottom: 4px;
        }
        .stat-sub {
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          letter-spacing: 1px;
          font-family: 'Share Tech Mono', monospace;
        }

        /* Win rate bar */
        .pr-section-title {
          font-family: 'Audiowide', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          margin-bottom: 16px;
        }
        .pr-winrate-wrap {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          padding: 20px;
          border-radius: 4px;
          margin-bottom: 32px;
        }
        .pr-winrate-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.5);
        }
        .pr-winrate-val {
          font-family: 'Audiowide', sans-serif;
          font-size: 18px;
          color: #FF0A54;
        }
        .pr-bar-track {
          height: 6px;
          background: rgba(255,255,255,0.06);
          border-radius: 3px;
          overflow: hidden;
        }
        .pr-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #FF0A54, #ff6b9d);
          border-radius: 3px;
          transition: width 0.8s ease;
        }

        /* Action area */
        .pr-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .pr-action-btn {
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 13px 24px;
          clip-path: polygon(7px 0%, 100% 0%, calc(100% - 7px) 100%, 0% 100%);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          box-shadow: 0 0 18px rgba(255,10,84,0.25);
          transition: box-shadow 0.2s, transform 0.15s;
        }
        .pr-action-btn:hover { box-shadow: 0 0 32px rgba(255,10,84,0.55); transform: translateY(-1px); }
        .pr-action-btn.outline {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.15);
          clip-path: none;
          box-shadow: none;
        }
        .pr-action-btn.outline:hover { color: #fff; border-color: rgba(255,255,255,0.3); }

        /* Skeleton */
        .skel { background: rgba(255,255,255,0.05); border-radius: 4px; animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }

        .pr-error {
          padding: 14px 18px;
          background: rgba(255,10,84,0.08);
          border: 1px solid rgba(255,10,84,0.25);
          border-radius: 4px;
          color: #FF0A54;
          font-size: 12px;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        @media (max-width: 600px) {
          .pr-topbar { padding: 14px 16px; }
          .pr-nav { gap: 12px; }
          .pr-hero { padding: 20px; }
        }
      `}</style>

      <div className="pr-root">
        <div className="pr-topbar">
          <a href="/" className="pr-logo">ROYAL STACKS</a>
          <div className="pr-nav">
            <a href="/lobby">Lobby</a>
            <a href="/leaderboard">Leaderboard</a>
            <a href="/profile" className="active">Profile</a>
          </div>
        </div>

        <main className="pr-main">

          {/* Hero card */}
          <div className="pr-hero">
            <div className="pr-avatar">
              {walletEmoji(wallet)}
            </div>
            <div className="pr-hero-info">
              <div className="pr-hero-eyebrow">Wallet Address</div>
              <div className="pr-hero-addr">{wallet || "—"}</div>
              <div className="pr-hero-rank">
                {loading ? "Loading..." : rank ? `Rank #${rank}` : "Unranked"}
              </div>
            </div>
            <button className="pr-disconnect-btn" onClick={handleDisconnect}>
              Disconnect
            </button>
          </div>

          {/* Stat cards */}
          <div className="pr-stats">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="stat-card">
                  <div className="skel" style={{ height: 10, width: "60%", marginBottom: 12 }} />
                  <div className="skel" style={{ height: 30, width: "80%", marginBottom: 6 }} />
                  <div className="skel" style={{ height: 8, width: "40%" }} />
                </div>
              ))
            ) : (
              <>
                <StatCard
                  label="Hands Played"
                  value={stats?.handsPlayed ?? 0}
                  sub="total hands"
                />
                <StatCard
                  label="Hands Won"
                  value={stats?.handsWon ?? 0}
                  sub={`of ${stats?.handsPlayed ?? 0} played`}
                />
                <StatCard
                  label="Chips Won"
                  value={(stats?.totalWinnings ?? 0).toLocaleString()}
                  sub="net chips"
                />
                <StatCard
                  label="Rake Paid"
                  value={(stats?.totalRakePaid ?? 0).toLocaleString()}
                  sub="chips"
                />
              </>
            )}
          </div>

          {/* Win rate bar */}
          <div className="pr-section-title">Win Rate</div>
          <div className="pr-winrate-wrap">
            <div className="pr-winrate-row">
              <span>Win Rate</span>
              <span className="pr-winrate-val">{loading ? "—" : `${winRate}%`}</span>
            </div>
            <div className="pr-bar-track">
              <div
                className="pr-bar-fill"
                style={{ width: loading ? "0%" : `${winRate}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pr-section-title">Play</div>
          <div className="pr-actions">
            <a href="/lobby" className="pr-action-btn">Enter Lobby →</a>
            <a href="/leaderboard" className="pr-action-btn outline">Leaderboard</a>
          </div>
        </main>
      </div>
    </>
  );
}
