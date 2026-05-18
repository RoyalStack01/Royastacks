"use client";

import { useState, type ReactElement } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type TabId = "stats" | "cues" | "trophies" | "achievements";

interface StatRow {
  label: string;
  value: string;
  color?: "gold" | "pink" | "default";
}

interface Achievement {
  icon: string;
  name: string;
  desc: string;
  style: "gold" | "pink" | "purple";
}

interface Trophy {
  icon: string;
  name: string;
  desc: string;
  earned: boolean;
}

interface BigAchievement {
  icon: string;
  name: string;
  desc: string;
  progress: number; // 0–100
  earned: boolean;
}

interface Cue {
  emoji: string;
  name: string;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const STAT_ROWS: StatRow[] = [
  { label: "Highest Chip Stack", value: "1.25M", color: "gold" },
  { label: "Hands Played",       value: "850",   color: "default" },
  { label: "Tournaments Won",    value: "12",    color: "pink" },
  { label: "Win Streak (Best)",  value: "8",     color: "pink" },
  { label: "Most Chips Won",     value: "750K",  color: "gold" },
];

const RECENT_ACHIEVEMENTS: Achievement[] = [
  { icon: "🏆", name: "Tournament Winner", desc: "Claimed 1st place in a tournament", style: "gold" },
  { icon: "🂡", name: "Royal Flush Win",   desc: "Won a hand with a Royal Flush",     style: "pink" },
  { icon: "👑", name: "100 Hands Played", desc: "Milestone: 100 hands at the table", style: "purple" },
];

const CUES: Cue[] = [
  { emoji: "🃏", name: "Classic"   },
  { emoji: "🔥", name: "Fire"      },
  { emoji: "💎", name: "Diamond"   },
  { emoji: "⚡", name: "Thunder"   },
  { emoji: "🌙", name: "Midnight"  },
  { emoji: "🎯", name: "Precision" },
  { emoji: "🏅", name: "Champion"  },
  { emoji: "🎭", name: "Joker"     },
];

const TROPHIES: Trophy[] = [
  { icon: "🏆", name: "Grand Champion", desc: "Won 10+ tournaments",    earned: true  },
  { icon: "🃏", name: "Poker Ace",      desc: "500+ hands played",      earned: true  },
  { icon: "💰", name: "High Roller",    desc: "Chip stack over 1M",     earned: true  },
  { icon: "👑", name: "VIP Legend",     desc: "Reach VIP Level 10",     earned: false },
  { icon: "🎰", name: "All In King",    desc: "Win 5 all-in hands",     earned: false },
  { icon: "🌟", name: "Royal Blood",    desc: "10M total winnings",     earned: false },
];

const BIG_ACHIEVEMENTS: BigAchievement[] = [
  { icon: "🏆", name: "Tournament Winner", desc: "Win your first tournament",      progress: 100, earned: true  },
  { icon: "🂡", name: "Royal Flush Win",   desc: "Land a Royal Flush",             progress: 100, earned: true  },
  { icon: "👑", name: "100 Hands Played", desc: "Play 100 hands",                 progress: 100, earned: true  },
  { icon: "🌟", name: "1000 Hands",       desc: "Play 1000 hands — 850/1000",     progress: 85,  earned: false },
  { icon: "💎", name: "Diamond Hands",    desc: "Win streak of 12 — 8/12",        progress: 67,  earned: false },
  { icon: "🔥", name: "On Fire",          desc: "Win 20 tournaments — 12/20",     progress: 60,  earned: false },
];

// ─── Styles (CSS-in-JS via <style> injection) ─────────────────────────────────

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-deep:       #0d0714;
    --bg-card:       #16091f;
    --bg-surface:    #1e0f2b;
    --bg-raised:     #27133a;
    --accent-pink:   #e8196a;
    --accent-gold:   #c9933a;
    --accent-purple: #7b3fa0;
    --text-primary:  #f0e6ff;
    --text-muted:    #8a6fa8;
    --border:        rgba(123,63,160,0.3);
    --border-bright: rgba(232,25,106,0.4);
    --gold-bar:      linear-gradient(90deg,#c9933a,#f5d07a,#c9933a);
    --pink-bar:      linear-gradient(90deg,#e8196a,#ff7ab0,#e8196a);
  }

  body {
    font-family: 'Rajdhani', sans-serif;
    background: var(--bg-deep);
    color: var(--text-primary);
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed; inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 15% 20%, rgba(232,25,106,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 50% 60% at 85% 80%, rgba(123,63,160,0.15) 0%, transparent 60%),
      radial-gradient(ellipse 40% 40% at 50% 50%, rgba(201,147,58,0.05) 0%, transparent 70%);
    pointer-events: none;
    z-index: 0;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Navbar() {
  return (
    <nav style={{
      position: "relative", zIndex: 10,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 24px", height: 64,
      background: "rgba(13,7,20,0.95)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(12px)",
    }}>
      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: "var(--accent-pink)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>♠</div>
        <span style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 16, fontWeight: 700,
          color: "var(--text-primary)", letterSpacing: 1,
        }}>Royal Stack</span>
      </div>

      {/* Player info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg,#7b3fa0,#e8196a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 700,
          border: "2px solid var(--accent-pink)",
        }}>P1</div>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Player One</span>
        <span style={{
          padding: "2px 10px", borderRadius: 20,
          background: "linear-gradient(135deg,#7b3fa0,#5a2d80)",
          fontSize: 11, fontWeight: 700, letterSpacing: 1,
          color: "#e0c8ff",
        }}>VIP 3</span>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {[
          { dot: "var(--accent-pink)", shadow: "var(--accent-pink)", label: "125,000" },
          { dot: "#aaa",               shadow: "transparent",         label: "250" },
          { dot: "var(--accent-gold)", shadow: "var(--accent-gold)",  label: "5" },
        ].map(({ dot, shadow, label }) => (
          <div key={label} style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "5px 14px", borderRadius: 20,
            background: "rgba(30,15,43,0.8)",
            border: "1px solid var(--border)",
            fontSize: 13, fontWeight: 600,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%",
              background: dot, boxShadow: `0 0 6px ${shadow}`,
            }} />
            {label}
          </div>
        ))}
      </div>
    </nav>
  );
}

// ── Hero card ─────────────────────────────────────────────────────────────────

function HeroCard() {
  return (
    <div style={{
      background: "linear-gradient(135deg, var(--bg-card) 0%, #1a0827 100%)",
      border: "1px solid var(--border-bright)",
      borderRadius: 16,
      padding: 28,
      display: "flex", gap: 28, alignItems: "flex-start",
      boxShadow: "0 0 40px rgba(232,25,106,0.08), 0 8px 32px rgba(0,0,0,0.5)",
      marginBottom: 16,
      animation: "fadeUp .5s ease both",
    }}>
      {/* Avatar */}
      <div style={{ position: "relative", flexShrink: 0 }}>
        <div style={{
          width: 90, height: 90, borderRadius: 14,
          background: "linear-gradient(145deg,#2a1040,#3d1a5a)",
          border: "2px solid var(--accent-pink)",
          overflow: "hidden",
          boxShadow: "0 0 20px rgba(232,25,106,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 40,
        }}>🕶️</div>
        <div style={{
          position: "absolute", bottom: -8, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg,#c9933a,#f5d07a)",
          color: "#1a0a00",
          fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
          padding: "2px 10px", borderRadius: 10,
          whiteSpace: "nowrap",
        }}>⭐ LVL 35</div>
      </div>

      {/* Info */}
      <div style={{ flex: 1 }}>
        {/* Name row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
          <span style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 22, fontWeight: 700,
            color: "var(--text-primary)", letterSpacing: 1,
          }}>Player One</span>
          <button style={{
            padding: "4px 12px", borderRadius: 6,
            background: "transparent",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            fontSize: 12, fontWeight: 600,
            cursor: "pointer", letterSpacing: 0.5,
            fontFamily: "'Rajdhani', sans-serif",
          }}>✏ Edit</button>
        </div>

        {/* XP bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ color: "var(--accent-gold)", fontSize: 18 }}>★</span>
          <div style={{
            flex: 1, maxWidth: 200, height: 6, borderRadius: 3,
            background: "var(--bg-raised)", overflow: "hidden",
          }}>
            <div style={{
              width: "50%", height: "100%", borderRadius: 3,
              background: "var(--gold-bar)",
              boxShadow: "0 0 8px rgba(201,147,58,0.6)",
            }} />
          </div>
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>1250 / 2500 XP</span>
        </div>

        {/* Quick stats */}
        <div style={{ display: "flex", gap: 24, marginTop: 14, flexWrap: "wrap" }}>
          {[
            { val: "850",  label: "Hands",       color: "var(--text-primary)" },
            { val: "12",   label: "Tourney Wins", color: "var(--text-primary)" },
            { val: "8",    label: "Best Streak",  color: "var(--accent-pink)"  },
            { val: "750K", label: "Most Chips",   color: "var(--accent-gold)"  },
          ].map(({ val, label, color }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 20, fontWeight: 700, color,
              }}>{val}</div>
              <div style={{
                fontSize: 11, color: "var(--text-muted)",
                fontWeight: 600, letterSpacing: 0.5,
                textTransform: "uppercase",
              }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Side panel */}
      <div style={{ flexShrink: 0, textAlign: "right" }}>
        <div style={{
          fontSize: 11, color: "var(--text-muted)",
          fontWeight: 600, letterSpacing: 1,
          textTransform: "uppercase", marginBottom: 4,
        }}>Total Winnings</div>
        <div style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 28, fontWeight: 900,
          color: "var(--accent-gold)",
          display: "flex", alignItems: "center", gap: 6,
          justifyContent: "flex-end",
          textShadow: "0 0 20px rgba(201,147,58,0.5)",
        }}>
          <span style={{ fontSize: 22 }}>🪙</span> 2.45M
        </div>

        <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
          Games Won: <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>320 of 560</span>
        </div>

        {/* Win Rate */}
        <div style={{ marginTop: 12 }}>
          <div style={{
            fontSize: 11, color: "var(--text-muted)",
            textTransform: "uppercase", letterSpacing: 1,
            marginBottom: 4, fontWeight: 600,
          }}>Win Rate</div>
          <div style={{
            width: 120, height: 8, borderRadius: 4,
            background: "var(--bg-raised)", overflow: "hidden", marginBottom: 4,
          }}>
            <div style={{
              width: "57%", height: "100%", borderRadius: 4,
              background: "var(--pink-bar)",
              boxShadow: "0 0 8px rgba(232,25,106,0.5)",
            }} />
          </div>
          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 16, fontWeight: 700,
            color: "var(--accent-pink)",
          }}>57%</div>
        </div>
      </div>
    </div>
  );
}

// ── Tab Bar ───────────────────────────────────────────────────────────────────

const TABS: { id: TabId; label: string }[] = [
  { id: "stats",        label: "Stats"        },
  { id: "cues",         label: "Cues"         },
  { id: "trophies",     label: "Trophies"     },
  { id: "achievements", label: "Achievements" },
];

interface TabBarProps {
  active: TabId;
  onChange: (id: TabId) => void;
}

function TabBar({ active, onChange }: TabBarProps) {
  return (
    <div style={{
      display: "flex", gap: 2,
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderRadius: "12px 12px 0 0",
      overflow: "hidden",
      animation: "fadeUp .5s .1s ease both",
    }}>
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          style={{
            flex: 1, padding: "14px 0",
            background: "transparent",
            border: "none",
            color: active === id ? "var(--text-primary)" : "var(--text-muted)",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 14, fontWeight: 700,
            letterSpacing: 1, textTransform: "uppercase",
            cursor: "pointer",
            position: "relative",
            transition: "color .2s",
          }}
        >
          {label}
          {/* Active underline */}
          <span style={{
            position: "absolute", bottom: 0,
            left: active === id ? "15%" : "50%",
            right: active === id ? "15%" : "50%",
            height: 2,
            background: "linear-gradient(90deg,#e8196a,#ff7ab0,#e8196a)",
            transition: "left .25s, right .25s",
            display: "block",
          }} />
        </button>
      ))}
    </div>
  );
}

// ── Stats Panel ───────────────────────────────────────────────────────────────

function StatsPanel() {
  const valueColor = (c?: "gold" | "pink" | "default") =>
    c === "gold" ? "var(--accent-gold)" : c === "pink" ? "var(--accent-pink)" : "var(--text-primary)";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
      {/* Stat rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {STAT_ROWS.map((row) => (
          <div key={row.label} style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            padding: "12px 16px",
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            borderRadius: 10,
          }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600, letterSpacing: 0.5 }}>
              {row.label}
            </span>
            <span style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 15, fontWeight: 700,
              color: valueColor(row.color),
            }}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Recent achievements */}
      <div>
        <h3 style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 14, fontWeight: 600,
          color: "var(--text-muted)",
          letterSpacing: 1, textTransform: "uppercase",
          marginBottom: 14,
        }}>Recent Achievements</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {RECENT_ACHIEVEMENTS.map((a) => {
            const bg = a.style === "gold"
              ? "rgba(201,147,58,0.15)" : a.style === "pink"
              ? "rgba(232,25,106,0.12)" : "rgba(123,63,160,0.15)";
            const bd = a.style === "gold"
              ? "rgba(201,147,58,0.3)" : a.style === "pink"
              ? "rgba(232,25,106,0.3)" : "rgba(123,63,160,0.3)";
            return (
              <div key={a.name} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px",
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
              }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, flexShrink: 0,
                  background: bg, border: `1px solid ${bd}`,
                }}>{a.icon}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{a.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>{a.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Cues Panel ────────────────────────────────────────────────────────────────

function CuesPanel() {
  const [selected, setSelected] = useState<string>("Classic");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {CUES.map((cue) => {
        const isSelected = cue.name === selected;
        return (
          <div
            key={cue.name}
            onClick={() => setSelected(cue.name)}
            style={{
              background: "var(--bg-surface)",
              border: `2px solid ${isSelected ? "var(--accent-pink)" : "var(--border)"}`,
              borderRadius: 12,
              padding: "16px 12px",
              textAlign: "center",
              cursor: "pointer",
              boxShadow: isSelected ? "0 0 14px rgba(232,25,106,0.2)" : "none",
              transition: "all .2s",
            }}
          >
            <span style={{ fontSize: 28, display: "block", marginBottom: 8 }}>{cue.emoji}</span>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>{cue.name}</div>
          </div>
        );
      })}
    </div>
  );
}

// ── Trophies Panel ────────────────────────────────────────────────────────────

function TrophiesPanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
      {TROPHIES.map((t) => (
        <div
          key={t.name}
          style={{
            background: t.earned
              ? "linear-gradient(135deg,rgba(201,147,58,0.08),var(--bg-surface))"
              : "var(--bg-surface)",
            border: `1px solid ${t.earned ? "rgba(201,147,58,0.4)" : "var(--border)"}`,
            borderRadius: 12,
            padding: "20px 14px",
            textAlign: "center",
            opacity: t.earned ? 1 : 0.35,
            filter: t.earned ? "none" : "grayscale(1)",
            transition: "transform .25s, box-shadow .25s",
          }}
        >
          <span style={{ fontSize: 36, display: "block", marginBottom: 10 }}>{t.icon}</span>
          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>{t.name}</div>
          <div style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{t.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Achievements Panel ────────────────────────────────────────────────────────

function AchievementsPanel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      {BIG_ACHIEVEMENTS.map((a) => (
        <div
          key={a.name}
          style={{
            background: "var(--bg-surface)",
            border: `1px solid ${a.earned ? "rgba(232,25,106,0.35)" : "var(--border)"}`,
            borderRadius: 12,
            padding: 16,
            display: "flex", alignItems: "center", gap: 14,
          }}
        >
          <span style={{ fontSize: 30, flexShrink: 0, opacity: a.earned ? 1 : 0.4 }}>{a.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 14, fontWeight: 700,
              color: a.earned ? "var(--text-primary)" : "var(--text-muted)",
              marginBottom: 2,
            }}>{a.name}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500, marginBottom: 6 }}>{a.desc}</div>
            <div style={{
              width: "100%", height: 4, borderRadius: 2,
              background: "var(--bg-raised)", overflow: "hidden",
            }}>
              <div style={{
                width: `${a.progress}%`, height: "100%", borderRadius: 2,
                background: "linear-gradient(90deg,#e8196a,#ff7ab0,#e8196a)",
              }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Tab content router ────────────────────────────────────────────────────────

function TabContent({ active }: { active: TabId }) {
  const panels: Record<TabId, ReactElement> = {
    stats:        <StatsPanel />,
    cues:         <CuesPanel />,
    trophies:     <TrophiesPanel />,
    achievements: <AchievementsPanel />,
  };

  return (
    <div style={{
      background: "var(--bg-card)",
      border: "1px solid var(--border)",
      borderTop: "none",
      borderRadius: "0 0 16px 16px",
      padding: 24,
      animation: "fadeUp .5s .15s ease both",
    }}>
      {panels[active]}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function PlayerProfile() {
  const [activeTab, setActiveTab] = useState<TabId>("stats");

  return (
    <>
      {/* Inject global CSS */}
      <style>{CSS}</style>

      <Navbar />

      <div style={{
        position: "relative", zIndex: 5,
        maxWidth: 900, margin: "24px auto",
        padding: "0 20px 40px",
      }}>
        {/* Back */}
        <div style={{ paddingBottom: 16 }}>
          <button style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "8px 18px", borderRadius: 8,
            background: "var(--bg-surface)",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            fontFamily: "'Rajdhani', sans-serif",
            fontSize: 14, fontWeight: 600,
            cursor: "pointer", letterSpacing: 0.5,
          }}>← Back</button>
        </div>

        <HeroCard />

        <TabBar active={activeTab} onChange={setActiveTab} />
        <TabContent active={activeTab} />
      </div>
    </>
  );
}