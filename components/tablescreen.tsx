"use client";

import { useState, useEffect, useRef } from "react";
import RoyalStackLogo from "./RoyalStackLogo";
import { sounds } from "../lib/sounds";

// ─── Types ───────────────────────────────────────────────────────────────────
type Suit = "spades" | "hearts" | "diamonds" | "clubs";
type CardFace = { rank: string; suit: Suit };
type BotStyle = "aggressive" | "calling" | "tight" | "passive";

type Player = {
  id: number;
  name: string;
  chips: number;
  cards: [CardFace | null, CardFace | null];
  bet: number;
  isActive: boolean;
  isDealer: boolean;
  isFolded: boolean;
  position: { x: number; y: number; anchor: string };
  lastAction?: string;
  style?: BotStyle;
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CRIMSON = "#E8003A";
const WHITE = "#FFFFFF";
const BLACK = "#0A0A0A";

// Distribute 5 players evenly around an ellipse (table)
function getPlayerPosition(index: number, total: number) {
  // Ellipse center (50,50), radii
  const rx = 38; // horizontal radius
  const ry = 32; // vertical radius
  const angle = (2 * Math.PI * index) / total + Math.PI / 2;
  const x = 50 + rx * Math.cos(angle);
  const y = 50 + ry * Math.sin(angle);
  let anchor = "center";
  if (x < 40) anchor = "left";
  else if (x > 60) anchor = "right";
  return { x, y, anchor };
}

const DEFAULT_PLAYERS: Player[] = [
  {
    id: 1,
    name: "Phoenix",
    chips: 4200,
    cards: [
      { rank: "A", suit: "spades" },
      { rank: "K", suit: "hearts" },
    ],
    bet: 0,
    isActive: true,
    isDealer: false,
    isFolded: false,
    position: getPlayerPosition(0, 5),
  },
  {
    id: 2,
    name: "Maverick",
    style: "aggressive",
    chips: 7800,
    cards: [
      { rank: "10", suit: "clubs" },
      { rank: "J", suit: "diamonds" },
    ],
    bet: 0,
    isActive: true,
    isDealer: false,
    isFolded: false,
    position: getPlayerPosition(1, 5),
  },
  {
    id: 3,
    name: "Blaze",
    style: "calling",
    chips: 3100,
    cards: [
      { rank: "Q", suit: "hearts" },
      { rank: "8", suit: "spades" },
    ],
    bet: 0,
    isActive: true,
    isDealer: true,
    isFolded: false,
    position: getPlayerPosition(2, 5),
  },
  {
    id: 4,
    name: "Viper",
    style: "tight",
    chips: 9500,
    cards: [
      { rank: "7", suit: "diamonds" },
      { rank: "9", suit: "clubs" },
    ],
    bet: 0,
    isActive: true,
    isDealer: false,
    isFolded: false,
    position: getPlayerPosition(3, 5),
  },
  {
    id: 5,
    name: "Storm",
    style: "passive",
    chips: 5600,
    cards: [
      { rank: "2", suit: "hearts" },
      { rank: "3", suit: "diamonds" },
    ],
    bet: 0,
    isActive: true,
    isDealer: false,
    isFolded: false,
    position: getPlayerPosition(4, 5),
  },
];

const DEFAULT_COMMUNITY_CARDS: CardFace[] = [
  { rank: "10", suit: "hearts" },
  { rank: "J", suit: "spades" },
  { rank: "Q", suit: "diamonds" },
  { rank: "K", suit: "clubs" },
  { rank: "A", suit: "hearts" },
];

// ─── Props ────────────────────────────────────────────────────────────────────
interface PokerTableProps {
  smallBlind?: number;
  bigBlind?: number;
  label?: string;
  speed?: "normal" | "fast";
}

const RANKS = [
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
  "A",
] as const;
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];
const HUMAN_PLAYER_ID = 1;

type PlayerAction = "fold" | "call" | "check" | "raise" | "bet";

type GamePhase =
  | "preflop"
  | "flop"
  | "turn"
  | "river"
  | "showdown"
  | "roundEnd";

type HandCategory = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type HandRank = [HandCategory, ...number[]];

const RANK_VALUE: Record<string, number> = {
  2: 2,
  3: 3,
  4: 4,
  5: 5,
  6: 6,
  7: 7,
  8: 8,
  9: 9,
  10: 10,
  J: 11,
  Q: 12,
  K: 13,
  A: 14,
};

// ─── Bot hand-strength heuristic (0 = trash, 1 = nuts) ──────────────────────
function getHoleStrength(cards: [CardFace | null, CardFace | null]): number {
  const [c1, c2] = cards;
  if (!c1 || !c2) return 0.25;
  const r1 = RANK_VALUE[c1.rank];
  const r2 = RANK_VALUE[c2.rank];
  const high = Math.max(r1, r2);
  const low = Math.min(r1, r2);
  const isPair = r1 === r2;
  const isSuited = c1.suit === c2.suit;
  const gap = high - low;
  let s: number;
  if (isPair) {
    s = 0.5 + ((high - 2) / 12) * 0.4; // 22=0.50 … AA=0.90
  } else {
    s = ((high - 2) / 12) * 0.45 + ((low - 2) / 12) * 0.2;
    if (isSuited) s += 0.08;
    if (gap <= 1) s += 0.06;
    else if (gap <= 2) s += 0.03;
  }
  return Math.min(1, Math.max(0, s));
}

function createDeck(): CardFace[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ rank, suit })));
}

function shuffleCards<T>(cards: T[]): T[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getNextActivePlayer(
  players: Player[],
  currentId: number,
): number | null {
  const currentIndex = players.findIndex((player) => player.id === currentId);
  if (currentIndex === -1) return null;

  for (let offset = 1; offset < players.length; offset += 1) {
    const next = players[(currentIndex + offset) % players.length];
    if (!next.isFolded && next.chips > 0) return next.id;
  }

  return null;
}

function getActivePlayers(players: Player[]) {
  return players.filter((player) => !player.isFolded && player.chips > 0);
}

function resetPlayerBets(players: Player[]) {
  return players.map((player) => ({
    ...player,
    bet: 0,
    lastAction: undefined,
  }));
}

function hasAllActivePlayersMatched(players: Player[], currentBet: number) {
  return getActivePlayers(players).every(
    (player) => player.bet === currentBet || player.chips === 0,
  );
}

function formatMoney(value: number) {
  return `$${value.toLocaleString()}`;
}

function getCombinations<T>(items: T[], size: number): T[][] {
  const results: T[][] = [];

  function helper(start: number, chosen: T[]) {
    if (chosen.length === size) {
      results.push(chosen);
      return;
    }
    for (let i = start; i < items.length; i += 1) {
      helper(i + 1, [...chosen, items[i]]);
    }
  }

  helper(0, []);
  return results;
}

function getStraightHigh(sortedUnique: number[]): number {
  const ranks = [...sortedUnique];
  if (ranks[0] === 14) ranks.push(1);

  for (let i = 0; i <= ranks.length - 5; i += 1) {
    let current = ranks[i];
    let count = 1;

    for (let j = i + 1; j < ranks.length && count < 5; j += 1) {
      if (ranks[j] === current - 1) {
        current = ranks[j];
        count += 1;
      } else if (ranks[j] === current) {
        continue;
      } else {
        break;
      }
    }

    if (count === 5) return ranks[i];
  }

  return 0;
}

function compareHandRank(a: HandRank, b: HandRank) {
  for (let i = 0; i < Math.max(a.length, b.length); i += 1) {
    const aValue = a[i] ?? 0;
    const bValue = b[i] ?? 0;
    if (aValue !== bValue) return aValue - bValue;
  }
  return 0;
}

function evaluate5CardHand(cards: CardFace[]): HandRank {
  const ranks = cards.map((card) => RANK_VALUE[card.rank]);
  const suits = cards.map((card) => card.suit);
  const flush = suits.every((suit) => suit === suits[0]);

  const counts = new Map<number, number>();
  ranks.forEach((rank) => counts.set(rank, (counts.get(rank) ?? 0) + 1));

  const uniqueRanks = Array.from(new Set(ranks)).sort((a, b) => b - a);
  const straightHigh = getStraightHigh(uniqueRanks);
  const straight = straightHigh > 0;

  const sortedEntries = Array.from(counts.entries()).sort((a, b) => {
    if (a[1] !== b[1]) return b[1] - a[1];
    return b[0] - a[0];
  });

  const [firstRank, firstCount] = sortedEntries[0];
  const [secondRank, secondCount] = sortedEntries[1] ?? [0, 0];
  const [thirdRank] = sortedEntries[2] ?? [0, 0];
  const sortedRanksDesc = ranks.slice().sort((a, b) => b - a);

  if (straight && flush) {
    return [8, straightHigh];
  }

  if (firstCount === 4) {
    const kicker = sortedRanksDesc.find((rank) => rank !== firstRank) ?? 0;
    return [7, firstRank, kicker];
  }

  if (firstCount === 3 && secondCount === 2) {
    return [6, firstRank, secondRank];
  }

  if (flush) {
    return [5, ...sortedRanksDesc];
  }

  if (straight) {
    return [4, straightHigh];
  }

  if (firstCount === 3) {
    const kickers = sortedRanksDesc
      .filter((rank) => rank !== firstRank)
      .slice(0, 2);
    return [3, firstRank, ...kickers];
  }

  if (firstCount === 2 && secondCount === 2) {
    const kicker =
      sortedRanksDesc.find(
        (rank) => rank !== firstRank && rank !== secondRank,
      ) ?? 0;
    return [2, firstRank, secondRank, kicker];
  }

  if (firstCount === 2) {
    const kickers = sortedRanksDesc
      .filter((rank) => rank !== firstRank)
      .slice(0, 3);
    return [1, firstRank, ...kickers];
  }

  return [0, ...sortedRanksDesc];
}

function evaluateBestHand(
  holeCards: [CardFace, CardFace],
  community: CardFace[],
): HandRank {
  const allCards = [holeCards[0], holeCards[1], ...community];
  const combinations = getCombinations(allCards, 5);
  let bestRank: HandRank | null = null;

  for (const combo of combinations) {
    const rank = evaluate5CardHand(combo);
    if (!bestRank || compareHandRank(rank, bestRank) > 0) {
      bestRank = rank;
    }
  }

  return bestRank ?? [0, 0, 0, 0, 0, 0];
}

function determineWinners(players: Player[], community: CardFace[]): Player[] {
  const active = getActivePlayers(players);
  let bestRank: HandRank | null = null;
  let winners: Player[] = [];

  active.forEach((player) => {
    if (!player.cards[0] || !player.cards[1]) return;
    const rank = evaluateBestHand(
      player.cards as [CardFace, CardFace],
      community,
    );
    if (!bestRank || compareHandRank(rank, bestRank) > 0) {
      bestRank = rank;
      winners = [player];
    } else if (compareHandRank(rank, bestRank) === 0) {
      winners.push(player);
    }
  });

  return winners;
}

// ─── SVG Suit Icons ───────────────────────────────────────────────────────────
function SuitIcon({
  suit,
  size = 9.8,
  color,
}: {
  suit: Suit;
  size?: number;
  color?: string;
}) {
  const fill =
    color ?? (suit === "hearts" || suit === "diamonds" ? CRIMSON : WHITE);
  switch (suit) {
    case "spades":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 2 C12 2 3 9 3 14 C3 17.3 5.7 20 9 20 C9 20 8 22 6 22 L18 22 C16 22 15 20 15 20 C18.3 20 21 17.3 21 14 C21 9 12 2 12 2Z"
            fill={fill}
          />
        </svg>
      );
    case "hearts":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21 C12 21 3 14 3 8.5 C3 5.4 5.4 3 8.5 3 C10.2 3 11.7 3.8 12 4.7 C12.3 3.8 13.8 3 15.5 3 C18.6 3 21 5.4 21 8.5 C21 14 12 21 12 21Z"
            fill={fill}
          />
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

// ─── Card Back ────────────────────────────────────────────────────────────────
function CardBack({
  width = 50,
  height = 70,
}: {
  width?: number;
  height?: number;
}) {
  const id = `cb-${width}-${height}`;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 38 54"
      style={{ filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.75))" }}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={BLACK} />
          <stop offset="55%" stopColor="#1a0008" />
          <stop offset="100%" stopColor={BLACK} />
        </linearGradient>
        <pattern
          id={`${id}-pat`}
          x="0"
          y="0"
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <rect width="8" height="8" fill="transparent" />
          <path d="M0 4 L4 0 L8 4 L4 8 Z" fill={CRIMSON} fillOpacity="0.45" />
        </pattern>
      </defs>
      <rect rx="4" width="38" height="54" fill={`url(#${id}-bg)`} />
      <rect rx="4" width="38" height="54" fill={`url(#${id}-pat)`} />
      <rect
        rx="4"
        width="38"
        height="54"
        fill="none"
        stroke={CRIMSON}
        strokeWidth="2"
        strokeOpacity="0.8"
      />
      <g transform="translate(19,27)" opacity="0.75">
        <g transform="translate(-7,-7)">
          <SuitIcon suit="spades" size={6.3} color={WHITE} />
        </g>
        <g transform="translate(1,-7)">
          <SuitIcon suit="hearts" size={6.3} color={CRIMSON} />
        </g>
        <g transform="translate(-7,1)">
          <SuitIcon suit="diamonds" size={6.3} color={CRIMSON} />
        </g>
        <g transform="translate(1,1)">
          <SuitIcon suit="clubs" size={6.3} color={WHITE} />
        </g>
      </g>
    </svg>
  );
}

// ─── Card Front ───────────────────────────────────────────────────────────────
function CardFront({
  card,
  width = 50,
  height = 70,
}: {
  card: CardFace;
  width?: number;
  height?: number;
}) {
  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const suitColor = isRed ? CRIMSON : BLACK;
  const cornerRankSize = 14;
  const cornerSuitSize = 8.4;
  const centerSuitSize = 18.2;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 38 54"
      style={{ filter: "drop-shadow(0 3px 12px rgba(0,0,0,0.85))" }}
    >
      <rect rx="4" width="38" height="54" fill={WHITE} />
      <rect
        rx="4"
        width="38"
        height="54"
        fill="none"
        stroke="#bbb"
        strokeWidth="1"
      />

      {/* top-left rank + suit */}
      <text
        x="3"
        y="14"
        fontSize={cornerRankSize}
        fontWeight="800"
        fontFamily="Georgia,serif"
        fill={suitColor}
        style={{ textShadow: "0 0 2px rgba(0,0,0,0.18)" }}
      >
        {card.rank}
      </text>
      <g transform="translate(3,16)">
        <SuitIcon suit={card.suit} size={cornerSuitSize} color={suitColor} />
      </g>

      {/* center suit */}
      <g
        transform={`translate(${38 / 2 - centerSuitSize / 2},${54 / 2 - centerSuitSize / 2})`}
      >
        <SuitIcon suit={card.suit} size={centerSuitSize} color={suitColor} />
      </g>

      {/* bottom-right rank + suit (rotated) */}
      <g transform="rotate(180,19,27)">
        <text
          x="3"
          y="14"
          fontSize={cornerRankSize}
          fontWeight="800"
          fontFamily="Georgia,serif"
          fill={suitColor}
          style={{ textShadow: "0 0 2px rgba(0,0,0,0.18)" }}
        >
          {card.rank}
        </text>
        <g transform="translate(3,16)">
          <SuitIcon suit={card.suit} size={cornerSuitSize} color={suitColor} />
        </g>
      </g>
    </svg>
  );
}

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({
  card,
  revealed,
}: {
  card?: CardFace;
  revealed: boolean;
}) {
  const width = 62;
  const height = 88;

  if (!card) {
    return (
      <div
        style={{
          width,
          height,
          borderRadius: 10,
          border: "2px dashed rgba(255,255,255,0.2)",
          background: "rgba(255,255,255,0.04)",
          boxShadow: "inset 0 0 14px rgba(0,0,0,0.2)",
        }}
      />
    );
  }

  return (
    <div
      style={{
        transition: "transform 0.4s ease",
        transform: revealed ? "rotateY(0deg)" : "rotateY(0deg)",
      }}
    >
      {revealed ? (
        <CardFront card={card} width={width} height={height} />
      ) : (
        <CardBack width={width} height={height} />
      )}
    </div>
  );
}

// ─── Royal Stack Watermark ────────────────────────────────────────────────────
function RoyalStackWatermark() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          opacity: 0.12,
          userSelect: "none",
        }}
      >
        {/* Mini suits grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 8,
            marginBottom: 8,
          }}
        >
          <SuitIcon suit="spades" size={27.3} color={WHITE} />
          <SuitIcon suit="hearts" size={27.3} color={CRIMSON} />
          <SuitIcon suit="diamonds" size={27.3} color={CRIMSON} />
          <SuitIcon suit="clubs" size={27.3} color={WHITE} />
        </div>
        <div
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: 63,
            fontWeight: 800,
            color: WHITE,
            letterSpacing: 5,
            lineHeight: 1.05,
            textAlign: "center",
          }}
        >
          ROYAL
          <br />
          STACK
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 12,
            color: CRIMSON,
            letterSpacing: 4,
            marginTop: 6,
            opacity: 1,
          }}
        >
          POWERED BY MEZO
        </div>
      </div>
    </div>
  );
}

// ─── Player Seat ──────────────────────────────────────────────────────────────
function PlayerSeat({
  player,
  isCurrentTurn,
}: {
  player: Player;
  isCurrentTurn: boolean;
}) {
  const { anchor } = player.position;

  const alignH = anchor.includes("left")
    ? "flex-start"
    : anchor.includes("right")
      ? "flex-end"
      : "center";

  const isHuman = player.id === HUMAN_PLAYER_ID;

  // Larger cards for visibility
  const cardRow = (
    <div style={{ display: "flex", gap: 6, justifyContent: alignH }}>
      {player.isFolded ? (
        <span
          style={{
            fontSize: 12,
            color: "#ff4466",
            fontFamily: "Georgia,serif",
            opacity: 0.7,
          }}
        >
          FOLDED
        </span>
      ) : (
        player.cards.map((c, i) =>
          c ? (
            <div
              key={i}
              style={{ transform: i === 0 ? "rotate(-3deg)" : "rotate(3deg)" }}
            >
              {isHuman ? (
                <CardFront card={c} width={50} height={70} />
              ) : (
                <CardBack width={50} height={70} />
              )}
            </div>
          ) : null,
        )
      )}
    </div>
  );

  // Player details beside cards
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        opacity: player.isFolded ? 0.45 : 1,
        transition: "opacity 0.3s",
      }}
    >
      {cardRow}
      <div style={{ position: "relative" }}>
        <div
          style={{
            background: isCurrentTurn
              ? `linear-gradient(135deg, ${CRIMSON}, #9e0028)`
              : "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
            border: `1.5px solid ${isCurrentTurn ? CRIMSON : "rgba(255,255,255,0.18)"}`,
            borderRadius: 10,
            padding: "8px 16px",
            backdropFilter: "blur(8px)",
            boxShadow: isCurrentTurn
              ? `0 0 18px ${CRIMSON}88, 0 2px 8px rgba(0,0,0,0.6)`
              : "0 2px 8px rgba(0,0,0,0.5)",
            minWidth: 110,
            textAlign: "center",
            transition: "all 0.3s",
          }}
        >
          {player.isDealer && (
            <div
              style={{
                fontSize: 10,
                color: CRIMSON,
                fontFamily: "Georgia,serif",
                letterSpacing: 1,
                marginBottom: 2,
              }}
            >
              ♦ DEALER ♦
            </div>
          )}
          <div
            style={{
              color: WHITE,
              fontFamily: "Poppins, Georgia, 'Times New Roman', serif",
              fontSize: 16,
              fontWeight: 800,
              letterSpacing: 0.6,
            }}
          >
            {player.name}
          </div>
          <div
            style={{
              color: isCurrentTurn ? WHITE : "#ddd",
              fontFamily: "monospace",
              fontSize: 14,
              marginTop: 2,
            }}
          >
            ${player.chips.toLocaleString()}
          </div>
          {player.bet > 0 && (
            <div
              style={{
                marginTop: 3,
                fontSize: 11,
                color: "#c70052",
                fontFamily: "monospace",
              }}
            >
              bet ${player.bet}
            </div>
          )}
        </div>

        {/* Action Bubble */}
        {(player.lastAction || isCurrentTurn) && !player.isFolded && (
          <div
            style={{
              position: "absolute",
              bottom: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              marginBottom: 8,
              background: "rgba(0,0,0,0.85)",
              border: `1px solid ${isCurrentTurn ? CRIMSON : "rgba(255,255,255,0.2)"}`,
              borderRadius: 6,
              padding: "4px 10px",
              color: isCurrentTurn ? "#ffcccc" : WHITE,
              fontFamily: "monospace",
              fontSize: 11,
              whiteSpace: "nowrap",
              boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
              zIndex: 50,
              pointerEvents: "none",
            }}
          >
            {isCurrentTurn ? "Thinking..." : player.lastAction}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chip Stack ───────────────────────────────────────────────────────────────
function Pot({ amount }: { amount: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
      }}
    >
      {/* Chip icon */}
      <svg width="32" height="32" viewBox="0 0 32 32">
        <circle
          cx="16"
          cy="16"
          r="14"
          fill={CRIMSON}
          stroke={WHITE}
          strokeWidth="1.5"
        />
        <circle
          cx="16"
          cy="16"
          r="10"
          fill="transparent"
          stroke={WHITE}
          strokeWidth="1"
          strokeDasharray="4 2"
        />
        <text
          x="16"
          y="20"
          textAnchor="middle"
          fontSize="8"
          fill={WHITE}
          fontFamily="Georgia,serif"
          fontWeight="700"
        >
          POT
        </text>
      </svg>
      <div
        style={{
          color: WHITE,
          fontFamily: "Poppins, Georgia, serif",
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: 1,
          textShadow: `0 0 10px ${CRIMSON}`,
        }}
      >
        ${amount.toLocaleString()}
      </div>
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export default function PokerTable({
  smallBlind = 10,
  bigBlind = 20,
  label = "Demo Table",
  speed = "normal",
}: PokerTableProps) {
  const BLINDS = { small: smallBlind, big: bigBlind };
  const BOT_DELAY = speed === "fast" ? 400 : 900;
  const [winner, setWinner] = useState<Player | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const [players, setPlayers] = useState<Player[]>(DEFAULT_PLAYERS);
  const [dealerId, setDealerId] = useState<number>(
    DEFAULT_PLAYERS.find((player) => player.isDealer)?.id ??
      DEFAULT_PLAYERS[0].id,
  );
  const [currentTurn, setCurrentTurn] = useState<number | null>(null);
  const [pot, setPot] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("roundEnd");
  const [communityCards, setCommunityCards] = useState<CardFace[]>([]);
  const [deck, setDeck] = useState<CardFace[]>([]);
  const [currentBet, setCurrentBet] = useState(0);
  const [phaseTurnStarter, setPhaseTurnStarter] = useState<number | null>(null);
  const [raiseValue, setRaiseValue] = useState<number>(0);
  const [isRaising, setIsRaising] = useState(false);
  const [actionLog, setActionLog] = useState<string[]>([
    "Press DEAL to start a new hand.",
  ]);

  const currentPlayer = currentTurn
    ? (players.find((player) => player.id === currentTurn) ?? null)
    : null;

  const callAmount = currentPlayer
    ? Math.max(currentBet - currentPlayer.bet, 0)
    : 0;

  const isHumanTurn =
    currentPlayer?.id === HUMAN_PLAYER_ID && phase !== "roundEnd";

  const activePlayers = getActivePlayers(players);
  const currentLabel =
    phase === "roundEnd"
      ? "Ready to deal a new hand"
      : currentPlayer?.id === HUMAN_PLAYER_ID
        ? "Your turn"
        : `${currentPlayer?.name ?? "Waiting"} is acting...`;

  // Always show 5 community card slots, populated with actual dealt cards
  const visibleCommunity = communityCards
    .concat(Array(5 - communityCards.length).fill(null))
    .slice(0, 5);

  // For demo/UX: always reveal community cards once they're dealt
  const communityRevealed = visibleCommunity.map((card) => !!card);

  const addLog = (entry: string) => {
    setActionLog((prev) => [...prev.slice(-4), entry]);
  };

  function dealNewHand() {
    sounds.cardDeal();
    const freshDeck = shuffleCards(createDeck());
    const nextDealer = getNextActivePlayer(players, dealerId) ?? dealerId;
    const sbPlayerId = getNextActivePlayer(players, nextDealer) ?? nextDealer;
    const bbPlayerId = getNextActivePlayer(players, sbPlayerId) ?? sbPlayerId;
    const starterId = getNextActivePlayer(players, bbPlayerId) ?? bbPlayerId;

    const resetPlayers = players.map((player) => ({
      ...player,
      isFolded: false,
      bet: 0,
      cards: [null, null],
      isDealer: player.id === nextDealer,
      lastAction: undefined,
    }));

    const deckCopy = [...freshDeck];
    const dealtPlayers = resetPlayers.map((player) => {
      const first = deckCopy.shift();
      const second = deckCopy.shift();
      return {
        ...player,
        cards: [
          first ?? { rank: "2", suit: "clubs" },
          second ?? { rank: "2", suit: "clubs" },
        ] as [CardFace, CardFace],
      };
    });

    const withBlinds = dealtPlayers.map((player) => {
      if (player.id === sbPlayerId) {
        const posted = Math.min(player.chips, BLINDS.small);
        return { ...player, chips: player.chips - posted, bet: posted };
      }
      if (player.id === bbPlayerId) {
        const posted = Math.min(player.chips, BLINDS.big);
        return { ...player, chips: player.chips - posted, bet: posted };
      }
      return player;
    });

    const sbPlayer = withBlinds.find((player) => player.id === sbPlayerId);
    const bbPlayer = withBlinds.find((player) => player.id === bbPlayerId);
    const potAmount = (sbPlayer?.bet ?? 0) + (bbPlayer?.bet ?? 0);

    setDealerId(nextDealer);
    setPlayers(withBlinds);
    setDeck(deckCopy);
    setCommunityCards([]);
    setPot(potAmount);
    setCurrentBet(bbPlayer?.bet ?? 0);
    setPhase("preflop");
    setCurrentTurn(starterId);
    setPhaseTurnStarter(starterId);
    addLog(
      `Dealt a new hand. ${sbPlayer?.name} posted SB ${formatMoney(sbPlayer?.bet ?? 0)}, ${bbPlayer?.name} posted BB ${formatMoney(bbPlayer?.bet ?? 0)}.`,
    );
  }

  function completeRound(updatedPlayers: Player[], winners: Player[]) {
    const share = Math.floor(pot / winners.length);
    const remainder = pot - share * winners.length;
    const updated = updatedPlayers.map((player, index) => {
      if (winners.some((winner) => winner.id === player.id)) {
        return {
          ...player,
          chips: player.chips + share + (index === 0 ? remainder : 0),
        };
      }
      return player;
    });

    setPlayers(updated);
    setPhase("roundEnd");
    setCurrentTurn(null);
    if (winners.length === 1) {
      setWinner(winners[0]);
      setShowWinner(true);
      setTimeout(() => setShowWinner(false), 3500);
    } else {
      setWinner(null);
      setShowWinner(false);
    }
    addLog(
      winners.length === 1
        ? `${winners[0].name} wins ${formatMoney(pot)}.`
        : `${winners.map((winner) => winner.name).join(", ")} split ${formatMoney(pot)}.`,
    );
  }

  function resolveHandEnd(updatedPlayers: Player[]): boolean {
    const survivors = getActivePlayers(updatedPlayers);
    if (survivors.length === 1) {
      completeRound(updatedPlayers, survivors);
      return true;
    }
    return false;
  }

  function dealPhase(
    updatedPlayers: Player[],
    nextCommunity: CardFace[],
    nextPhase: GamePhase,
    starterId: number | null,
  ) {
    sounds.cardDeal();
    setPlayers(resetPlayerBets(updatedPlayers));
    setCommunityCards(nextCommunity);
    setCurrentBet(0);
    setPhase(nextPhase);
    setPhaseTurnStarter(starterId);
    setCurrentTurn(starterId);
    addLog(`Dealing the ${nextPhase}.`);
  }

  function advancePhase(updatedPlayers: Player[]) {
    const dealer =
      updatedPlayers.find((player) => player.id === dealerId) ??
      updatedPlayers[0];
    const starterId = getNextActivePlayer(updatedPlayers, dealer.id);
    const nextDeck = [...deck];

    if (phase === "preflop") {
      const flop = nextDeck.splice(0, 3);
      setDeck(nextDeck);
      dealPhase(updatedPlayers, flop, "flop", starterId);
      return;
    }

    if (phase === "flop") {
      const turnCard = nextDeck.shift();
      if (turnCard) {
        setDeck(nextDeck);
        dealPhase(
          updatedPlayers,
          [...communityCards, turnCard],
          "turn",
          starterId,
        );
        return;
      }
    }

    if (phase === "turn") {
      const riverCard = nextDeck.shift();
      if (riverCard) {
        setDeck(nextDeck);
        dealPhase(
          updatedPlayers,
          [...communityCards, riverCard],
          "river",
          starterId,
        );
        return;
      }
    }

    if (phase === "river") {
      setPhase("showdown");
      const winners = determineWinners(updatedPlayers, communityCards);
      completeRound(updatedPlayers, winners);
    }
  }

  function handlePlayerAction(action: PlayerAction, amount?: number) {
    if (phase === "roundEnd" || currentTurn === null) return;

    const player = players.find((entry) => entry.id === currentTurn);
    if (!player) return;

    const nextTurnId = getNextActivePlayer(players, player.id);
    const updatedPlayers = players.map((entry) => ({ ...entry }));
    let updatedPot = pot;
    let updatedBet = currentBet;
    let raiseOccurred = false;
    let message = "";

    if (action === "fold") {
      if (player.id === HUMAN_PLAYER_ID) sounds.fold();
      updatedPlayers.forEach((entry) => {
        if (entry.id === player.id) {
          entry.isFolded = true;
          entry.lastAction = "Fold";
        }
      });
      message = `${player.name} folds.`;
    } else if (action === "call") {
      sounds.chipClink();
      const amount = Math.min(callAmount, player.chips);
      updatedPlayers.forEach((entry) => {
        if (entry.id === player.id) {
          entry.chips -= amount;
          entry.bet += amount;
          entry.lastAction =
            amount > 0 ? `Call ${formatMoney(amount)}` : "Call";
        }
      });
      updatedPot += amount;
      message = `${player.name} calls ${formatMoney(amount)}.`;
    } else if (action === "check") {
      updatedPlayers.forEach((entry) => {
        if (entry.id === player.id) entry.lastAction = "Check";
      });
      message = `${player.name} checks.`;
    } else if (action === "bet" || action === "raise") {
      sounds.chipClink();
      const isBet = action === "bet";
      const defaultAmount = isBet
        ? Math.min(player.chips, BLINDS.big)
        : Math.min(player.chips, Math.max(BLINDS.big, callAmount + BLINDS.big));
      const wagered = amount ?? defaultAmount;
      updatedPlayers.forEach((entry) => {
        if (entry.id === player.id) {
          entry.chips -= wagered;
          entry.bet += wagered;
          entry.lastAction = isBet
            ? `Bet ${formatMoney(wagered)}`
            : `Raise to ${formatMoney(entry.bet)}`;
        }
      });
      updatedPot += wagered;
      updatedBet = player.bet + wagered;
      raiseOccurred = true;
      message = isBet
        ? `${player.name} bets ${formatMoney(wagered)}.`
        : `${player.name} raises to ${formatMoney(updatedBet)}.`;
    }

    setPlayers(updatedPlayers);
    setPot(updatedPot);
    setCurrentBet(updatedBet);
    addLog(message);

    if (resolveHandEnd(updatedPlayers)) return;

    if (raiseOccurred) {
      setPhaseTurnStarter(nextTurnId);
      setCurrentTurn(nextTurnId);
      return;
    }

    if (
      nextTurnId !== null &&
      phaseTurnStarter !== null &&
      nextTurnId === phaseTurnStarter &&
      hasAllActivePlayersMatched(updatedPlayers, updatedBet)
    ) {
      advancePhase(updatedPlayers);
      return;
    }

    setCurrentTurn(nextTurnId);
  }

  useEffect(() => {
    if (!currentTurn || phase === "roundEnd" || currentTurn === HUMAN_PLAYER_ID)
      return;

    const timeout = setTimeout(() => {
      const player = players.find((entry) => entry.id === currentTurn);
      if (!player) return;

      const toCall = Math.max(currentBet - player.bet, 0);
      const canAgress = player.chips > toCall;
      let action: PlayerAction = "check";

      // Hand strength (0–1) drives decisions — bots now play their cards
      const strength = getHoleStrength(
        player.cards as [CardFace | null, CardFace | null],
      );
      // Pot odds: minimum equity needed to break even on a call
      const potOdds = toCall > 0 ? toCall / (pot + toCall) : 0;

      // Style multipliers
      const style = player.style ?? "passive";
      const { aggrMult, passiveMult } = {
        aggressive: { aggrMult: 1.5, passiveMult: 0.5 },
        calling: { aggrMult: 0.6, passiveMult: 1.8 },
        tight: { aggrMult: 1.1, passiveMult: 0.7 },
        passive: { aggrMult: 0.8, passiveMult: 1.2 },
      }[style];

      // Equity estimate: hole strength + 0–15% noise
      const equity = Math.min(1, strength + Math.random() * 0.15);

      if (toCall > 0) {
        const hasOdds = equity > potOdds * passiveMult;

        if (player.chips <= toCall) {
          // Facing a shove — need decent equity
          action = equity > 0.38 * passiveMult ? "call" : "fold";
        } else if (!hasOdds) {
          action = "fold";
        } else if (
          canAgress &&
          equity > 0.62 * (1 / aggrMult) &&
          Math.random() < 0.4 * aggrMult
        ) {
          // Strong hand with odds → re-raise
          action = "raise";
        } else {
          action = "call";
        }
      } else {
        // No bet to call — bet/check based on strength and aggression
        const betThresh = (0.45 - strength * 0.3) / aggrMult; // strong hands bet more
        if (canAgress && Math.random() > betThresh) {
          action = currentBet === 0 ? "bet" : "raise";
        }
      }

      handlePlayerAction(action);
    }, BOT_DELAY);

    return () => clearTimeout(timeout);
  }, [currentTurn, phase, players, currentBet, pot]);

  useEffect(() => {
    if (currentTurn === HUMAN_PLAYER_ID && phase !== "roundEnd") {
      sounds.yourTurn();
    }
  }, [currentTurn]);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 48px)",
        maxWidth: "100%",
        background: BLACK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Georgia, 'Times New Roman', serif",
        overflow: "hidden",
      }}
    >
      {/* Winner animation overlay */}
      {showWinner && winner && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.65)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
            animation: "winnerFadeIn 0.5s",
          }}
        >
          <div
            style={{
              background: `linear-gradient(135deg, ${CRIMSON}, #9e0028 80%)`,
              borderRadius: 24,
              padding: "48px 64px",
              boxShadow: `0 0 60px ${CRIMSON}cc, 0 2px 24px #000`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              animation: "winnerPop 0.7s cubic-bezier(.68,-0.55,.27,1.55)",
            }}
          >
            <span
              style={{
                fontSize: 32,
                color: WHITE,
                fontWeight: 900,
                letterSpacing: 2,
                textShadow: `0 0 18px #fff, 0 0 40px ${CRIMSON}`,
                marginBottom: 12,
                animation: "winnerTextGlow 1.2s infinite alternate",
              }}
            >
              🎉 {winner.name} Wins! 🎉
            </span>
            <span
              style={{
                fontSize: 20,
                color: WHITE,
                fontWeight: 700,
                marginBottom: 8,
                textShadow: `0 0 10px #fff`,
              }}
            >
              🏆 Congratulations! 🏆
            </span>
          </div>
          <style>{`
            @keyframes winnerFadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes winnerPop {
              0% { transform: scale(0.7); }
              80% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
            @keyframes winnerTextGlow {
              from { text-shadow: 0 0 18px #fff, 0 0 40px ${CRIMSON}; }
              to { text-shadow: 0 0 30px #fff, 0 0 80px ${CRIMSON}; }
            }
          `}</style>
        </div>
      )}
      {/* Outer ambient glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 50%, ${CRIMSON}14 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      {/* Table container */}
      <div
        style={{
          position: "relative",
          width: "min(96vw, 920px)",
          height: "min(72vh, 520px)",
        }}
      >
        {/* Table felt - improved design */}
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "10%",
            bottom: "10%",
            borderRadius: "50%",
            background: `radial-gradient(ellipse at 50% 40%, #1b3a2a 0%, #0d3320 60%, #072213 90%, #050f0a 100%)`,
            border: `8px solid #2a0a18`,
            boxShadow: `
              0 0 0 6px ${CRIMSON}44,
              0 0 60px 10px #000a,
              0 0 120px 0px ${CRIMSON}22,
              inset 0 0 80px #0008,
              inset 0 0 180px #0006
            `,
            overflow: "hidden",
            filter: "drop-shadow(0 0 40px #e8003a33)",
          }}
        >
          {/* Felt texture overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.012) 2px,
              rgba(255,255,255,0.012) 4px
            )`,
            }}
          />
          {/* Inner rail */}
          <div
            style={{
              position: "absolute",
              inset: 8,
              borderRadius: "50%",
              border: `1px solid rgba(255,255,255,0.06)`,
              pointerEvents: "none",
            }}
          />
          {/* New RoyalStack logo at center */}
          <RoyalStackLogo
            style={{
              position: "absolute",
              top: "18%",
              left: "50%",
              transform: "translate(-50%, 0)",
              zIndex: 200,
            }}
          />
          {/* Community Cards at center using SVG CardFront */}
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              zIndex: 200,
              position: "absolute",
              top: "38%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            {visibleCommunity.map((card, i) => (
              <div key={i}>
                {card ? (
                  <CardFront card={card} width={48} height={68} />
                ) : (
                  <div
                    style={{
                      width: 48,
                      height: 68,
                      opacity: 0.18,
                      background: "#222",
                      borderRadius: 4,
                      boxShadow: "inset 0 0 10px #000",
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Pot, info, and phase badge below community cards */}
          <div
            style={{
              position: "absolute",
              top: "72%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
              zIndex: 2,
            }}
          >
            {/* Phase badge */}
            <div
              style={{
                background: `linear-gradient(90deg, transparent, ${CRIMSON}44, transparent)`,
                border: `1px solid ${CRIMSON}66`,
                borderRadius: 20,
                padding: "2px 16px",
                fontSize: 10,
                letterSpacing: 3,
                color: CRIMSON,
                textTransform: "uppercase",
              }}
            >
              {phase}
            </div>
            <Pot amount={pot} />
            <div
              style={{
                marginTop: 6,
                display: "flex",
                justifyContent: "center",
              }}
            >
              {phase !== "roundEnd" && currentBet > 0 && (
                <div
                  style={{
                    background: "rgba(232, 0, 58, 0.15)",
                    border: `1px solid rgba(232, 0, 58, 0.4)`,
                    borderRadius: 12,
                    padding: "4px 14px",
                    color: "#ffcccc",
                    fontFamily: "monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: 0.5,
                    boxShadow: "0 2px 12px rgba(232, 0, 58, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <span style={{ opacity: 0.85 }}>Current Bet</span>
                  <span style={{ color: WHITE, fontSize: 13, fontWeight: 800 }}>
                    {formatMoney(currentBet)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rail (outer wood ring visual) */}
        <div
          style={{
            position: "absolute",
            left: "8%",
            right: "8%",
            top: "10%",
            bottom: "10%",
            borderRadius: "50%",
            border: `10px solid transparent`,
            background: `linear-gradient(135deg, #3a0010, #1a0008, #3a0010, #1a0008) border-box`,
            WebkitMask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`,
            WebkitMaskComposite: "destination-out",
            maskComposite: "exclude",
            pointerEvents: "none",
            zIndex: 10,
          }}
        />

        {/* Players */}
        {players.map((player) => (
          <div
            key={player.id}
            style={{
              position: "absolute",
              left: `${player.position.x}%`,
              top: `${player.position.y}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
          >
            <PlayerSeat
              player={player}
              isCurrentTurn={currentTurn === player.id}
            />
          </div>
        ))}

        {/* Action buttons */}
        <div
          style={{
            position: "absolute",
            bottom: -70,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: 8,
            zIndex: 20,
          }}
        >
          {phase === "roundEnd" ? (
            <button
              style={{
                background: `linear-gradient(135deg, ${CRIMSON}, #9e0028)`,
                border: `1px solid ${CRIMSON}`,
                borderRadius: 8,
                color: WHITE,
                fontFamily: "Georgia, serif",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1,
                padding: "10px 18px",
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                boxShadow: `0 0 16px ${CRIMSON}66, 0 2px 10px rgba(0,0,0,0.5)`,
                transition: "transform 0.2s",
              }}
              onClick={dealNewHand}
            >
              DEAL NEW HAND
            </button>
          ) : isHumanTurn ? (
            isRaising ? (
              (() => {
                const isBetMode = currentBet === 0;
                const sliderMin = isBetMode
                  ? BLINDS.big
                  : Math.max(BLINDS.big, callAmount + BLINDS.big);
                const sliderMax = Math.max(
                  sliderMin,
                  Math.min(...activePlayers.map((p) => p.chips)),
                );
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(0,0,0,0.65)",
                      padding: "16px 24px",
                      borderRadius: 16,
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div
                      style={{
                        color: WHITE,
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "monospace",
                      }}
                    >
                      {isBetMode
                        ? `BET ${formatMoney(raiseValue)}`
                        : `RAISE TO ${formatMoney(raiseValue)}`}
                    </div>
                    <input
                      type="range"
                      min={sliderMin}
                      max={sliderMax}
                      step={BLINDS.big}
                      value={raiseValue}
                      onChange={(e) => setRaiseValue(Number(e.target.value))}
                      style={{ width: 200, accentColor: CRIMSON }}
                    />
                    <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
                      <button
                        style={{
                          background: "rgba(255,255,255,0.1)",
                          border: "1px solid rgba(255,255,255,0.2)",
                          borderRadius: 8,
                          color: WHITE,
                          padding: "8px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                        onClick={() => setIsRaising(false)}
                      >
                        CANCEL
                      </button>
                      <button
                        style={{
                          background: `linear-gradient(135deg, ${CRIMSON}, #9e0028)`,
                          border: `1px solid ${CRIMSON}`,
                          borderRadius: 8,
                          color: WHITE,
                          padding: "8px 16px",
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: "pointer",
                          boxShadow: `0 0 14px ${CRIMSON}66`,
                        }}
                        onClick={() => {
                          handlePlayerAction(
                            isBetMode ? "bet" : "raise",
                            raiseValue,
                          );
                          setIsRaising(false);
                        }}
                      >
                        CONFIRM
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <>
                <button
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    color: WHITE,
                    fontFamily: "Georgia, serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "8px 14px",
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                  onClick={() => handlePlayerAction("fold")}
                >
                  FOLD
                </button>
                <button
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.05))",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: 8,
                    color: WHITE,
                    fontFamily: "Georgia, serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "8px 14px",
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  }}
                  onClick={() =>
                    handlePlayerAction(callAmount > 0 ? "call" : "check")
                  }
                >
                  {callAmount > 0 ? `CALL ${formatMoney(callAmount)}` : "CHECK"}
                </button>
                <button
                  style={{
                    background: `linear-gradient(135deg, ${CRIMSON}, #9e0028)`,
                    border: `1px solid ${CRIMSON}`,
                    borderRadius: 8,
                    color: WHITE,
                    fontFamily: "Georgia, serif",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: "8px 14px",
                    cursor: "pointer",
                    backdropFilter: "blur(8px)",
                    boxShadow: `0 0 14px ${CRIMSON}66, 0 2px 8px rgba(0,0,0,0.5)`,
                  }}
                  onClick={() => {
                    const isBetMode = currentBet === 0;
                    const min = isBetMode
                      ? BLINDS.big
                      : Math.max(BLINDS.big, callAmount + BLINDS.big);
                    setRaiseValue(Math.min(min, currentPlayer?.chips ?? 0));
                    setIsRaising(true);
                  }}
                >
                  {currentBet === 0 ? "BET" : "RAISE"}
                </button>
              </>
            )
          ) : (
            <button
              disabled
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8,
                color: "#aaa",
                fontFamily: "Georgia, serif",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                padding: "8px 14px",
                cursor: "not-allowed",
                backdropFilter: "blur(8px)",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
              }}
            >
              Waiting for opponents...
            </button>
          )}
        </div>

        {/* Header info bar */}
        <div
          style={{
            position: "absolute",
            top: -36,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 20,
          }}
        >
          {/* Royal Stack logo text */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
              }}
            >
              <SuitIcon suit="spades" size={7} color={WHITE} />
              <SuitIcon suit="hearts" size={7} color={CRIMSON} />
              <SuitIcon suit="diamonds" size={7} color={CRIMSON} />
              <SuitIcon suit="clubs" size={7} color={WHITE} />
            </div>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 15,
                fontWeight: 700,
                color: WHITE,
                letterSpacing: 2,
              }}
            >
              ROYAL STACK
            </span>
            <span
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 8,
                color: CRIMSON,
                letterSpacing: 2,
                alignSelf: "flex-end",
                marginBottom: 1,
              }}
            >
              POWERED BY MEZO
            </span>
          </div>
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.2)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: "#888",
              fontFamily: "monospace",
              letterSpacing: 1,
            }}
          >
            NL HOLD&apos;EM · ${smallBlind}/${bigBlind}
          </span>
          <div
            style={{
              width: 1,
              height: 20,
              background: "rgba(255,255,255,0.2)",
            }}
          />
          <span
            style={{
              fontSize: 10,
              color: "#666",
              fontFamily: "monospace",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}
