import React from "react";

type CommunityCard = {
  rank: string;
  suit: "hearts" | "diamonds" | "spades" | "clubs";
};

type CommunityCardDisplayProps = {
  cards: Array<CommunityCard | null>;
};

export default function CommunityCardDisplay({
  cards,
}: CommunityCardDisplayProps) {
  return (
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
      {cards.map((card, i) =>
        card ? (
          <div
            key={i}
            style={{
              width: 48,
              height: 68,
              background: "#fff",
              borderRadius: 6,
              boxShadow: "0 2px 8px #0008",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: 22,
              color:
                card.suit === "hearts" || card.suit === "diamonds"
                  ? "#E8003A"
                  : "#222",
            }}
          >
            {card.rank}
            <span style={{ fontSize: 18, marginLeft: 4 }}>
              {card.suit === "hearts"
                ? "♥"
                : card.suit === "diamonds"
                  ? "♦"
                  : card.suit === "spades"
                    ? "♠"
                    : "♣"}
            </span>
          </div>
        ) : (
          <div
            key={i}
            style={{
              width: 48,
              height: 68,
              opacity: 0.18,
              background: "#222",
              borderRadius: 6,
              margin: 2,
            }}
          />
        ),
      )}
    </div>
  );
}
