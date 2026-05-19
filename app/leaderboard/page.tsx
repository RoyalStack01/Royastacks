"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getLeaderboard } from "../../lib/server";
import { walletEmoji } from "../../lib/avatar";

const STORAGE_KEY_TOKEN  = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";

type Entry = {
  playerId: string;
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
};

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function winRate(won: number, played: number) {
  if (!played) return "—";
  return `${Math.round((won / played) * 100)}%`;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardPage() {
  const router = useRouter();
  const [token, setToken]     = useState("");
  const [wallet, setWallet]   = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const w = sessionStorage.getItem(STORAGE_KEY_WALLET);
    if (!t || !w) { router.replace("/connect"); return; }
    setToken(t);
    setWallet(w);
    fetchBoard(t);
  }, []);

  async function fetchBoard(t: string) {
    try {
      const data = await getLeaderboard(t, 20);
      setEntries(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }

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
        }

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
        .lb-nav {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .lb-nav a {
          font-family: 'Electrolize', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: color 0.2s;
        }
        .lb-nav a:hover { color: #FF0A54; }
        .lb-nav a.active { color: #FF0A54; }
        .lb-wallet {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
        }

        .lb-main {
          max-width: 900px;
          margin: 0 auto;
          padding: 48px 24px 80px;
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
          margin-bottom: 8px;
        }
        .lb-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          margin-bottom: 40px;
        }

        .lb-error {
          padding: 14px 18px;
          background: rgba(255,10,84,0.08);
          border: 1px solid rgba(255,10,84,0.25);
          border-radius: 4px;
          color: #FF0A54;
          font-size: 12px;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        /* Table */
        .lb-table-wrap {
          overflow-x: auto;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        thead th {
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          padding: 10px 16px;
          text-align: left;
          border-bottom: 1px solid rgba(255,10,84,0.12);
        }
        thead th.right { text-align: right; }
        tbody tr {
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s;
        }
        tbody tr:hover { background: rgba(255,10,84,0.04); }
        tbody tr.me { background: rgba(255,10,84,0.07); }
        tbody tr.me td { color: #fff; }
        tbody td {
          padding: 14px 16px;
          font-size: 13px;
          color: rgba(255,255,255,0.7);
          vertical-align: middle;
        }
        tbody td.right { text-align: right; }

        .rank-cell {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          width: 48px;
        }
        .medal { font-size: 16px; }
        .addr-cell {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          letter-spacing: 1px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .player-emoji {
          font-size: 20px;
          line-height: 1;
        }
        .you-badge {
          display: inline-block;
          margin-left: 8px;
          font-size: 9px;
          letter-spacing: 2px;
          padding: 2px 7px;
          background: rgba(255,10,84,0.15);
          border: 1px solid rgba(255,10,84,0.4);
          color: #FF0A54;
          border-radius: 2px;
          vertical-align: middle;
          font-family: 'Audiowide', sans-serif;
        }
        .winrate-cell {
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
        }
        .chips-cell {
          font-family: 'Share Tech Mono', monospace;
          font-size: 13px;
          font-weight: 600;
          color: #FF0A54;
        }
        .chips-cell.neg { color: rgba(255,255,255,0.3); }

        /* Skeleton */
        .skel-row td { padding: 14px 16px; }
        .skel-line {
          height: 10px;
          border-radius: 3px;
          background: rgba(255,255,255,0.05);
          animation: pulse 1.4s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.9} }

        /* Profile CTA */
        .lb-profile-cta {
          margin-top: 40px;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          background: rgba(255,10,84,0.05);
          border: 1px solid rgba(255,10,84,0.15);
          border-radius: 4px;
        }
        .lb-profile-cta-text {
          flex: 1;
          font-size: 13px;
          color: rgba(255,255,255,0.5);
          letter-spacing: 0.5px;
        }
        .lb-profile-btn {
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 11px 22px;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          transition: box-shadow 0.2s;
        }
        .lb-profile-btn:hover { box-shadow: 0 0 24px rgba(255,10,84,0.5); }

        @media (max-width: 600px) {
          .lb-topbar { padding: 14px 16px; }
          .lb-nav { gap: 12px; }
          .hide-sm { display: none; }
        }
      `}</style>

      <div className="lb-root">
        <div className="lb-topbar">
          <a href="/" className="lb-logo">ROYAL STACKS</a>
          <div className="lb-nav">
            <a href="/lobby">Lobby</a>
            <a href="/leaderboard" className="active">Leaderboard</a>
            <a href="/profile">Profile</a>
          </div>
          <span className="lb-wallet">{wallet ? shortAddr(wallet) : ""}</span>
        </div>

        <main className="lb-main">
          <div className="lb-eyebrow">Season 1 · Mezo Testnet</div>
          <h1 className="lb-title">LEADERBOARD</h1>
          <p className="lb-sub">Top players ranked by total chips won</p>

          {error && <div className="lb-error">{error}</div>}

          <div className="lb-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Player</th>
                  <th className="right hide-sm">Hands</th>
                  <th className="right hide-sm">Win Rate</th>
                  <th className="right">Chips Won</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="skel-row">
                      <td><div className="skel-line" style={{ width: 24 }} /></td>
                      <td><div className="skel-line" style={{ width: "60%" }} /></td>
                      <td className="hide-sm"><div className="skel-line" style={{ width: 40, marginLeft: "auto" }} /></td>
                      <td className="hide-sm"><div className="skel-line" style={{ width: 50, marginLeft: "auto" }} /></td>
                      <td><div className="skel-line" style={{ width: 70, marginLeft: "auto" }} /></td>
                    </tr>
                  ))
                ) : entries.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.2)", fontFamily: "'Share Tech Mono', monospace", fontSize: 12, letterSpacing: 2 }}>
                      NO HANDS RECORDED YET
                    </td>
                  </tr>
                ) : (
                  entries.map((e, i) => {
                    const isMe = e.playerId?.toLowerCase() === wallet?.toLowerCase();
                    return (
                      <tr key={e.playerId} className={isMe ? "me" : ""}>
                        <td className="rank-cell">
                          {i < 3 ? <span className="medal">{MEDALS[i]}</span> : i + 1}
                        </td>
                        <td className="addr-cell">
                          <span className="player-emoji">{walletEmoji(e.playerId)}</span>
                          {shortAddr(e.playerId)}
                          {isMe && <span className="you-badge">YOU</span>}
                        </td>
                        <td className="right hide-sm">{e.handsPlayed ?? 0}</td>
                        <td className="right hide-sm winrate-cell">
                          {winRate(e.handsWon ?? 0, e.handsPlayed ?? 0)}
                        </td>
                        <td className={`right chips-cell${(e.totalWinnings ?? 0) < 0 ? " neg" : ""}`}>
                          {(e.totalWinnings ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="lb-profile-cta">
            <div className="lb-profile-cta-text">See your detailed stats, hand history, and win rate</div>
            <a href="/profile" className="lb-profile-btn">My Profile →</a>
          </div>
        </main>
      </div>
    </>
  );
}
