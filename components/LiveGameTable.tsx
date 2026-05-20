"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getSocket, disconnectSocket, GameState, ServerPlayer } from "../lib/socket";
import { getPool } from "../lib/server";
import { walletEmoji } from "../lib/avatar";
import RoyalStackLogo from "./RoyalStackLogo";
import { useToast, ToastContainer } from "./Toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const CRIMSON = "#E8003A";
const WHITE = "#FFFFFF";
const BLACK = "#0A0A0A";

type Suit = "spades" | "hearts" | "diamonds" | "clubs";
type CardFace = { rank: string; suit: Suit };

const SUIT_MAP: Record<string, Suit> = {
  h: "hearts",
  d: "diamonds",
  c: "clubs",
  s: "spades",
};

function parseCard(notation: string): CardFace {
  const suitChar = notation.slice(-1);
  const rank = notation.slice(0, -1);
  return { rank, suit: SUIT_MAP[suitChar] ?? "spades" };
}

function shortAddress(addr: string) {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function getPlayerPosition(index: number, total: number) {
  const rx = 38;
  const ry = 32;
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  const x = 50 + rx * Math.cos(angle);
  const y = 50 + ry * Math.sin(angle);
  let anchor = "center";
  if (x < 40) anchor = "left";
  else if (x > 60) anchor = "right";
  return { x, y, anchor };
}

// ─── Visual Components (shared style with tablescreen) ────────────────────────
function SuitIcon({ suit, size = 9.8, color }: { suit: Suit; size?: number; color?: string }) {
  const fill = color ?? (suit === "hearts" || suit === "diamonds" ? CRIMSON : WHITE);
  switch (suit) {
    case "spades":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 2 C12 2 3 9 3 14 C3 17.3 5.7 20 9 20 C9 20 8 22 6 22 L18 22 C16 22 15 20 15 20 C18.3 20 21 17.3 21 14 C21 9 12 2 12 2Z" fill={fill} />
        </svg>
      );
    case "hearts":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 21 C12 21 3 14 3 8.5 C3 5.4 5.4 3 8.5 3 C10.2 3 11.7 3.8 12 4.7 C12.3 3.8 13.8 3 15.5 3 C18.6 3 21 5.4 21 8.5 C21 14 12 21 12 21Z" fill={fill} />
        </svg>
      );
    case "diamonds":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path d="M12 2 L21 12 L12 22 L3 12 Z" fill={fill} />
        </svg>
      );
    case "clubs":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="12" r="4" fill={fill} />
          <circle cx="16" cy="12" r="4" fill={fill} />
          <circle cx="12" cy="8" r="4" fill={fill} />
          <path d="M10 16 L10 20 L14 20 L14 16 Z" fill={fill} />
        </svg>
      );
  }
}

function CardBack({ width = 50, height = 70 }: { width?: number; height?: number }) {
  const id = `cb-${width}-${height}`;
  return (
    <svg width={width} height={height} viewBox="0 0 38 54" style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.75))" }}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BLACK} />
          <stop offset="55%" stopColor="#1a0008" />
          <stop offset="100%" stopColor={BLACK} />
        </linearGradient>
        <pattern id={`${id}-pat`} x="0" y="0" width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="transparent" />
          <path d="M0 4 L4 0 L8 4 L4 8 Z" fill={CRIMSON} fillOpacity="0.45" />
        </pattern>
      </defs>
      <rect rx="4" width="38" height="54" fill={`url(#${id}-bg)`} />
      <rect rx="4" width="38" height="54" fill={`url(#${id}-pat)`} />
      <rect rx="4" width="38" height="54" fill="none" stroke={CRIMSON} strokeWidth="2" strokeOpacity="0.8" />
    </svg>
  );
}

function CardFront({ card, width = 50, height = 70 }: { card: CardFace; width?: number; height?: number }) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const suitColor = isRed ? CRIMSON : BLACK;
  return (
    <svg width={width} height={height} viewBox="0 0 38 54" style={{ filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.85))" }}>
      <rect rx="4" width="38" height="54" fill={WHITE} />
      <rect rx="4" width="38" height="54" fill="none" stroke="#bbb" strokeWidth="1" />
      <text x="3" y="14" fontSize={14} fontWeight="800" fontFamily="Georgia,serif" fill={suitColor}>{card.rank}</text>
      <g transform="translate(3,16)"><SuitIcon suit={card.suit} size={8.4} color={suitColor} /></g>
      <g transform={`translate(${38 / 2 - 9.1},${54 / 2 - 9.1})`}><SuitIcon suit={card.suit} size={18.2} color={suitColor} /></g>
      <g transform="rotate(180,19,27)">
        <text x="3" y="14" fontSize={14} fontWeight="800" fontFamily="Georgia,serif" fill={suitColor}>{card.rank}</text>
        <g transform="translate(3,16)"><SuitIcon suit={card.suit} size={8.4} color={suitColor} /></g>
      </g>
    </svg>
  );
}

function Pot({ amount }: { amount: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle cx="16" cy="16" r="14" fill={CRIMSON} stroke={WHITE} strokeWidth="1.5" />
        <circle cx="16" cy="16" r="10" fill="transparent" stroke={WHITE} strokeWidth="1" strokeDasharray="4 2" />
        <text x="16" y="20" textAnchor="middle" fontSize="8" fill={WHITE} fontFamily="Georgia,serif" fontWeight="700">POT</text>
      </svg>
      <div style={{ color: WHITE, fontFamily: "Poppins, Georgia, serif", fontSize: 15, fontWeight: 900, letterSpacing: 1, textShadow: `0 0 10px ${CRIMSON}` }}>
        ${amount.toLocaleString()}
      </div>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
type Props = {
  sessionToken: string;
  poolId: string;
  walletAddress: string;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LiveGameTable({ sessionToken, poolId, walletAddress }: Props) {
  const router = useRouter();
  const { toasts, toast, dismiss } = useToast();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [log, setLog] = useState<string[]>([]);
  const [showWinner, setShowWinner] = useState(false);
  const [winnerAddr, setWinnerAddr] = useState<string>("");
  const [raiseValue, setRaiseValue] = useState(0);
  const [isRaising, setIsRaising] = useState(false);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  const joinedRef = useRef(false);
  const disconnectToastRef = useRef<number | null>(null);

  const addLog = (msg: string) => setLog((prev) => [...prev.slice(-4), msg]);

  const refreshCount = (token: string, pid: string) => {
    getPool(token, pid)
      .then(pool => {
        if (pool.status === 'CLOSED') {
          localStorage.removeItem("royalstack:poolId");
          toast("Pool was cancelled on-chain. Returning to lobby...", "error", 4000);
          setTimeout(() => router.push("/lobby"), 4000);
          return;
        }
        if (typeof pool.playerCount === "number") setPlayerCount(pool.playerCount);
      })
      .catch(() => {});
  };

  useEffect(() => {
    const socket = getSocket(sessionToken);
    socketRef.current = socket;

    // "connect" fires on both initial connection and after every reconnect in socket.io
    socket.on("connect", () => {
      setConnected(true);
      if (disconnectToastRef.current !== null) {
        dismiss(disconnectToastRef.current);
        disconnectToastRef.current = null;
      }
      if (!joinedRef.current) {
        joinedRef.current = true;
        socket.emit("JOIN_POOL", { poolId });
      }
      refreshCount(sessionToken, poolId);
    });

    socket.on("disconnect", () => {
      setConnected(false);
      joinedRef.current = false; // server lost our room on restart, re-join on next connect
      disconnectToastRef.current = toast("Connection lost. Reconnecting...", "warning", 0);
    });

    socket.on("POOL_JOINED", () => addLog("Joined the pool. Waiting for players..."));

    socket.on("PLAYER_JOINED", ({ walletAddress: addr, playerCount: count }: { walletAddress: string; playerCount?: number }) => {
      if (typeof count === "number") setPlayerCount(count);
      else setPlayerCount((n) => n + 1);
      addLog(`${walletEmoji(addr)} ${shortAddress(addr)} joined.`);
    });

    socket.on("POOL_CANCELLED", () => {
      localStorage.removeItem("royalstack:poolId");
      toast("Pool was cancelled on-chain. Returning to lobby...", "error", 4000);
      setTimeout(() => router.push("/lobby"), 4000);
    });

    socket.on("PLAYER_LEFT", ({ walletAddress: addr }: { walletAddress: string }) => {
      setPlayerCount((n) => Math.max(0, n - 1));
      addLog(`${walletEmoji(addr)} ${shortAddress(addr)} left.`);
    });

    socket.on("GAME_STATE_UPDATED", (state: GameState) => {
      if (!state || !Array.isArray(state.players)) return;
      setGameState(state);
      setPlayerCount(state.players.length);
      if (state.winners && state.winners.length > 0) {
        const winner = state.winners[0];
        setWinnerAddr(winner.walletAddress);
        setShowWinner(true);
        setTimeout(() => setShowWinner(false), 3500);
      }
    });

    socket.on("ACTION_INVALID", ({ error }: { error: string }) => {
      toast(error, "error", 4000);
    });

    socket.on("HAND_SAVED", () => addLog("Hand recorded."));

    return () => {
      socket.emit("LEAVE_POOL", { poolId });
      disconnectSocket();
    };
  }, [sessionToken, poolId]);

  function sendAction(type: "fold" | "call" | "raise" | "check", amount?: number) {
    const socket = socketRef.current;
    if (!socket) return;
    const payload: { type: string; amount?: number } = { type };
    if (amount !== undefined) payload.amount = amount;
    socket.emit("PLAYER_ACTION", { poolId, action: payload });
    addLog(`You: ${type}${amount ? ` $${amount}` : ""}`);
  }

  // ─── State derivations ─────────────────────────────────────────────────────
  const myAddr = walletAddress.toLowerCase();
  const isMyTurn = gameState?.currentPlayer?.toLowerCase() === myAddr;
  const me = gameState?.players.find((p) => p.walletAddress.toLowerCase() === myAddr);
  const myBet = me?.bet ?? 0;
  const currentBet = gameState ? Math.max(...gameState.players.map((p) => p.bet)) : 0;
  const callAmount = Math.max(currentBet - myBet, 0);

  const communityCards = (gameState?.communityCards ?? []).map(parseCard);
  const visibleCommunity = communityCards.concat(Array(5 - communityCards.length).fill(null)).slice(0, 5);

  // ─── Waiting screen ────────────────────────────────────────────────────────
  if (!gameState) {
    return (
      <div style={{ width: "100%", minHeight: "calc(100vh - 48px)", background: BLACK, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: WHITE, fontFamily: "Georgia, serif" }}>
        <ToastContainer toasts={toasts} dismiss={dismiss} />
        <div style={{ fontSize: 48, marginBottom: 8 }}>{walletEmoji(walletAddress)}</div>
        <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>WAITING FOR PLAYERS</div>
        <div style={{ color: "#888", fontSize: 14, marginBottom: 8 }}>{playerCount} / 5 players in pool #{poolId}</div>
        <div style={{ color: connected ? "#9ceb9c" : "#ff6b6b", fontSize: 12, letterSpacing: 1 }}>{connected ? "● CONNECTED" : "○ CONNECTING..."}</div>
        {log.length > 0 && (
          <div style={{ marginTop: 24, color: "#666", fontSize: 12, fontFamily: "monospace", textAlign: "center" }}>
            {log.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
      </div>
    );
  }

  // ─── Render table ──────────────────────────────────────────────────────────
  // Sort players so the human is always at index 0 (bottom of ellipse)
  const sortedPlayers: ServerPlayer[] = (() => {
    const myIndex = gameState.players.findIndex((p) => p.walletAddress.toLowerCase() === myAddr);
    if (myIndex <= 0) return gameState.players;
    return [...gameState.players.slice(myIndex), ...gameState.players.slice(0, myIndex)];
  })();

  return (
    <div style={{ width: "100%", minHeight: "calc(100vh - 48px)", maxWidth: "100%", background: BLACK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Georgia, 'Times New Roman', serif", overflow: "hidden" }}>

      {/* Winner overlay */}
      {showWinner && (
        <div style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.65)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ background: `linear-gradient(135deg, ${CRIMSON}, #9e0028 80%)`, borderRadius: 24, padding: "48px 64px", boxShadow: `0 0 60px ${CRIMSON}cc, 0 2px 24px #000`, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: 28, color: WHITE, fontWeight: 900, letterSpacing: 2, textShadow: `0 0 18px #fff` }}>
              🎉 {winnerAddr.toLowerCase() === myAddr ? "You Win!" : `${shortAddress(winnerAddr)} Wins!`} 🎉
            </span>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} dismiss={dismiss} />

      {/* Ambient glow */}
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 50%, ${CRIMSON}14 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Table container */}
      <div style={{ position: "relative", width: "min(96vw, 920px)", height: "min(72vh, 520px)" }}>

        {/* Table felt */}
        <div style={{ position: "absolute", left: "8%", right: "8%", top: "10%", bottom: "10%", borderRadius: "50%", background: `radial-gradient(ellipse at 50% 40%, #1b3a2a 0%, #0d3320 60%, #072213 90%, #050f0a 100%)`, border: `8px solid #2a0a18`, boxShadow: `0 0 0 6px ${CRIMSON}44, 0 0 60px 10px #000a, inset 0 0 80px #0008`, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.012) 2px, rgba(255,255,255,0.012) 4px)` }} />

          <RoyalStackLogo style={{ position: "absolute", top: "18%", left: "50%", transform: "translate(-50%, 0)", zIndex: 200 }} />

          {/* Community cards */}
          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, zIndex: 200, position: "absolute", top: "38%", left: "50%", transform: "translate(-50%, -50%)", pointerEvents: "none" }}>
            {visibleCommunity.map((card, i) => (
              <div key={i}>
                {card ? <CardFront card={card} width={48} height={68} /> : (
                  <div style={{ width: 48, height: 68, opacity: 0.18, background: "#222", borderRadius: 4, boxShadow: "inset 0 0 10px #000" }} />
                )}
              </div>
            ))}
          </div>

          {/* Pot + phase badge */}
          <div style={{ position: "absolute", top: "72%", left: "50%", transform: "translate(-50%, -50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 12, zIndex: 2 }}>
            <div style={{ background: `linear-gradient(90deg, transparent, ${CRIMSON}44, transparent)`, border: `1px solid ${CRIMSON}66`, borderRadius: 20, padding: "2px 16px", fontSize: 10, letterSpacing: 3, color: CRIMSON, textTransform: "uppercase" }}>
              {gameState.stage}
            </div>
            <Pot amount={gameState.pot} />
            {currentBet > 0 && (
              <div style={{ background: "rgba(232,0,58,0.15)", border: `1px solid rgba(232,0,58,0.4)`, borderRadius: 12, padding: "4px 14px", color: "#ffcccc", fontFamily: "monospace", fontSize: 12, fontWeight: 600 }}>
                Current Bet <span style={{ color: WHITE, fontWeight: 800 }}>${currentBet}</span>
              </div>
            )}
          </div>
        </div>

        {/* Rail */}
        <div style={{ position: "absolute", left: "8%", right: "8%", top: "10%", bottom: "10%", borderRadius: "50%", border: `10px solid transparent`, background: `linear-gradient(135deg, #3a0010, #1a0008, #3a0010, #1a0008) border-box`, WebkitMask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`, WebkitMaskComposite: "destination-out", maskComposite: "exclude", pointerEvents: "none", zIndex: 10 }} />

        {/* Players */}
        {sortedPlayers.map((player, index) => {
          const isHuman = player.walletAddress.toLowerCase() === myAddr;
          const isCurrentTurn = gameState.currentPlayer?.toLowerCase() === player.walletAddress.toLowerCase();
          const pos = getPlayerPosition(index, sortedPlayers.length);
          const cards: CardFace[] = player.holeCards ? player.holeCards.map(parseCard) : [];
          const showCards = isHuman || (Array.isArray(gameState.winners) && gameState.winners.length > 0 && !player.folded);

          return (
            <div key={player.walletAddress} style={{ position: "absolute", left: `${pos.x}%`, top: `${pos.y}%`, transform: "translate(-50%, -50%)", zIndex: 10 }}>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12, opacity: player.folded ? 0.45 : 1, transition: "opacity 0.3s" }}>
                {/* Cards */}
                <div style={{ display: "flex", gap: 6 }}>
                  {player.folded ? (
                    <span style={{ fontSize: 12, color: "#ff4466", fontFamily: "Georgia,serif", opacity: 0.7 }}>FOLDED</span>
                  ) : cards.length === 2 ? (
                    cards.map((c, i) => (
                      <div key={i} style={{ transform: i === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}>
                        {showCards ? <CardFront card={c} width={50} height={70} /> : <CardBack width={50} height={70} />}
                      </div>
                    ))
                  ) : (
                    [0, 1].map((i) => (
                      <div key={i} style={{ transform: i === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}>
                        <CardBack width={50} height={70} />
                      </div>
                    ))
                  )}
                </div>

                {/* Nameplate */}
                <div style={{ position: "relative" }}>
                  <div style={{ background: isCurrentTurn ? `linear-gradient(135deg, ${CRIMSON}, #9e0028)` : "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))", border: `1.5px solid ${isCurrentTurn ? CRIMSON : "rgba(255,255,255,0.18)"}`, borderRadius: 10, padding: "8px 16px", backdropFilter: "blur(8px)", boxShadow: isCurrentTurn ? `0 0 18px ${CRIMSON}88, 0 2px 8px rgba(0,0,0,0.6)` : "0 2px 8px rgba(0,0,0,0.5)", minWidth: 110, textAlign: "center", transition: "all 0.3s" }}>
                    <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 2 }}>{walletEmoji(player.walletAddress)}</div>
                    {isHuman && <div style={{ fontSize: 9, color: "#aaffaa", letterSpacing: 1, marginBottom: 2 }}>YOU</div>}
                    <div style={{ color: WHITE, fontFamily: "Poppins, Georgia, serif", fontSize: 15, fontWeight: 800, letterSpacing: 0.6 }}>
                      {shortAddress(player.walletAddress)}
                    </div>
                    <div style={{ color: isCurrentTurn ? WHITE : "#ddd", fontFamily: "monospace", fontSize: 14, marginTop: 2 }}>
                      ${player.chips.toLocaleString()}
                    </div>
                    {player.bet > 0 && (
                      <div style={{ marginTop: 3, fontSize: 11, color: "#c70052", fontFamily: "monospace" }}>
                        bet ${player.bet}
                      </div>
                    )}
                  </div>
                  {isCurrentTurn && !player.folded && (
                    <div style={{ position: "absolute", bottom: "100%", left: "50%", transform: "translateX(-50%)", marginBottom: 8, background: "rgba(0,0,0,0.85)", border: `1px solid ${CRIMSON}`, borderRadius: 6, padding: "4px 10px", color: "#ffcccc", fontFamily: "monospace", fontSize: 11, whiteSpace: "nowrap", zIndex: 50, pointerEvents: "none" }}>
                      {isHuman ? "Your turn" : "Thinking..."}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Action buttons */}
        <div style={{ position: "absolute", bottom: -70, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8, zIndex: 20 }}>
          {isMyTurn && !me?.folded ? (
            isRaising ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, background: "rgba(0,0,0,0.65)", padding: "16px 24px", borderRadius: 16, backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ color: WHITE, fontSize: 13, fontWeight: 700, fontFamily: "monospace" }}>RAISE TO ${raiseValue.toLocaleString()}</div>
                <input
                  type="range"
                  min={Math.max(20, callAmount + 20)}
                  max={me?.chips ?? 100}
                  step={10}
                  value={raiseValue}
                  onChange={(e) => setRaiseValue(Number(e.target.value))}
                  style={{ width: 200, accentColor: CRIMSON }}
                />
                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setIsRaising(false)} style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: WHITE, padding: "8px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>CANCEL</button>
                  <button onClick={() => { sendAction("raise", raiseValue); setIsRaising(false); }} style={{ background: `linear-gradient(135deg, ${CRIMSON}, #9e0028)`, border: `1px solid ${CRIMSON}`, borderRadius: 8, color: WHITE, padding: "8px 16px", fontSize: 11, fontWeight: 700, cursor: "pointer", boxShadow: `0 0 14px ${CRIMSON}66` }}>CONFIRM</button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => sendAction("fold")} style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: WHITE, fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "8px 14px", cursor: "pointer", backdropFilter: "blur(8px)" }}>FOLD</button>
                <button onClick={() => sendAction(callAmount > 0 ? "call" : "check")} style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, color: WHITE, fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "8px 14px", cursor: "pointer", backdropFilter: "blur(8px)" }}>
                  {callAmount > 0 ? `CALL $${callAmount}` : "CHECK"}
                </button>
                <button onClick={() => { setRaiseValue(Math.max(20, callAmount + 20)); setIsRaising(true); }} style={{ background: `linear-gradient(135deg, ${CRIMSON}, #9e0028)`, border: `1px solid ${CRIMSON}`, borderRadius: 8, color: WHITE, fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "8px 14px", cursor: "pointer", backdropFilter: "blur(8px)", boxShadow: `0 0 14px ${CRIMSON}66` }}>RAISE</button>
              </>
            )
          ) : (
            <button disabled style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, color: "#aaa", fontFamily: "Georgia, serif", fontSize: 11, fontWeight: 700, letterSpacing: 1, padding: "8px 14px", cursor: "not-allowed", backdropFilter: "blur(8px)" }}>
              {me?.folded ? "You folded" : "Waiting for opponents..."}
            </button>
          )}
        </div>

        {/* Header bar */}
        <div style={{ position: "absolute", top: -36, left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 16, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <SuitIcon suit="spades" size={7} color={WHITE} />
              <SuitIcon suit="hearts" size={7} color={CRIMSON} />
              <SuitIcon suit="diamonds" size={7} color={CRIMSON} />
              <SuitIcon suit="clubs" size={7} color={WHITE} />
            </div>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 15, fontWeight: 700, color: WHITE, letterSpacing: 2 }}>ROYAL STACK</span>
            <span style={{ fontFamily: "Georgia, serif", fontSize: 8, color: CRIMSON, letterSpacing: 2, alignSelf: "flex-end", marginBottom: 1 }}>POWERED BY MEZO</span>
          </div>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
          <span style={{ fontSize: 10, color: "#888", fontFamily: "monospace", letterSpacing: 1 }}>NL HOLD&apos;EM · POOL #{poolId}</span>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.2)" }} />
          <span style={{ fontSize: 10, color: connected ? "#9ceb9c" : "#ff6b6b", fontFamily: "monospace" }}>
            {connected ? "● LIVE" : "○ OFFLINE"}
          </span>
        </div>

        {/* Action log */}
        {log.length > 0 && (
          <div style={{ position: "absolute", bottom: -130, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", gap: 2, textAlign: "center", zIndex: 5 }}>
            {log.map((entry, i) => (
              <div key={i} style={{ color: "#666", fontFamily: "monospace", fontSize: 11 }}>{entry}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
