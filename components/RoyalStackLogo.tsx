import React from "react";

const CRIMSON = "#E8003A";
const WHITE = "#FFFFFF";

export default function RoyalStackLogo({ style = {} }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: 0.16,
        userSelect: "none",
        pointerEvents: "none",
        zIndex: 200,
        ...style,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <svg width={39} height={39}><circle cx={19.5} cy={19.5} r={19.5} fill={WHITE} /></svg>
        <svg width={39} height={39}><circle cx={19.5} cy={19.5} r={19.5} fill={CRIMSON} /></svg>
        <svg width={39} height={39}><circle cx={19.5} cy={19.5} r={19.5} fill={CRIMSON} /></svg>
        <svg width={39} height={39}><circle cx={19.5} cy={19.5} r={19.5} fill={WHITE} /></svg>
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
  );
}
