"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactNode,
} from "react";

/* ════════════════════════════════════════════════
   TYPES
════════════════════════════════════════════════ */
type ModalType = "play" | "tournament" | "private" | "vip";
type CurrencyType = "chips" | "cash" | "tickets";

interface ModalData {
  title: string;
  body: string;
  action: string;
}

interface MissionRow {
  icon: string;
  name: string;
  progress: number; // 0–100
  label: string;
}

const MODAL_MAP: Record<ModalType, ModalData> = {
  play: {
    title: "Play Now",
    body: "Jump into any live table and play Texas Hold'em instantly. Stakes from micro to high-roller.",
    action: "Find a Table",
  },
  tournament: {
    title: "Tournaments",
    body: "2 live tournaments running now with massive prize pools. Register before they fill up!",
    action: "Register Now",
  },
  private: {
    title: "Private Table",
    body: "Create your own table and invite friends. Set your own rules, stakes, and blinds.",
    action: "Create Table",
  },
  vip: {
    title: "VIP Club",
    body: "Unlock exclusive tables, weekly chip bonuses, priority support, and luxury tournament invites.",
    action: "Join VIP Club",
  },
};

const MISSIONS: MissionRow[] = [
  { icon: "🃏", name: "Win 2 hands", progress: 50, label: "1/2" },
  { icon: "🏆", name: "Play 3 hands", progress: 67, label: "2/3" },
  { icon: "💰", name: "Win big pot", progress: 0, label: "0/1" },
];

const SPIN_PRIZES = [
  "💎 +10,000 Chips!",
  "🏆 Tournament Ticket!",
  "♠ VIP x5!",
  "🎁 Mystery Box!",
  "👑 Royal Bonus!",
];

/* ════════════════════════════════════════════════
   HELPERS
════════════════════════════════════════════════ */
function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function formatTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatBonus(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  return `${pad(h)}h ${pad(m)}m`;
}

/* ════════════════════════════════════════════════
   SUB-COMPONENTS
════════════════════════════════════════════════ */

/** Ripple effect on click */
function useRipple() {
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    const btn = ref.current;
    if (!btn) return;
    const r = document.createElement("span");
    r.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const sz = Math.max(rect.width, rect.height);
    r.style.cssText = `width:${sz}px;height:${sz}px;left:${
      e.clientX - rect.left - sz / 2
    }px;top:${e.clientY - rect.top - sz / 2}px;`;
    btn.style.position = "relative";
    btn.appendChild(r);
    setTimeout(() => r.remove(), 620);
  }, []);

  return { ref, handleClick };
}

interface RippleBtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children: ReactNode;
}

function RippleBtn({ className = "", children, onClick, ...rest }: RippleBtnProps) {
  const { ref, handleClick } = useRipple();

  return (
    <button
      ref={ref}
      className={className}
      onClick={(e) => {
        handleClick(e);
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </button>
  );
}

/* ─── Particles ─────────────────────────────── */
function Particles() {
  const colors = [
    "rgba(255,45,120,0.18)",
    "rgba(255,100,160,0.12)",
    "rgba(200,20,80,0.15)",
    "rgba(180,60,255,0.1)",
    "rgba(255,255,255,0.05)",
  ];

  const particles = useMemo(
    () =>
      colors.flatMap((color, ci) =>
        Array.from({ length: 6 }, (_, i) => {
          const sz = Math.random() * 60 + 14;
          return {
            id: `${ci}-${i}`,
            sz,
            left: `${Math.random() * 100}%`,
            bottom: `${Math.random() * 20}%`,
            color,
            duration: `${Math.random() * 14 + 8}s`,
            delay: `${Math.random() * 12}s`,
            blur: `${Math.random() * 8 + 4}px`,
          };
        })
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable particle field per mount
    []
  );

  return (
    <div className="particles">
      {particles.map((p) => (
        <span
          key={p.id}
          style={{
            width: p.sz,
            height: p.sz,
            left: p.left,
            bottom: p.bottom,
            background: p.color,
            animationDuration: p.duration,
            animationDelay: p.delay,
            filter: `blur(${p.blur})`,
          }}
        />
      ))}
    </div>
  );
}

/* ─── Card ───────────────────────────────────── */
interface CardProps {
  idx: number;
  state: number;
  emoji: string;
  title: string;
  sub: string;
  pill?: ReactNode;
  btnLabel: string;
  modalType: ModalType;
  onClick: (idx: number) => void;
  onModalOpen: (type: ModalType, e: MouseEvent) => void;
}

function Card({
  idx,
  state,
  emoji,
  title,
  sub,
  pill,
  btnLabel,
  modalType,
  onClick,
  onModalOpen,
}: CardProps) {
  return (
    <div
      className={`c-card state-${state}`}
      data-idx={idx}
      onClick={() => onClick(idx)}
    >
      <div className="c-card-inner">
        <div className="c-shine" />
        <div className="c-shimmer" />
        <div className="c-emoji">{emoji}</div>
        <div className="c-title">{title}</div>
        <div className="c-sub">{sub}</div>
        {pill}
        <RippleBtn
          className="c-btn"
          onClick={(e) => onModalOpen(modalType, e)}
        >
          {btnLabel}
        </RippleBtn>
      </div>
    </div>
  );
}

/* ─── Modal ──────────────────────────────────── */
interface ModalProps {
  open: boolean;
  data: ModalData | null;
  onClose: () => void;
  onAction: (actionLabel: string) => void;
}

function Modal({ open, data, onClose, onAction }: ModalProps) {
  function overlayClick(e: MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div
      className={`overlay${open ? " open" : ""}`}
      onClick={overlayClick}
    >
      <div className="modal">
        <button className="modal-close" onClick={onClose}>
          ✕
        </button>
        <h2>{data?.title}</h2>
        <p>{data?.body}</p>
        <div className="modal-btns">
          <RippleBtn
            className="m-btn go"
            onClick={() => data && onAction(data.action)}
          >
            {data?.action ?? "Let's Go!"}
          </RippleBtn>
          <RippleBtn className="m-btn cancel" onClick={onClose}>
            Cancel
          </RippleBtn>
        </div>
      </div>
    </div>
  );
}

/* ─── Toast ──────────────────────────────────── */
interface ToastProps {
  message: string;
  visible: boolean;
}

function Toast({ message, visible }: ToastProps) {
  return (
    <div className={`toast${visible ? " show" : ""}`}>{message}</div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════ */
export default function RoyalStackLobby() {
  /* — Currency state — */
  const [chips, setChips] = useState(125000);
  const [cash, setCash] = useState(250);
  const [tickets, setTickets] = useState(5);

  /* — Carousel state — */
  const N = 4;
  const [cur, setCur] = useState(0);
  const busyRef = useRef(false);

  /* — Modal state — */
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);

  /* — Toast state — */
  const [toastMsg, setToastMsg] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* — Timers — */
  const [chestSec, setChestSec] = useState(2 * 3600 + 45 * 60 + 30);
  const [spinSec, setSpinSec] = useState(23 * 3600 + 59 * 60 + 59);
  const [bonusSec, setBonusSec] = useState(23 * 3600 + 59 * 60);

  /* — Spin animation — */
  const [spinDeg, setSpinDeg] = useState(0);
  const spinDegRef = useRef(0);
  const spinningRef = useRef(false);

  useEffect(() => {
    spinDegRef.current = spinDeg;
  }, [spinDeg]);

  /* — Footer nav — */
  const [activeNav, setActiveNav] = useState(0);

  /* ── Toast helper ───────────────────────────── */
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), 2600);
  }, []);

  /* ── Carousel helpers ───────────────────────── */
  function getState(i: number): number {
    return (i - cur + N) % N;
  }

  const rotate = useCallback((dir: number) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setCur((c) => (c + dir + N) % N);
    setTimeout(() => {
      busyRef.current = false;
    }, 580);
  }, [N]);

  function goTo(i: number) {
    if (busyRef.current || i === cur) return;
    busyRef.current = true;
    setCur(i);
    setTimeout(() => {
      busyRef.current = false;
    }, 580);
  }

  function handleCardClick(i: number) {
    if (i !== cur) goTo(i);
  }

  const closeModal = useCallback(() => {
    setModalOpen(false);
  }, []);

  /* ── Keyboard / swipe ───────────────────────── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") rotate(-1);
      if (e.key === "ArrowRight") rotate(1);
      if (e.key === "Escape") closeModal();
    }
    let tx = 0;
    function onTouchStart(e: TouchEvent) {
      tx = e.touches[0].clientX;
    }
    function onTouchEnd(e: TouchEvent) {
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) rotate(dx > 0 ? -1 : 1);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchend", onTouchEnd);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [rotate, closeModal]);

  /* ── Countdown timers ───────────────────────── */
  useEffect(() => {
    const id = setInterval(() => {
      setChestSec((s) => Math.max(0, s - 1));
      setSpinSec((s) => Math.max(0, s - 1));
      setBonusSec((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  /* ── Currency actions ───────────────────────── */
  function addCurrency(type: CurrencyType) {
    if (type === "chips") {
      setChips((c) => c + 5000);
      showToast("💎 +5,000 chips!");
    } else if (type === "cash") {
      setCash((c) => c + 50);
      showToast("💵 +$50 cash!");
    } else {
      setTickets((c) => c + 1);
      showToast("🎟 +1 ticket!");
    }
  }

  function claimBonus() {
    setChips((c) => c + 5000);
    showToast("🎁 Daily bonus! +5,000 chips");
  }

  function openChest() {
    setChips((c) => c + 2500);
    showToast("📦 Chest opened! +2,500 chips");
  }

  /* ── Spin ───────────────────────────────────── */
  function doSpin() {
    if (spinningRef.current) return;
    spinningRef.current = true;
    const target = 720 + Math.random() * 360;
    const start = performance.now();
    const dur = 1400;
    const startDeg = spinDegRef.current;

    function tick(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setSpinDeg(startDeg + ease * target);
      if (p < 1) {
        requestAnimationFrame(tick);
      } else {
        spinningRef.current = false;
        showToast(
          "🎰 " + SPIN_PRIZES[Math.floor(Math.random() * SPIN_PRIZES.length)]
        );
      }
    }
    requestAnimationFrame(tick);
  }

  /* ── Modal ──────────────────────────────────── */
  function openModal(type: ModalType, e: MouseEvent) {
    e.stopPropagation();
    setModalData(MODAL_MAP[type]);
    setModalOpen(true);
  }

  function handleModalAction(actionLabel: string) {
    closeModal();
    showToast(`🚀 ${actionLabel}!`);
  }

  /* ── Footer nav ─────────────────────────────── */
  const navItems = [
    { icon: "🛒", label: "SHOP", toast: "🛒 Shop" },
    { icon: "🎴", label: "CARDS", toast: "🎴 Cards" },
    { icon: "🏅", label: "CLUB", toast: "🏅 Club" },
    { icon: "📊", label: "RANKS", toast: "📊 Rankings" },
    { icon: "🏆", label: "AWARDS", toast: "🏆 Achievements" },
  ];

  /* ════════════════════════════════════════════
     CARDS DATA
  ════════════════════════════════════════════ */
  const cardsData = [
    {
      idx: 0,
      emoji: "🃏",
      title: "Play Now",
      sub: "Sit at any table instantly",
      pill: null,
      btnLabel: "PLAY NOW",
      modalType: "play" as ModalType,
    },
    {
      idx: 1,
      emoji: "🏆",
      title: "Tournaments",
      sub: "Compete & win big",
      pill: <div className="c-pill live">⏱ Live: 2</div>,
      btnLabel: "JOIN NOW",
      modalType: "tournament" as ModalType,
    },
    {
      idx: 2,
      emoji: "🤝",
      title: "Private Table",
      sub: "Play with friends",
      pill: <div className="c-pill online">● Online: 24</div>,
      btnLabel: "CREATE TABLE",
      modalType: "private" as ModalType,
    },
    {
      idx: 3,
      emoji: "👑",
      title: "VIP Club",
      sub: "Exclusive tables & rewards",
      pill: null,
      btnLabel: "JOIN CLUB",
      modalType: "vip" as ModalType,
    },
  ];

  /* ════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════ */
  return (
    <div className="royal-lobby">
      {/* ── CSS ─────────────────────────────────────── */}
      <style>{`
        .royal-lobby, .royal-lobby *, .royal-lobby *::before, .royal-lobby *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --pink:        #ff2d78;
          --pink-bright: #ff5fa0;
          --pink-deep:   #c0145a;
          --pink-glow:   rgba(255,45,120,0.35);
          --pink-soft:   rgba(255,45,120,0.12);
          --black:       #080608;
          --white-ghost: rgba(255,255,255,0.07);
          --text:        #f0e0e8;
          --text-muted:  rgba(240,200,220,0.45);
          --ease:        cubic-bezier(0.4, 0, 0.2, 1);
          --transition:  0.52s var(--ease);
          --hdr-h:       56px;
          --tray-h:      160px;
          --card-w:      220px;
          --card-pad:    20px 16px 18px;
          --card-emoji:  48px;
          --card-title:  17px;
          --card-sub:    11px;
          --card-btn-fs: 12px;
          --state1-x:    230px;
          --state2-x:    420px;
          --state1-y:    18px;
          --state2-y:    42px;
          --dots-bottom: 168px;
          --radius:      16px;
        }
        @media(min-width:600px){:root{--hdr-h:56px;--tray-h:158px;--card-w:250px;--card-pad:24px 20px 20px;--card-emoji:56px;--card-title:19px;--card-sub:12px;--card-btn-fs:13px;--state1-x:265px;--state2-x:490px;--state1-y:20px;--state2-y:48px;--dots-bottom:166px;}}
        @media(min-width:900px){:root{--hdr-h:64px;--tray-h:152px;--card-w:270px;--card-pad:28px 22px 24px;--card-emoji:62px;--card-title:20px;--card-sub:12px;--card-btn-fs:13px;--state1-x:285px;--state2-x:530px;--state1-y:20px;--state2-y:52px;--dots-bottom:160px;}}
        @media(min-width:1200px){:root{--hdr-h:68px;--tray-h:148px;--card-w:280px;--card-pad:30px 24px 26px;--card-emoji:66px;--card-title:21px;--card-sub:13px;--card-btn-fs:14px;--state1-x:300px;--state2-x:560px;--state1-y:22px;--state2-y:56px;--dots-bottom:156px;}}
        @media(min-width:1800px){:root{--hdr-h:80px;--tray-h:180px;--card-w:360px;--card-pad:40px 32px 36px;--card-emoji:90px;--card-title:28px;--card-sub:16px;--card-btn-fs:18px;--state1-x:390px;--state2-x:720px;--state1-y:28px;--state2-y:70px;--dots-bottom:192px;}}

        .royal-lobby {
          position:fixed;inset:0;z-index:0;
          width:100%;height:100%;overflow:hidden;
          background:var(--black);
          font-family:var(--font-montserrat, 'Montserrat', sans-serif);
          color:var(--text);user-select:none;
          padding-top:env(safe-area-inset-top);
          padding-bottom:env(safe-area-inset-bottom);
          padding-left:env(safe-area-inset-left);
          padding-right:env(safe-area-inset-right);
        }

        .bg-layer {
          position:fixed;inset:0;z-index:0;
          background:radial-gradient(ellipse 70% 55% at 50% 100%,rgba(180,10,70,0.22) 0%,transparent 65%),
            radial-gradient(ellipse 40% 35% at 15% 60%,rgba(120,0,60,0.15) 0%,transparent 55%),
            radial-gradient(ellipse 40% 35% at 85% 60%,rgba(80,0,40,0.15) 0%,transparent 55%),
            linear-gradient(180deg,#0a0408 0%,#120810 50%,#0a0408 100%);
          animation:bgPulse 10s ease-in-out infinite alternate;
        }
        @keyframes bgPulse{0%{opacity:1}100%{opacity:0.85;filter:brightness(1.1)}}

        .particles{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden;}
        .particles span{position:absolute;border-radius:50%;opacity:0;animation:pDrift linear infinite;}
        @keyframes pDrift{0%{opacity:0;transform:translateY(20px) scale(0.5)}15%{opacity:1}85%{opacity:0.6}100%{opacity:0;transform:translateY(-60vh) scale(1.4)}}

        .grid-overlay{
          position:fixed;inset:0;z-index:1;pointer-events:none;
          background-image:linear-gradient(rgba(255,45,120,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,45,120,0.03) 1px,transparent 1px);
          background-size:60px 60px;
          mask-image:radial-gradient(ellipse 80% 60% at 50% 50%,black 30%,transparent 80%);
        }

        header{
          position:fixed;top:0;left:0;right:0;z-index:200;
          height:var(--hdr-h);
          background:linear-gradient(180deg,rgba(8,4,8,0.97) 0%,rgba(8,4,8,0.8) 100%);
          border-bottom:1px solid rgba(255,45,120,0.12);
          backdrop-filter:blur(20px);
          display:flex;align-items:center;
          padding:0 clamp(10px,3vw,24px);
          gap:clamp(6px,1.5vw,16px);overflow:hidden;
        }
        .logo{display:flex;align-items:center;gap:clamp(6px,1vw,10px);flex-shrink:0;}
        .logo-icon{
          width:clamp(28px,4vw,42px);height:clamp(28px,4vw,42px);border-radius:clamp(7px,1vw,12px);
          background:linear-gradient(135deg,var(--pink-deep),var(--pink));
          display:flex;align-items:center;justify-content:center;
          font-size:clamp(14px,2.2vw,22px);box-shadow:0 0 16px var(--pink-glow);flex-shrink:0;
        }
        .logo-text{
          font-family:var(--font-playfair, 'Playfair Display', serif);font-size:clamp(12px,2vw,19px);font-weight:900;
          background:linear-gradient(135deg,#fff 30%,var(--pink-bright));
          background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
          white-space:nowrap;
        }
        .player-pill{
          display:flex;align-items:center;gap:clamp(6px,1vw,10px);
          padding:clamp(4px,0.8vw,7px) clamp(8px,1.5vw,16px) clamp(4px,0.8vw,7px) clamp(4px,0.8vw,6px);
          background:var(--white-ghost);border:1px solid rgba(255,45,120,0.18);border-radius:40px;
          flex-shrink:0;min-width:0;
        }
        .avatar-wrap{position:relative;flex-shrink:0;}
        .avatar{
          width:clamp(32px,4.5vw,44px);height:clamp(32px,4.5vw,44px);border-radius:50%;
          background:linear-gradient(135deg,#3a1028,#200818);
          border:2px solid var(--pink);
          display:flex;align-items:center;justify-content:center;
          font-size:clamp(15px,2.5vw,20px);box-shadow:0 0 12px var(--pink-glow);
        }
        .lvl-badge{
          position:absolute;bottom:-3px;right:-3px;
          background:var(--pink);color:#fff;font-size:8px;font-weight:700;
          width:15px;height:15px;border-radius:50%;
          display:flex;align-items:center;justify-content:center;border:1px solid var(--black);
        }
        .player-meta{display:flex;flex-direction:column;gap:3px;min-width:0;}
        .player-name{
          font-family:var(--font-oswald, 'Oswald', sans-serif);font-size:clamp(10px,1.5vw,14px);font-weight:600;color:#fff;
          white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
        }
        .xp-row{display:flex;align-items:center;gap:5px;}
        .xp-bar{width:clamp(50px,8vw,95px);height:3px;background:rgba(255,255,255,0.08);border-radius:2px;overflow:hidden;}
        .xp-fill{height:100%;width:81%;background:linear-gradient(90deg,var(--pink-deep),var(--pink-bright));border-radius:2px;}
        .xp-label{font-size:clamp(8px,1vw,10px);color:var(--text-muted);white-space:nowrap;}
        @media(max-width:420px){.xp-row,.vip-chip{display:none;}}
        .vip-chip{
          background:linear-gradient(135deg,#2a0818,#180410);
          border:1px solid rgba(255,45,120,0.4);border-radius:5px;
          padding:2px 6px;font-size:clamp(8px,1vw,9px);font-weight:700;
          color:var(--pink-bright);white-space:nowrap;flex-shrink:0;
        }
        .currency-row{display:flex;gap:clamp(4px,0.8vw,7px);margin-left:auto;flex-wrap:wrap;justify-content:flex-end;}
        .coin{
          display:flex;align-items:center;gap:clamp(3px,0.5vw,5px);
          background:var(--white-ghost);border:1px solid rgba(255,45,120,0.12);border-radius:20px;
          padding:clamp(3px,0.6vw,6px) clamp(6px,1vw,11px) clamp(3px,0.6vw,6px) clamp(5px,0.8vw,8px);
          font-family:var(--font-oswald, 'Oswald', sans-serif);font-size:clamp(10px,1.5vw,14px);color:#fff;white-space:nowrap;
        }
        .coin-icon{font-size:clamp(11px,1.6vw,15px);}
        @media(max-width:480px){.coin:not(:first-child){display:none;}}
        .add-btn{
          width:clamp(16px,2.2vw,22px);height:clamp(16px,2.2vw,22px);border-radius:50%;
          background:var(--pink);color:#fff;border:none;font-size:clamp(11px,1.5vw,14px);
          font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;
          transition:transform 0.15s,box-shadow 0.15s;flex-shrink:0;
        }
        .add-btn:hover{transform:scale(1.2);box-shadow:0 0 10px var(--pink-glow);}
        .hdr-actions{display:flex;gap:clamp(4px,0.6vw,7px);margin-left:clamp(4px,0.8vw,12px);flex-shrink:0;}
        .hdr-btn{
          width:clamp(30px,4vw,40px);height:clamp(30px,4vw,40px);border-radius:clamp(7px,1vw,11px);
          background:var(--white-ghost);border:1px solid rgba(255,45,120,0.1);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          font-size:clamp(13px,1.8vw,17px);transition:all 0.2s;position:relative;
        }
        .hdr-btn:hover{background:rgba(255,45,120,0.1);border-color:rgba(255,45,120,0.4);transform:translateY(-1px);}
        @media(max-width:380px){.hdr-btn:nth-child(3){display:none;}}
        .ndot{
          position:absolute;top:3px;right:3px;width:6px;height:6px;
          background:var(--pink);border-radius:50%;border:1px solid var(--black);
          animation:ndotPulse 2s infinite;
        }
        @keyframes ndotPulse{0%,100%{box-shadow:0 0 0 0 var(--pink-glow)}50%{box-shadow:0 0 0 4px transparent}}

        .stage{
          position:fixed;top:var(--hdr-h);left:0;right:0;
          height:calc(100vh - var(--hdr-h) - var(--tray-h));
          display:flex;align-items:center;justify-content:center;
          perspective:clamp(800px,120vw,1800px);overflow:hidden;z-index:10;
        }
        .table-surface{
          position:absolute;bottom:-40px;left:50%;transform:translateX(-50%);
          width:130%;height:clamp(120px,30vh,300px);
          background:radial-gradient(ellipse at 50% 20%,#220a18 0%,#130610 50%,#080408 100%);
          border-radius:50% 50% 0 0/45% 45% 0 0;
          border-top:2px solid rgba(255,45,120,0.18);
          box-shadow:0 -30px 100px rgba(180,10,70,0.14),inset 0 8px 40px rgba(0,0,0,0.6);
        }
        .table-surface::before{
          content:'ROYAL STACK';
          position:absolute;top:35%;left:50%;transform:translate(-50%,-50%);
          font-family:var(--font-playfair, 'Playfair Display', serif);
          font-size:clamp(10px,2.2vw,36px);font-weight:900;
          color:rgba(255,45,120,0.05);letter-spacing:clamp(0.2em,0.5em,0.7em);white-space:nowrap;
        }
        .track{position:relative;width:100%;height:100%;transform-style:preserve-3d;}

        .c-card{
          position:absolute;top:50%;left:50%;
          width:var(--card-w);
          transform-style:preserve-3d;cursor:pointer;
          transition:transform var(--transition),filter var(--transition),opacity var(--transition);
          will-change:transform,filter,opacity;
        }
        .c-card-inner{
          width:100%;border-radius:var(--radius);padding:var(--card-pad);
          display:flex;flex-direction:column;align-items:center;gap:clamp(8px,1.2vh,14px);
          position:relative;overflow:hidden;
          border:1.5px solid rgba(255,255,255,0.06);
          transition:border-color 0.35s,box-shadow 0.35s;
        }
        .c-card[data-idx="0"] .c-card-inner{background:linear-gradient(155deg,#2e0a1a,#180510 55%,#0e040c);border-color:rgba(255,45,120,0.28);box-shadow:0 24px 60px rgba(0,0,0,0.8),0 0 50px rgba(200,20,80,0.1) inset;}
        .c-card[data-idx="1"] .c-card-inner{background:linear-gradient(155deg,#200a28,#120515 55%,#0a030e);border-color:rgba(180,60,255,0.22);box-shadow:0 24px 60px rgba(0,0,0,0.8),0 0 50px rgba(140,30,200,0.08) inset;}
        .c-card[data-idx="2"] .c-card-inner{background:linear-gradient(155deg,#280818,#160410 55%,#0c030c);border-color:rgba(255,80,160,0.22);box-shadow:0 24px 60px rgba(0,0,0,0.8),0 0 50px rgba(255,60,140,0.07) inset;}
        .c-card[data-idx="3"] .c-card-inner{background:linear-gradient(155deg,#1e0a10,#120508 55%,#0a0308);border-color:rgba(255,200,100,0.20);box-shadow:0 24px 60px rgba(0,0,0,0.8),0 0 50px rgba(200,100,30,0.08) inset;}
        .c-card.state-0[data-idx="0"] .c-card-inner{border-color:rgba(255,45,120,0.55);box-shadow:0 28px 70px rgba(0,0,0,0.8),0 0 60px rgba(200,20,80,0.2) inset,0 0 40px rgba(255,45,120,0.07);}
        .c-card.state-0[data-idx="1"] .c-card-inner{border-color:rgba(180,60,255,0.5);box-shadow:0 28px 70px rgba(0,0,0,0.8),0 0 60px rgba(140,30,200,0.18) inset;}
        .c-card.state-0[data-idx="2"] .c-card-inner{border-color:rgba(255,80,160,0.5);box-shadow:0 28px 70px rgba(0,0,0,0.8),0 0 60px rgba(255,60,140,0.15) inset;}
        .c-card.state-0[data-idx="3"] .c-card-inner{border-color:rgba(255,200,100,0.45);box-shadow:0 28px 70px rgba(0,0,0,0.8),0 0 60px rgba(200,100,30,0.18) inset;}

        .c-shine{position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(135deg,rgba(255,255,255,0.08) 0%,transparent 45%);}
        .c-shimmer{position:absolute;top:0;left:-100%;width:60%;height:100%;pointer-events:none;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.04),transparent);}
        .c-card.state-0 .c-shimmer{animation:shimmerSweep 3s ease-in-out infinite;}
        @keyframes shimmerSweep{0%{left:-100%}60%,100%{left:160%}}

        .c-emoji{font-size:var(--card-emoji);line-height:1;filter:drop-shadow(0 6px 20px rgba(0,0,0,0.7));transition:transform 0.3s;}
        .c-card.state-0:hover .c-emoji{transform:translateY(-4px) scale(1.08) rotate(-3deg);}
        .c-title{font-family:var(--font-playfair, 'Playfair Display', serif);font-size:var(--card-title);font-weight:700;text-align:center;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,0.9);}
        .c-sub{font-size:var(--card-sub);color:rgba(255,255,255,0.4);text-align:center;font-weight:500;}
        .c-pill{padding:clamp(3px,0.5vw,6px) clamp(10px,1.5vw,18px);border-radius:20px;font-size:clamp(9px,1.2vw,12px);font-weight:600;letter-spacing:0.06em;}
        .c-pill.live{color:#a8ffb0;background:rgba(80,220,90,0.1);border:1px solid rgba(80,220,90,0.3);}
        .c-pill.online{color:#a8d8ff;background:rgba(80,160,255,0.1);border:1px solid rgba(80,160,255,0.3);}
        .c-btn{
          width:100%;padding:clamp(8px,1.2vh,12px);border-radius:clamp(8px,1vw,11px);border:none;cursor:pointer;
          font-family:var(--font-oswald, 'Oswald', sans-serif);font-size:var(--card-btn-fs);font-weight:600;letter-spacing:0.1em;
          transition:all 0.22s;position:relative;overflow:hidden;
        }
        .c-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 50%);pointer-events:none;}
        .c-card[data-idx="0"] .c-btn{background:linear-gradient(135deg,#c0145a,var(--pink));color:#fff;box-shadow:0 4px 20px rgba(255,45,120,0.4);}
        .c-card[data-idx="1"] .c-btn{background:linear-gradient(135deg,#6a10b8,#9b40f0);color:#fff;box-shadow:0 4px 20px rgba(155,64,240,0.4);}
        .c-card[data-idx="2"] .c-btn{background:linear-gradient(135deg,#a01050,#e04090);color:#fff;box-shadow:0 4px 20px rgba(220,60,140,0.4);}
        .c-card[data-idx="3"] .c-btn{background:linear-gradient(135deg,#8a5010,#d09030);color:#fff;box-shadow:0 4px 20px rgba(180,130,40,0.4);}
        .c-btn:hover{transform:translateY(-2px) scale(1.02);filter:brightness(1.18);}
        .c-btn:active{transform:scale(0.97);}

        .c-card.state-0{transform:translate(-50%,-50%) translateZ(0) scale(1);filter:blur(0) brightness(1);opacity:1;z-index:10;}
        .c-card.state-1{transform:translate(calc(-50% + var(--state1-x)),calc(-50% + var(--state1-y))) translateZ(-160px) rotateY(-16deg) scale(0.8);filter:blur(2.5px) brightness(0.55);opacity:0.8;z-index:7;}
        .c-card.state-2{transform:translate(calc(-50% + var(--state2-x)),calc(-50% + var(--state2-y))) translateZ(-320px) rotateY(-26deg) scale(0.63);filter:blur(5px) brightness(0.35);opacity:0.45;z-index:4;}
        .c-card.state-3{transform:translate(calc(-50% - var(--state1-x)),calc(-50% + var(--state1-y))) translateZ(-160px) rotateY(16deg) scale(0.8);filter:blur(2.5px) brightness(0.55);opacity:0.8;z-index:7;}

        .arrow{
          position:fixed;
          top:calc(var(--hdr-h) + (100vh - var(--hdr-h) - var(--tray-h)) / 2);
          transform:translateY(-50%);z-index:50;
          width:clamp(36px,5vw,52px);height:clamp(36px,5vw,52px);border-radius:50%;
          background:rgba(12,4,10,0.7);border:1.5px solid rgba(255,45,120,0.25);
          cursor:pointer;display:flex;align-items:center;justify-content:center;
          color:rgba(255,45,120,0.8);font-size:clamp(14px,2vw,20px);
          backdrop-filter:blur(10px);transition:all 0.22s;
        }
        .arrow:hover{background:rgba(255,45,120,0.15);border-color:var(--pink);color:#fff;transform:translateY(-50%) scale(1.12);box-shadow:0 0 20px var(--pink-glow);}
        .arrow.left{left:clamp(8px,2vw,20px);}
        .arrow.right{right:clamp(8px,2vw,20px);}

        .dots{position:fixed;bottom:var(--dots-bottom);left:50%;transform:translateX(-50%);display:flex;gap:clamp(6px,1vw,10px);z-index:50;}
        .dot{width:clamp(6px,1vw,8px);height:clamp(6px,1vw,8px);border-radius:50%;background:rgba(255,45,120,0.2);border:1px solid rgba(255,45,120,0.35);cursor:pointer;transition:all 0.3s;}
        .dot.active{width:clamp(20px,3vw,28px);border-radius:4px;background:var(--pink);border-color:var(--pink);box-shadow:0 0 10px var(--pink-glow);}

        .tray{
          position:fixed;bottom:0;left:0;right:0;z-index:100;height:var(--tray-h);
          background:linear-gradient(0deg,rgba(6,2,6,0.98) 0%,rgba(8,3,8,0.9) 100%);
          border-top:1px solid rgba(255,45,120,0.1);backdrop-filter:blur(20px);
          display:flex;flex-direction:column;
          padding-bottom:env(safe-area-inset-bottom);
        }
        .widget-strip{
          display:flex;gap:clamp(5px,0.8vw,10px);
          padding:clamp(6px,1vh,10px) clamp(8px,1.5vw,16px) clamp(4px,0.6vh,8px);
          flex:1;min-height:0;overflow-x:auto;overflow-y:hidden;
          scrollbar-width:none;-ms-overflow-style:none;
        }
        .widget-strip::-webkit-scrollbar{display:none;}
        .w{
          flex:1;min-width:clamp(70px,14vw,110px);border-radius:clamp(8px,1vw,13px);
          background:rgba(255,255,255,0.025);border:1px solid rgba(255,45,120,0.07);
          padding:clamp(6px,0.8vh,10px) clamp(6px,0.8vw,11px);
          display:flex;flex-direction:column;align-items:center;gap:clamp(2px,0.4vh,5px);
          cursor:pointer;position:relative;overflow:hidden;
          transition:background 0.25s,border-color 0.25s,transform 0.22s;
        }
        .w:hover{background:rgba(255,45,120,0.06);border-color:rgba(255,45,120,0.22);transform:translateY(-2px);}
        .w::before{content:'';position:absolute;top:0;left:0;right:0;height:1.5px;background:linear-gradient(90deg,transparent,var(--pink),transparent);opacity:0;transition:opacity 0.25s;}
        .w:hover::before{opacity:1;}
        .w-missions{flex:1.8;}
        .w-label{font-family:var(--font-oswald, 'Oswald', sans-serif);font-size:clamp(7px,1vw,9.5px);font-weight:600;letter-spacing:0.1em;color:rgba(255,45,120,0.5);text-transform:uppercase;white-space:nowrap;}
        .w-icon{font-size:clamp(18px,3vw,24px);line-height:1;}
        .w-info{font-size:clamp(8px,1.1vw,10px);color:var(--text-muted);white-space:nowrap;}
        .w-bar{width:100%;height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;}
        .w-bar-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--pink-deep),var(--pink));}
        .w-cta{
          padding:clamp(4px,0.6vh,6px) 0;border-radius:clamp(5px,0.8vw,8px);border:none;cursor:pointer;width:100%;
          font-family:var(--font-oswald, 'Oswald', sans-serif);font-size:clamp(8px,1.1vw,11px);font-weight:600;letter-spacing:0.07em;transition:all 0.2s;
        }
        .w-cta.pink{background:linear-gradient(135deg,var(--pink-deep),var(--pink));color:#fff;}
        .w-cta.ghost{background:rgba(255,45,120,0.1);color:var(--pink-bright);border:1px solid rgba(255,45,120,0.2);}
        .w-cta.amber{background:linear-gradient(135deg,#7a3a08,#c06820);color:#fff;}
        .w-cta.purple{background:linear-gradient(135deg,#5a0a9a,#8a30d0);color:#fff;}
        .w-cta:hover{filter:brightness(1.2);transform:scale(1.03);}
        .w-badge{
          position:absolute;top:5px;right:5px;width:clamp(12px,1.5vw,15px);height:clamp(12px,1.5vw,15px);
          border-radius:50%;background:var(--pink);color:#fff;font-size:7px;font-weight:700;
          display:flex;align-items:center;justify-content:center;border:1px solid rgba(0,0,0,0.5);
        }
        .m-row{width:100%;display:flex;align-items:center;gap:4px;}
        .m-name{font-size:clamp(7px,1vw,9px);color:var(--text-muted);flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .m-bar{flex:1;height:3px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;}
        .m-fill{height:100%;background:linear-gradient(90deg,var(--pink-deep),var(--pink-bright));}
        .m-prog{font-size:clamp(7px,0.9vw,8.5px);color:rgba(255,45,120,0.5);white-space:nowrap;}
        .pass-num{
          width:clamp(28px,4vw,38px);height:clamp(28px,4vw,38px);border-radius:clamp(6px,0.8vw,10px);
          background:linear-gradient(135deg,#500a1a,#8a102a);border:1.5px solid rgba(255,45,120,0.4);
          display:flex;align-items:center;justify-content:center;
          font-family:var(--font-playfair, 'Playfair Display', serif);font-size:clamp(12px,1.8vw,17px);font-weight:700;
          color:var(--pink-bright);box-shadow:0 0 14px rgba(255,45,120,0.25);flex-shrink:0;
        }
        .fnav{display:flex;border-top:1px solid rgba(255,45,120,0.07);flex-shrink:0;}
        .fnav-btn{
          flex:1;display:flex;flex-direction:column;align-items:center;
          padding:clamp(5px,0.8vh,8px) 0 clamp(6px,0.9vh,10px);gap:clamp(1px,0.3vh,3px);
          background:none;border:none;cursor:pointer;
          color:rgba(255,200,220,0.3);font-family:var(--font-oswald, 'Oswald', sans-serif);
          font-size:clamp(7px,1vw,10px);font-weight:500;letter-spacing:0.06em;
          border-top:2px solid transparent;transition:all 0.2s;
        }
        .fnav-btn:hover{color:rgba(255,45,120,0.7);}
        .fnav-btn.active{color:var(--pink-bright);border-top-color:var(--pink);}
        .fnav-btn span{font-size:clamp(13px,2vw,17px);}

        .toast{
          position:fixed;top:calc(var(--hdr-h) + 14px);left:50%;
          transform:translateX(-50%) translateY(-60px);
          background:linear-gradient(135deg,#200814,#100408);
          border:1px solid rgba(255,45,120,0.4);border-radius:12px;
          padding:clamp(8px,1.5vh,13px) clamp(14px,3vw,26px);
          z-index:999;font-family:var(--font-oswald, 'Oswald', sans-serif);font-size:clamp(11px,1.8vw,14px);
          color:var(--pink-bright);letter-spacing:0.05em;
          backdrop-filter:blur(12px);box-shadow:0 8px 30px rgba(255,45,120,0.2);
          transition:transform 0.38s var(--ease);white-space:nowrap;pointer-events:none;
          max-width:90vw;overflow:hidden;text-overflow:ellipsis;
        }
        .toast.show{transform:translateX(-50%) translateY(0);}

        .overlay{
          position:fixed;inset:0;z-index:500;
          background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);
          display:flex;align-items:center;justify-content:center;
          padding:clamp(16px,4vw,40px);
          opacity:0;pointer-events:none;transition:opacity 0.3s;
        }
        .overlay.open{opacity:1;pointer-events:all;}
        .modal{
          background:linear-gradient(160deg,#18060e,#0c040a);
          border:1.5px solid rgba(255,45,120,0.3);border-radius:clamp(14px,2vw,22px);
          padding:clamp(24px,4vw,38px) clamp(20px,4vw,38px) clamp(20px,3vw,34px);
          width:100%;max-width:clamp(280px,90vw,440px);position:relative;
          transform:scale(0.88) translateY(20px);transition:transform 0.32s var(--ease);
          box-shadow:0 30px 80px rgba(0,0,0,0.8),0 0 60px rgba(255,45,120,0.08);
        }
        .overlay.open .modal{transform:scale(1) translateY(0);}
        .modal-close{
          position:absolute;top:clamp(10px,1.5vw,16px);right:clamp(12px,2vw,18px);
          background:none;border:none;cursor:pointer;color:var(--text-muted);
          font-size:clamp(16px,2.5vw,22px);line-height:1;transition:color 0.2s;
        }
        .modal-close:hover{color:var(--pink);}
        .modal h2{font-family:var(--font-playfair, 'Playfair Display', serif);font-size:clamp(18px,3vw,24px);font-weight:700;color:#fff;margin-bottom:clamp(6px,1vh,12px);}
        .modal p{color:var(--text-muted);font-size:clamp(12px,1.6vw,14px);line-height:1.65;margin-bottom:clamp(18px,3vh,28px);}
        .modal-btns{display:flex;gap:clamp(8px,1.5vw,12px);}
        .m-btn{
          flex:1;padding:clamp(9px,1.5vh,13px);border-radius:clamp(8px,1vw,11px);
          border:none;cursor:pointer;font-family:var(--font-oswald, 'Oswald', sans-serif);
          font-size:clamp(12px,1.8vw,15px);font-weight:600;letter-spacing:0.08em;transition:all 0.2s;
        }
        .m-btn.go{background:linear-gradient(135deg,var(--pink-deep),var(--pink));color:#fff;box-shadow:0 4px 18px var(--pink-glow);}
        .m-btn.go:hover{filter:brightness(1.15);transform:translateY(-2px);}
        .m-btn.cancel{background:rgba(255,255,255,0.05);color:var(--text-muted);border:1px solid rgba(255,255,255,0.08);}
        .m-btn.cancel:hover{background:rgba(255,255,255,0.09);color:#fff;}

        .ripple{
          position:absolute;border-radius:50%;pointer-events:none;
          background:rgba(255,45,120,0.25);transform:scale(0);
          animation:rippleAnim 0.6s ease-out forwards;
        }
        @keyframes rippleAnim{to{transform:scale(4);opacity:0;}}
      `}</style>

      {/* ── Background ────────────────────────────── */}
      <div className="bg-layer" />
      <div className="grid-overlay" />
      <Particles />

      {/* ══ HEADER ═══════════════════════════════════ */}
      <header>
        <div className="logo">
          <div className="logo-icon">♠</div>
          <div className="logo-text">Royal Stack</div>
        </div>

        <div className="player-pill">
          <div className="avatar-wrap">
            <div className="avatar">🕶️</div>
            <div className="lvl-badge">25</div>
          </div>
          <div className="player-meta">
            <div className="player-name">Player One</div>
            <div className="xp-row">
              <div className="xp-bar">
                <div className="xp-fill" />
              </div>
              <div className="xp-label">1580/1950</div>
            </div>
          </div>
          <div className="vip-chip">VIP 3</div>
        </div>

        <div className="currency-row">
          <div className="coin">
            <span className="coin-icon">💎</span>
            <span>{chips.toLocaleString()}</span>
            <RippleBtn className="add-btn" onClick={() => addCurrency("chips")}>+</RippleBtn>
          </div>
          <div className="coin">
            <span className="coin-icon">💵</span>
            <span>{cash}</span>
            <RippleBtn className="add-btn" onClick={() => addCurrency("cash")}>+</RippleBtn>
          </div>
          <div className="coin">
            <span className="coin-icon">🎟</span>
            <span>{tickets}</span>
            <RippleBtn className="add-btn" onClick={() => addCurrency("tickets")}>+</RippleBtn>
          </div>
        </div>

        <div className="hdr-actions">
          <button className="hdr-btn" onClick={() => showToast("🎁 Collect your gift!")}>🎁</button>
          <button className="hdr-btn" onClick={() => showToast("📬 No new messages")}>
            ✉️<div className="ndot" />
          </button>
          <button className="hdr-btn" onClick={() => showToast("👥 3 friends online")}>👥</button>
          <button className="hdr-btn" onClick={() => showToast("⚙️ Settings")}>⚙️</button>
        </div>
      </header>

      {/* ══ ARROWS ═══════════════════════════════════ */}
      <button className="arrow left" onClick={() => rotate(-1)}>◀</button>
      <button className="arrow right" onClick={() => rotate(1)}>▶</button>

      {/* ══ STAGE ════════════════════════════════════ */}
      <div className="stage">
        <div className="table-surface" />
        <div className="track">
          {cardsData.map((c) => (
            <Card
              key={c.idx}
              {...c}
              state={getState(c.idx)}
              onClick={handleCardClick}
              onModalOpen={openModal}
            />
          ))}
        </div>
      </div>

      {/* ══ DOTS ═════════════════════════════════════ */}
      <div className="dots">
        {Array.from({ length: N }, (_, i) => (
          <div
            key={i}
            className={`dot${i === cur ? " active" : ""}`}
            onClick={() => goTo(i)}
          />
        ))}
      </div>

      {/* ══ TRAY ═════════════════════════════════════ */}
      <div className="tray">
        <div className="widget-strip">

          {/* Daily Bonus */}
          <div className="w">
            <div className="w-label">Daily Bonus</div>
            <div className="w-icon">🎁</div>
            <div className="w-info">{formatBonus(bonusSec)}</div>
            <RippleBtn className="w-cta pink" onClick={claimBonus}>CLAIM</RippleBtn>
          </div>

          {/* Daily Missions */}
          <div className="w w-missions">
            <div className="w-label">Daily Missions</div>
            {MISSIONS.map((m, i) => (
              <div className="m-row" key={i}>
                <span style={{ fontSize: 10 }}>{m.icon}</span>
                <span className="m-name">{m.name}</span>
                <div className="m-bar">
                  <div className="m-fill" style={{ width: `${m.progress}%` }} />
                </div>
                <span className="m-prog">{m.label}</span>
              </div>
            ))}
            <RippleBtn className="w-cta ghost" onClick={() => showToast("📋 All missions")}>
              VIEW ALL
            </RippleBtn>
          </div>

          {/* Poker Pass */}
          <div className="w">
            <div className="w-label">Poker Pass</div>
            <div className="pass-num">12</div>
            <div className="w-bar" style={{ width: "90%" }}>
              <div className="w-bar-fill" style={{ width: "60%" }} />
            </div>
            <div className="w-info">120/200 · 10d</div>
            <RippleBtn className="w-cta amber" onClick={() => showToast("🎫 Poker Pass")}>
              VIEW PASS
            </RippleBtn>
          </div>

          {/* Free Chest */}
          <div className="w">
            <div className="w-badge">1</div>
            <div className="w-label">Free Chest</div>
            <div className="w-icon">📦</div>
            <div className="w-info">{formatTimer(chestSec)}</div>
            <RippleBtn className="w-cta pink" onClick={openChest}>OPEN NOW</RippleBtn>
          </div>

          {/* Lucky Spin */}
          <div className="w">
            <div className="w-badge">3</div>
            <div className="w-label">Lucky Spin</div>
            <div
              className="w-icon"
              style={{ cursor: "pointer", display: "inline-block", transform: `rotate(${spinDeg}deg)` }}
              onClick={doSpin}
            >
              🎰
            </div>
            <div className="w-info">{formatTimer(spinSec)}</div>
            <RippleBtn className="w-cta purple" onClick={doSpin}>SPIN</RippleBtn>
          </div>

        </div>

        <nav className="fnav">
          {navItems.map((item, i) => (
            <button
              key={i}
              className={`fnav-btn${activeNav === i ? " active" : ""}`}
              onClick={() => { setActiveNav(i); showToast(item.toast); }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ══ MODAL ════════════════════════════════════ */}
      <Modal
        open={modalOpen}
        data={modalData}
        onClose={closeModal}
        onAction={handleModalAction}
      />

      {/* ══ TOAST ════════════════════════════════════ */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  );
}