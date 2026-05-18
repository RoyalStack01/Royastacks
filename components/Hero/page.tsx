"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "upcoming" | "my" | "schedule";
type AccentColor = "pink" | "gold" | "blue" | "green";
type ButtonVariant = "pink" | "gold" | "blue" | "green";
type IconVariant = "free" | "rookie" | "pro" | "high";
type BadgeVariant = "free" | "hot" | "new" | "vip";

interface Tournament {
  id: number;
  name: string;
  type: string;
  icon: string;
  iconVariant: IconVariant;
  prize: string;
  entries: string;
  maxEntries: number;
  currentEntries: number;
  buyin: string | null;
  startsIn: string;
  accentColor: AccentColor;
  buttonVariant: ButtonVariant;
  buttonLabel: string;
  badge: BadgeVariant;
  fillPercent: number;
}

interface ScheduleRow {
  name: string;
  prize: string;
  buyin: string;
  buyinFree: boolean;
  startTime: string;
  entries: string;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const TOURNAMENTS: Tournament[] = [
  {
    id: 1,
    name: "Daily Free Roll",
    type: "No buy-in required",
    icon: "🏅",
    iconVariant: "free",
    prize: "💰 10K",
    entries: "1,200",
    maxEntries: 1200,
    currentEntries: 640,
    buyin: null,
    startsIn: "1h 30m",
    accentColor: "green",
    buttonVariant: "green",
    buttonLabel: "JOIN FREE",
    badge: "free",
    fillPercent: 53,
  },
  {
    id: 2,
    name: "Rookie Cup",
    type: "New player special",
    icon: "⭐",
    iconVariant: "rookie",
    prize: "💰 50K",
    entries: "800",
    maxEntries: 800,
    currentEntries: 238,
    buyin: "💰 10K",
    startsIn: "2h 45m",
    accentColor: "blue",
    buttonVariant: "blue",
    buttonLabel: "BUY-IN 10K",
    badge: "new",
    fillPercent: 30,
  },
  {
    id: 3,
    name: "Pro Challenge",
    type: "For experienced players",
    icon: "🔥",
    iconVariant: "pro",
    prize: "💰 200K",
    entries: "450",
    maxEntries: 450,
    currentEntries: 320,
    buyin: "💰 50K",
    startsIn: "4h 15m",
    accentColor: "pink",
    buttonVariant: "pink",
    buttonLabel: "BUY-IN 50K",
    badge: "hot",
    fillPercent: 71,
  },
  {
    id: 4,
    name: "High Roller",
    type: "Elite buy-in",
    icon: "👑",
    iconVariant: "high",
    prize: "💰 1M",
    entries: "120",
    maxEntries: 120,
    currentEntries: 22,
    buyin: "💰 200K",
    startsIn: "6h 30m",
    accentColor: "gold",
    buttonVariant: "gold",
    buttonLabel: "BUY-IN 200K",
    badge: "vip",
    fillPercent: 18,
  },
  {
    id: 5,
    name: "Midnight Madness",
    type: "Night-owl special",
    icon: "🌙",
    iconVariant: "pro",
    prize: "💰 75K",
    entries: "600",
    maxEntries: 600,
    currentEntries: 528,
    buyin: "💰 25K",
    startsIn: "45m",
    accentColor: "pink",
    buttonVariant: "pink",
    buttonLabel: "BUY-IN 25K",
    badge: "hot",
    fillPercent: 88,
  },
  {
    id: 6,
    name: "Speed Blitz",
    type: "Turbo format · 20min",
    icon: "⚡",
    iconVariant: "free",
    prize: "💰 5K",
    entries: "500",
    maxEntries: 500,
    currentEntries: 390,
    buyin: null,
    startsIn: "10m",
    accentColor: "green",
    buttonVariant: "green",
    buttonLabel: "JOIN FREE",
    badge: "free",
    fillPercent: 78,
  },
];

const SCHEDULE_ROWS: ScheduleRow[] = [
  { name: "⚡ Speed Blitz",            prize: "💰 5K",   buyin: "FREE",    buyinFree: true,  startTime: "00:10", entries: "390/500"  },
  { name: "🌙 Midnight Madness",       prize: "💰 75K",  buyin: "💰 25K",  buyinFree: false, startTime: "00:45", entries: "528/600"  },
  { name: "🏅 Daily Free Roll",        prize: "💰 10K",  buyin: "FREE",    buyinFree: true,  startTime: "01:30", entries: "640/1200" },
  { name: "⭐ Rookie Cup",             prize: "💰 50K",  buyin: "💰 10K",  buyinFree: false, startTime: "02:45", entries: "238/800"  },
  { name: "🔥 Pro Challenge",          prize: "💰 200K", buyin: "💰 50K",  buyinFree: false, startTime: "04:15", entries: "320/450"  },
  { name: "👑 High Roller",            prize: "💰 1M",   buyin: "💰 200K", buyinFree: false, startTime: "06:30", entries: "22/120"   },
  { name: "🏆 High Roller Invitational",prize:"💎 5M",   buyin: "💰 500K", buyinFree: false, startTime: "12:00", entries: "64/128"   },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const accentBarStyle: Record<AccentColor, CSSProperties> = {
  pink:  { background: "linear-gradient(90deg, #e8186d, #6b2fa0)" },
  gold:  { background: "linear-gradient(90deg, #f5b942, #d97706)" },
  blue:  { background: "linear-gradient(90deg, #3b82f6, #6366f1)" },
  green: { background: "linear-gradient(90deg, #22c55e, #16a34a)" },
};

const fillBarStyle: Record<AccentColor, CSSProperties> = {
  pink:  { background: "linear-gradient(90deg, #e8186d, #6b2fa0)" },
  gold:  { background: "linear-gradient(90deg, #f5b942, #d97706)" },
  blue:  { background: "linear-gradient(90deg, #3b82f6, #6366f1)" },
  green: { background: "linear-gradient(90deg, #22c55e, #16a34a)" },
};

const iconBg: Record<IconVariant, CSSProperties> = {
  free:   { background: "rgba(34,197,94,.15)",  border: "1px solid rgba(34,197,94,.25)"  },
  rookie: { background: "rgba(59,130,246,.15)", border: "1px solid rgba(59,130,246,.25)" },
  pro:    { background: "rgba(232,24,109,.15)", border: "1px solid rgba(232,24,109,.25)" },
  high:   { background: "rgba(245,185,66,.15)", border: "1px solid rgba(245,185,66,.25)" },
};

const badgeStyle: Record<BadgeVariant, CSSProperties> = {
  free: { background: "rgba(34,197,94,.2)",  color: "#4ade80", border: "1px solid rgba(34,197,94,.3)"  },
  hot:  { background: "rgba(232,24,109,.2)", color: "#ff4d94", border: "1px solid rgba(232,24,109,.3)" },
  new:  { background: "rgba(59,130,246,.2)", color: "#60a5fa", border: "1px solid rgba(59,130,246,.3)" },
  vip:  { background: "rgba(245,185,66,.2)", color: "#f5b942", border: "1px solid rgba(245,185,66,.3)" },
};

const badgeLabel: Record<BadgeVariant, string> = {
  free: "FREE", hot: "HOT", new: "NEW", vip: "VIP",
};

const btnStyle: Record<ButtonVariant, CSSProperties> = {
  pink: {
    background: "linear-gradient(135deg, #e8186d, #b0125a)",
    color: "#fff",
    boxShadow: "0 0 14px rgba(232,24,109,.4)",
  },
  gold: {
    background: "linear-gradient(135deg, #f5b942, #c97d0f)",
    color: "#1a0a00",
    boxShadow: "0 0 14px rgba(245,185,66,.35)",
  },
  blue: {
    background: "linear-gradient(135deg, #3b82f6, #1d4ed8)",
    color: "#fff",
    boxShadow: "0 0 14px rgba(59,130,246,.35)",
  },
  green: {
    background: "linear-gradient(135deg, #22c55e, #15803d)",
    color: "#fff",
    boxShadow: "0 0 14px rgba(34,197,94,.35)",
  },
};

// ─── Global styles injected once ─────────────────────────────────────────────

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Exo+2:wght@300;400;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Exo 2', sans-serif;
    background: #0d0610;
    color: #f0e6ff;
    min-height: 100vh;
    overflow-x: hidden;
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(155,127,191,.25); border-radius: 3px; }

  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }

  .fade-up { animation: fadeUp .45s ease both; }
  .delay-1 { animation-delay: .05s; }
  .delay-2 { animation-delay: .10s; }
  .delay-3 { animation-delay: .15s; }
  .delay-4 { animation-delay: .20s; }
  .delay-5 { animation-delay: .25s; }
  .delay-6 { animation-delay: .30s; }

  .pulse-dot { animation: pulse 1.5s infinite; }

  .t-card { transition: transform .2s, border-color .2s, box-shadow .2s; }
  .t-card:hover {
    transform: translateY(-3px);
    border-color: rgba(232,24,109,.4) !important;
    box-shadow: 0 8px 32px rgba(107,47,160,.25);
  }
  .btn-join { transition: transform .15s, box-shadow .15s; }
  .btn-join:hover { transform: translateY(-1px); filter: brightness(1.12); }
  .btn-join-lg:hover { transform: translateY(-2px); filter: brightness(1.1); }

  .schedule-table tr:hover td { background: rgba(255,255,255,.025); }

  .tab-btn { transition: all .22s; }
  .tab-btn:not(.active):hover { color: #f0e6ff; background: rgba(255,255,255,.06) !important; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      position: "sticky", top: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 28px", height: 62,
      background: "rgba(13,6,16,.92)",
      backdropFilter: "blur(18px)",
      borderBottom: "1px solid rgba(155,127,191,.15)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10,
        fontFamily: "'Rajdhani', sans-serif", fontSize: "1.35rem", fontWeight: 700, letterSpacing: ".06em" }}>
        <div style={{
          width: 34, height: 34, background: "#e8186d", borderRadius: 8,
          display: "grid", placeItems: "center", fontSize: "1.1rem",
          boxShadow: "0 0 14px rgba(232,24,109,.55)",
        }}>♠</div>
        Royal Stack
      </div>

      {/* Player */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #6b2fa0, #e8186d)",
          border: "2px solid #e8186d", display: "grid", placeItems: "center", fontSize: ".85rem",
        }}>🎭</div>
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontSize: ".85rem", fontWeight: 700 }}>Player One</div>
          <span style={{
            fontSize: ".68rem", color: "#f5b942",
            background: "rgba(245,185,66,.15)", border: "1px solid rgba(245,185,66,.3)",
            borderRadius: 4, padding: "1px 6px", display: "inline-block",
          }}>VIP 3</span>
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {[
          { ico: "💎", val: "125,000", gold: true },
          { ico: "🎟️", val: "250",     gold: false },
          { ico: "🔑", val: "5",       gold: false, pink: true },
        ].map(({ ico, val, gold, pink }) => (
          <div key={val} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(155,127,191,.15)",
            borderRadius: 20, padding: "4px 12px",
            fontSize: ".85rem", fontWeight: 600,
          }}>
            <span style={{ color: gold ? "#f5b942" : pink ? "#e8186d" : undefined }}>{ico}</span>
            {val}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ─── Featured Banner ──────────────────────────────────────────────────────────

function FeaturedBanner() {
  return (
    <div className="fade-up delay-2" style={{
      position: "relative", borderRadius: 18, overflow: "hidden",
      background: "linear-gradient(135deg, #1a0930 0%, #2d1055 50%, #180923 100%)",
      border: "1px solid rgba(232,24,109,.3)",
      padding: "36px 40px", marginBottom: 28,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow: "0 0 40px rgba(107,47,160,.25), inset 0 1px 0 rgba(255,255,255,.06)",
    }}>
      {/* badge */}
      <div style={{
        position: "absolute", top: 18, right: 18,
        background: "#e8186d", color: "#fff", fontSize: ".7rem", fontWeight: 700,
        letterSpacing: ".1em", textTransform: "uppercase",
        padding: "4px 10px", borderRadius: 6, boxShadow: "0 0 12px rgba(232,24,109,.6)",
      }}>🔥 FEATURED</div>

      {/* left */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ fontSize: ".72rem", fontWeight: 600, letterSpacing: ".15em",
          textTransform: "uppercase", color: "#f5b942", marginBottom: 8 }}>⭐ GRAND CHAMPIONSHIP</div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "2rem", fontWeight: 700,
          lineHeight: 1.1, marginBottom: 12 }}>THE HIGH ROLLER<br />INVITATIONAL</div>
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          {[
            { label: "Buy-in",    val: "💰 500K", gold: true  },
            { label: "Entries",   val: "64 / 128" },
            { label: "Starts in", val: "12h 00m"  },
          ].map(({ label, val, gold }) => (
            <div key={label}>
              <div style={{ fontSize: ".68rem", color: "#5c3f7a", textTransform: "uppercase",
                letterSpacing: ".08em", marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: ".95rem", fontWeight: 700, color: gold ? "#f5b942" : "#f0e6ff" }}>{val}</div>
            </div>
          ))}
        </div>
        <button className="btn-join-lg" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "linear-gradient(135deg, #e8186d 0%, #b0125a 100%)",
          color: "#fff", fontFamily: "'Rajdhani', sans-serif",
          fontSize: "1rem", fontWeight: 700, letterSpacing: ".08em",
          padding: "13px 30px", borderRadius: 10, border: "none", cursor: "pointer",
          boxShadow: "0 0 24px rgba(232,24,109,.5)",
        }}>🃏 Register Now</button>
      </div>

      {/* right */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "right" }}>
        <div style={{ fontSize: ".72rem", letterSpacing: ".1em", textTransform: "uppercase",
          color: "#9b7fbf", marginBottom: 4 }}>Prize Pool</div>
        <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "3.2rem", fontWeight: 800,
          color: "#f5b942", textShadow: "0 0 30px rgba(245,185,66,.5)", lineHeight: 1 }}>
          <span style={{ fontSize: "2rem" }}>💎</span> 5M
        </div>
        <div style={{ marginTop: 10, fontSize: ".8rem", color: "#9b7fbf",
          display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8186d", display: "inline-block" }} />
          Registration closing soon
        </div>
      </div>
    </div>
  );
}

// ─── Tournament Card ──────────────────────────────────────────────────────────

function TournamentCard({ tournament, delay }: { tournament: Tournament; delay: number }) {
  const { name, type, icon, iconVariant, prize, entries, currentEntries, maxEntries,
    buyin, startsIn, accentColor, buttonVariant, buttonLabel, badge, fillPercent } = tournament;

  return (
    <div className={`t-card fade-up delay-${delay}`} style={{
      background: "#1e1129",
      border: "1px solid rgba(155,127,191,.15)",
      borderRadius: 14, overflow: "hidden", cursor: "pointer", position: "relative",
    }}>
      {/* accent bar */}
      <div style={{ height: 3, ...accentBarStyle[accentColor] }} />

      <div style={{ padding: "18px 20px" }}>
        {/* top row */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              display: "grid", placeItems: "center", fontSize: "1.4rem", flexShrink: 0,
              ...iconBg[iconVariant],
            }}>{icon}</div>
            <div>
              <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "1.05rem", fontWeight: 700,
                letterSpacing: ".03em", lineHeight: 1.2, marginBottom: 4 }}>{name}</div>
              <div style={{ fontSize: ".68rem", textTransform: "uppercase", letterSpacing: ".1em",
                color: "#5c3f7a", fontWeight: 600 }}>{type}</div>
            </div>
          </div>
          <span style={{
            fontSize: ".68rem", fontWeight: 700, letterSpacing: ".06em",
            textTransform: "uppercase", padding: "3px 8px", borderRadius: 5,
            ...badgeStyle[badge],
          }}>{badgeLabel[badge]}</span>
        </div>

        {/* stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 14 }}>
          <Stat label="Prize"    value={prize}                                    gold />
          <Stat label="Entries"  value={entries}                                  />
          <Stat label={buyin ? "Buy-in" : "Players/Max"}
                value={buyin ?? `${currentEntries}/${maxEntries}`}
                gold={!!buyin} green={!buyin} />
        </div>

        {/* entry bar */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between",
            fontSize: ".62rem", color: "#5c3f7a", marginBottom: 4 }}>
            <span>Registration</span><span>{fillPercent}%</span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,.08)" }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${fillPercent}%`,
              transition: "width .6s ease", ...fillBarStyle[accentColor] }} />
          </div>
        </div>

        {/* footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          paddingTop: 14, borderTop: "1px solid rgba(155,127,191,.15)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".78rem", color: "#9b7fbf" }}>
            <span className="pulse-dot" style={{ width: 5, height: 5, borderRadius: "50%",
              background: "#e8186d", display: "inline-block" }} />
            Starts in {startsIn}
          </div>
          <button className="btn-join" style={{
            padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
            fontFamily: "'Rajdhani', sans-serif", fontSize: ".88rem", fontWeight: 700, letterSpacing: ".06em",
            ...btnStyle[buttonVariant],
          }}>{buttonLabel}</button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, gold, green }: { label: string; value: string; gold?: boolean; green?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: ".62rem", color: "#5c3f7a", textTransform: "uppercase",
        letterSpacing: ".07em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: ".88rem", fontWeight: 700,
        color: gold ? "#f5b942" : green ? "#4ade80" : "#f0e6ff" }}>{value}</div>
    </div>
  );
}

// ─── Schedule Table ───────────────────────────────────────────────────────────

function SchedulePanel() {
  return (
    <div className="fade-up">
      <SectionLabel>Full Schedule — Today</SectionLabel>
      <table className="schedule-table" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {["Tournament","Prize Pool","Buy-in","Start Time","Entries",""].map((h) => (
              <th key={h} style={{ textAlign: "left", fontSize: ".68rem", textTransform: "uppercase",
                letterSpacing: ".1em", color: "#5c3f7a", fontWeight: 700, padding: "0 16px 10px" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCHEDULE_ROWS.map((row) => (
            <tr key={row.name}>
              <td style={{ padding: "12px 16px", fontSize: ".85rem", borderTop: "1px solid rgba(155,127,191,.15)", fontWeight: 600 }}>{row.name}</td>
              <td style={{ padding: "12px 16px", fontSize: ".85rem", borderTop: "1px solid rgba(155,127,191,.15)", color: "#f5b942", fontWeight: 700 }}>{row.prize}</td>
              <td style={{ padding: "12px 16px", fontSize: ".85rem", borderTop: "1px solid rgba(155,127,191,.15)" }}>
                {row.buyinFree ? <span style={{ color: "#4ade80", fontWeight: 700 }}>FREE</span> : row.buyin}
              </td>
              <td style={{ padding: "12px 16px", fontSize: ".85rem", borderTop: "1px solid rgba(155,127,191,.15)", color: "#9b7fbf" }}>{row.startTime}</td>
              <td style={{ padding: "12px 16px", fontSize: ".85rem", borderTop: "1px solid rgba(155,127,191,.15)", color: "#9b7fbf" }}>{row.entries}</td>
              <td style={{ padding: "12px 16px", borderTop: "1px solid rgba(155,127,191,.15)" }}>
                <button style={{
                  padding: "5px 14px", borderRadius: 6, border: "1px solid rgba(232,24,109,.3)",
                  cursor: "pointer", fontFamily: "'Rajdhani', sans-serif", fontSize: ".78rem", fontWeight: 700,
                  letterSpacing: ".05em", background: "rgba(232,24,109,.15)", color: "#e8186d",
                }}>Join</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── My Tournaments ───────────────────────────────────────────────────────────

function MyTournamentsPanel({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "#5c3f7a" }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 16 }}>🏆</div>
      <h3 style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "1.4rem", marginBottom: 8, color: "#9b7fbf" }}>
        No Active Tournaments
      </h3>
      <p style={{ fontSize: ".85rem", lineHeight: 1.6 }}>
        You haven't registered for any tournaments yet.<br />Browse upcoming events and join the action!
      </p>
      <button className="btn-join-lg" onClick={onBrowse} style={{
        marginTop: 20, display: "inline-flex", alignItems: "center", gap: 8,
        background: "linear-gradient(135deg, #e8186d 0%, #b0125a 100%)",
        color: "#fff", fontFamily: "'Rajdhani', sans-serif",
        fontSize: "1rem", fontWeight: 700, letterSpacing: ".08em",
        padding: "13px 30px", borderRadius: 10, border: "none", cursor: "pointer",
        boxShadow: "0 0 24px rgba(232,24,109,.5)",
      }}>Browse Tournaments</button>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{
      fontFamily: "'Rajdhani', sans-serif", fontSize: "1rem", fontWeight: 700,
      letterSpacing: ".12em", textTransform: "uppercase", color: "#9b7fbf",
      marginBottom: 14, display: "flex", alignItems: "center", gap: 10,
    }}>
      {children}
      <span style={{ flex: 1, height: 1, background: "rgba(155,127,191,.15)" }} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("upcoming");

  const tabs: { id: TabId; label: string }[] = [
    { id: "upcoming", label: "Upcoming"        },
    { id: "my",       label: "My Tournaments"  },
    { id: "schedule", label: "Schedule"        },
  ];

  return (
    <>
      {/* Inject global CSS once */}
      <style>{GLOBAL_CSS}</style>

      {/* Background atmosphere */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        background: `
          radial-gradient(ellipse 80% 50% at 20% 10%,  rgba(107,47,160,.35) 0%, transparent 60%),
          radial-gradient(ellipse 60% 40% at 80% 80%,  rgba(232,24,109,.20) 0%, transparent 55%),
          radial-gradient(ellipse 50% 60% at 50% 50%,  rgba(22,13,30,.80)   0%, transparent 100%)
        `,
      }} />

      <Navbar />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Page header */}
        <div className="fade-up" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <div style={{ fontFamily: "'Rajdhani', sans-serif", fontSize: "2.4rem", fontWeight: 700, letterSpacing: ".04em", lineHeight: 1 }}>
              TOURNA<span style={{ color: "#e8186d" }}>MENTS</span>
            </div>
            <div style={{ color: "#9b7fbf", fontSize: ".85rem", marginTop: 4 }}>
              Compete, climb, conquer — biggest prizes in poker
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[{ dot: true, label: "4 Live Now" }, { label: "🏆 Season 12" }].map(({ dot, label }) => (
              <div key={label} style={{
                background: "rgba(255,255,255,.04)", border: "1px solid rgba(155,127,191,.15)",
                borderRadius: 20, padding: "6px 14px", fontSize: ".78rem", color: "#9b7fbf",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />}
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="fade-up delay-1" style={{
          display: "flex", gap: 4,
          background: "rgba(255,255,255,.04)", border: "1px solid rgba(155,127,191,.15)",
          borderRadius: 12, padding: 4, width: "fit-content", marginBottom: 28,
        }}>
          {tabs.map(({ id, label }) => {
            const isActive = activeTab === id;
            return (
              <button key={id} className={`tab-btn${isActive ? " active" : ""}`}
                onClick={() => setActiveTab(id)}
                style={{
                  padding: "8px 24px", borderRadius: 9,
                  fontFamily: "'Rajdhani', sans-serif", fontSize: ".95rem", fontWeight: 600, letterSpacing: ".05em",
                  cursor: "pointer", border: "none",
                  background: isActive ? "#e8186d" : "transparent",
                  color: isActive ? "#fff" : "#9b7fbf",
                  boxShadow: isActive ? "0 0 18px rgba(232,24,109,.45)" : "none",
                }}>
                {label}
              </button>
            );
          })}
        </div>

        {/* ── UPCOMING ── */}
        {activeTab === "upcoming" && (
          <>
            <FeaturedBanner />
            <SectionLabel>All Tournaments</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14, marginBottom: 36 }}>
              {TOURNAMENTS.map((t, i) => (
                <TournamentCard key={t.id} tournament={t} delay={Math.min(i + 2, 6)} />
              ))}
            </div>
          </>
        )}

        {/* ── MY TOURNAMENTS ── */}
        {activeTab === "my" && (
          <MyTournamentsPanel onBrowse={() => setActiveTab("upcoming")} />
        )}

        {/* ── SCHEDULE ── */}
        {activeTab === "schedule" && <SchedulePanel />}

      </div>
    </>
  );
}