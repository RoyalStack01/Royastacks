import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            To get started, edit the page.tsx file.
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
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