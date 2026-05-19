"use client";
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { useRouter } from "next/navigation";

export default function RoyalStacksHero() {
  const [glitch, setGlitch] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const g = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 120);
    }, 5000);
    return () => clearInterval(g);
  }, []);

  const handlePlayPoker = () => {
    router.push("/game");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Electrolize:wght@400&family=Orbitron:wght@400;600;700;900&family=Share+Tech+Mono:wght@400&family=Audiowide&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #000;
          font-family: 'Electrolize', sans-serif;
          overflow-x: hidden;
          -webkit-text-size-adjust: 100%;
          -webkit-tap-highlight-color: transparent;
        }

        .page-wrap {
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          background:
            repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,10,84,0.02) 35px, rgba(255,10,84,0.02) 70px),
            repeating-linear-gradient(-45deg, transparent, transparent 35px, rgba(255,10,84,0.02) 35px, rgba(255,10,84,0.02) 70px),
            radial-gradient(circle at 20% 50%, rgba(255,10,84,0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(255,10,84,0.05) 0%, transparent 50%),
            linear-gradient(180deg, #0d0018 0%, #000 50%, #0a0810 100%);
          position: relative;
          overflow: hidden;
        }

        .page-wrap::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            radial-gradient(circle at 10% 20%, rgba(255,10,84,0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 80%, rgba(255,10,84,0.06) 0%, transparent 40%),
            repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(255,10,84,0.02) 50px, rgba(255,10,84,0.02) 51px),
            repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,10,84,0.02) 50px, rgba(255,10,84,0.02) 51px);
          background-size: 100% 100%, 100% 100%, 100px 100px, 100px 100px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.7;
        }

        /* Glow orbs - optimized for mobile */
        .glow-orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
          opacity: 0.7;
        }
        .glow-orb-1 {
          width: 350px; height: 350px;
          background: radial-gradient(circle, rgba(255,10,84,0.15), transparent);
          top: -50px; right: -150px;
          animation: float1 25s ease-in-out infinite;
        }
        .glow-orb-2 {
          width: 250px; height: 250px;
          background: radial-gradient(circle, rgba(255,10,84,0.1), transparent);
          bottom: -80px; left: -100px;
          animation: float2 30s ease-in-out infinite;
        }
        .glow-orb-3 {
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(255,10,84,0.08), transparent);
          top: 40%; right: -50px;
          animation: float3 35s ease-in-out infinite;
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0,0); }
          25% { transform: translate(-40px,60px); }
          50% { transform: translate(-80px,0); }
          75% { transform: translate(-40px,-60px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0,0); }
          25% { transform: translate(40px,-60px); }
          50% { transform: translate(80px,0); }
          75% { transform: translate(40px,60px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(-30px,-30px); }
        }

        /* HERO - Mobile-first approach */
        .hero {
          flex: 1;
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: stretch;
          justify-content: center;
          padding: 24px 20px 32px;
          min-height: calc(100vh - 80px);
          min-height: calc(100dvh - 80px);
        }

        .hero-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        /* Mobile: text first, then image */
        .hero-left { 
          order: 1; 
          width: 100%;
          text-align: center;
        }
        .hero-right { 
          order: 2; 
          width: 100%;
        }

        .hero-left {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .chain-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,10,84,0.15);
          border: 1px solid rgba(255,10,84,0.4);
          border-radius: 100px;
          padding: 6px 14px;
          margin-bottom: 16px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 9px;
          letter-spacing: 1.5px;
          color: #FF0A54;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .pulse-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: #FF0A54;
          flex-shrink: 0;
          box-shadow: 0 0 8px #FF0A54;
          position: relative;
        }
        .pulse-dot::after {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          background: #FF0A54;
          animation: pulse 1.5s ease-out infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }

        .hero-title {
          font-family: 'Audiowide', sans-serif;
          font-size: clamp(32px, 12vw, 80px);
          font-weight: 700;
          line-height: 0.9;
          letter-spacing: -1px;
          margin-bottom: 12px;
          text-transform: uppercase;
          text-align: center;
          width: 100%;
        }

        .title-royal {
          display: block;
          color: #fff;
          text-shadow: 0 0 20px rgba(255,255,255,0.2), 0 0 40px rgba(255,10,84,0.3);
        }

        .title-stacks {
          display: block;
          color: #FF0A54;
          text-shadow: 0 0 30px rgba(255,10,84,0.6), 0 0 60px rgba(255,10,84,0.3);
        }

        .title-stacks.glitch {
          animation: glitch 0.15s steps(3) 1;
        }
        @keyframes glitch {
          0% { transform: translate(-2px,2px); }
          20% { transform: translate(2px,-2px); }
          40% { transform: translate(-1px,1px); }
          60% { transform: translate(1px,-1px); }
          100% { transform: translate(0,0); }
        }

        .hero-sub {
          font-family: 'Electrolize', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          line-height: 1.6;
          letter-spacing: 0.3px;
          margin-bottom: 24px;
          max-width: 400px;
          text-align: center;
          padding: 0 8px;
        }
        .hero-sub span {
          color: #FF0A54;
          font-weight: 600;
          text-shadow: 0 0 10px rgba(255,10,84,0.4);
        }

        /* Buttons - full width on mobile */
        .btn-row {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 0;
          width: 100%;
          max-width: 320px;
        }

        .btn-primary {
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 14px 32px;
          font-family: 'Audiowide', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: all 0.3s;
          box-shadow: 0 0 20px rgba(255,10,84,0.4);
          position: relative;
          overflow: hidden;
          width: 100%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 48px;
        }
        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .btn-primary:active {
          transform: scale(0.98);
          box-shadow: 0 0 40px rgba(255,10,84,0.8);
        }
        @media (hover: hover) {
          .btn-primary:hover {
            box-shadow: 0 0 40px rgba(255,10,84,0.8), inset 0 0 20px rgba(255,255,255,0.1);
            transform: translateY(-3px);
          }
          .btn-primary:hover::after { transform: translateX(100%); }
        }

        .btn-ghost {
          background: transparent;
          color: #FF0A54;
          border: 1px solid #FF0A54;
          padding: 13px 32px;
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          transition: all 0.3s;
          box-shadow: 0 0 15px rgba(255,10,84,0.2);
          width: 100%;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 48px;
        }
        .btn-ghost:active {
          transform: scale(0.98);
          background: rgba(255,10,84,0.1);
        }
        @media (hover: hover) {
          .btn-ghost:hover {
            background: rgba(255,10,84,0.1);
            box-shadow: 0 0 30px rgba(255,10,84,0.6);
            transform: translateY(-3px);
          }
        }

        /* Stats - now below the image on mobile */
        .stats-row {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,10,84,0.2);
          width: 100%;
          max-width: 400px;
          justify-content: space-around;
          margin: 0 auto;
        }
        .stat { 
          flex: 1; 
          min-width: 80px;
          text-align: center;
        }
        .stat-val {
          font-family: 'Audiowide', sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #fff;
          text-shadow: 0 0 15px rgba(255,10,84,0.4);
          line-height: 1;
          margin-bottom: 4px;
        }
        .stat-val em {
          color: #FF0A54;
          font-style: normal;
          text-shadow: 0 0 10px rgba(255,10,84,0.6);
          font-size: 16px;
        }
        .stat-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 8px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1.5px;
          text-transform: uppercase;
          white-space: nowrap;
        }

        /* Hero image - better mobile sizing */
        .hero-right {
          position: relative;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 2;
          gap: 24px;
        }
        .card-image-wrap {
          width: 100%;
          max-width: 320px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 0;
        }
        .card-img {
          width: 100%;
          max-width: 280px;
          height: auto;
          max-height: 220px;
          object-fit: contain;
          filter: drop-shadow(0 0 25px rgba(255,10,84,0.4)) drop-shadow(0 0 50px rgba(255,10,84,0.2));
          animation: floatImg 4s ease-in-out infinite;
        }
        @keyframes floatImg {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        /* FOOTER - mobile optimized */
        footer {
          position: relative;
          z-index: 10;
          padding: 20px;
          border-top: 1px solid rgba(255,10,84,0.15);
          display: flex;
          flex-direction: column;
          gap: 14px;
          align-items: center;
          text-align: center;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'Audiowide', sans-serif;
        }
        .footer-logo span:first-child {
          color: #FF0A54;
          font-size: 14px;
          text-shadow: 0 0 15px rgba(255,10,84,0.6);
        }
        .footer-logo span:last-child {
          font-size: 9px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          font-weight: 700;
        }
        .footer-copy {
          font-family: 'Share Tech Mono', monospace;
          font-size: 8px;
          color: rgba(255,255,255,0.15);
          letter-spacing: 1px;
        }
        .footer-links {
          display: flex;
          gap: 16px;
          list-style: none;
          justify-content: center;
          flex-wrap: wrap;
        }
        .footer-links a {
          font-family: 'Electrolize', sans-serif;
          font-size: 9px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          text-decoration: none;
          transition: all 0.3s;
          padding: 4px 0;
        }
        .footer-links a:active {
          color: #FF0A54;
          text-shadow: 0 0 10px rgba(255,10,84,0.5);
        }
        @media (hover: hover) {
          .footer-links a:hover {
            color: #FF0A54;
            text-shadow: 0 0 10px rgba(255,10,84,0.5);
          }
        }

        /* Scanlines - reduced opacity on mobile */
        .scanlines {
          position: fixed;
          inset: 0;
          background: repeating-linear-gradient(
            0deg,
            transparent, transparent 4px,
            rgba(0,0,0,0.02) 4px, rgba(0,0,0,0.02) 5px
          );
          pointer-events: none;
          z-index: 999;
        }

        /* ── TABLET (768px+) ── */
        @media (min-width: 768px) {
          .hero {
            padding: 60px 48px;
            min-height: calc(100vh - 120px);
            min-height: calc(100dvh - 120px);
          }
          .hero-container {
            flex-direction: row;
            gap: 60px;
          }
          /* Tablet: text left, image right */
          .hero-left { 
            order: 1; 
            max-width: 520px; 
            text-align: left;
            align-items: flex-start;
          }
          .hero-right { 
            order: 2; 
            flex: 1;
            gap: 0;
          }
          
          .hero-title {
            text-align: left;
          }
          
          .hero-sub {
            text-align: left;
            padding: 0;
          }

          .card-image-wrap {
            max-width: 400px;
          }
          .card-img { 
            max-width: 350px;
            max-height: 300px; 
          }

          .btn-row { 
            flex-direction: row; 
            margin-bottom: 0; 
            max-width: 400px;
          }
          .btn-primary,
          .btn-ghost {
            width: auto;
          }

          /* Stats move back to left column on tablet+ */
          .stats-row {
            margin: 0;
          }
          .hero-right .stats-row {
            display: none;
          }

          footer {
            flex-direction: row;
            justify-content: space-between;
            text-align: left;
            padding: 24px 48px;
            gap: 24px;
          }

          .glow-orb-1 {
            width: 500px; height: 500px;
            top: -100px; right: -200px;
          }
          .glow-orb-2 {
            width: 350px; height: 350px;
            bottom: -100px; left: -120px;
          }
          .glow-orb-3 {
            width: 400px; height: 400px;
            top: 50%; right: -50px;
          }
        }

        /* ── DESKTOP (1024px+) ── */
        @media (min-width: 1024px) {
          .hero { padding: 80px 72px; }
          .hero-container { gap: 80px; }
          .card-image-wrap { max-width: 500px; }
          .card-img { 
            max-width: 450px;
            max-height: 400px; 
          }
          .btn-primary { min-height: 56px; }
          .btn-ghost { min-height: 56px; }
          footer { padding: 32px 72px; }
          
          .glow-orb-1 {
            width: 700px; height: 700px;
            top: 5%; right: -250px;
          }
          .glow-orb-2 {
            width: 500px; height: 500px;
            bottom: -100px; left: -150px;
          }
          .glow-orb-3 {
            width: 600px; height: 600px;
            top: 50%; right: 5%;
          }
        }

        @media (min-width: 1440px) {
          .hero-container { gap: 100px; }
          .card-image-wrap { max-width: 600px; }
          .card-img { 
            max-width: 550px;
            max-height: 500px; 
          }
        }

        /* Small phones (320px-374px) */
        @media (max-width: 374px) {
          .hero { padding: 16px 12px 24px; }
          .hero-title { font-size: clamp(28px, 11vw, 32px); }
          .hero-sub { font-size: 12px; }
          .btn-primary, .btn-ghost { 
            font-size: 10px;
            padding: 12px 24px;
            min-height: 44px;
          }
          .card-img { max-width: 240px; max-height: 180px; }
          .stats-row { gap: 10px; }
          .stat-val { font-size: 18px; }
        }
      `}</style>

      <div className="scanlines" />

      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />

      <div className="page-wrap">
        {/* Navbar — imported separately */}
        <Navbar />

        {/* HERO */}
        <section className="hero">
          <div className="hero-container">

            {/* Copy — renders first on mobile */}
            <div className="hero-left">
              <div className="chain-pill">
                <span className="pulse-dot" />
                <span>Mezo Testnet · Chain ID 31611</span>
              </div>

              <h1 className="hero-title">
                <span className="title-royal">ROYAL</span>
                <span className={`title-stacks${glitch ? " glitch" : ""}`}>STACKS</span>
              </h1>

              <p className="hero-sub">
                The world's most advanced <span>on-chain poker</span> experience.<br />
                Real stakes. Provably fair. Your keys, your chips.<br />
                Powered by <span>Mezo Blockchain</span>.
              </p>

              <div className="btn-row">
                <button className="btn-primary" onClick={handlePlayPoker}>Play Poker Now</button>
                <button className="btn-ghost" onClick={() => router.push("/connect")}>Connect Wallet</button>
              </div>

              {/* Stats shown on tablet+ in left column */}
              <div className="stats-row stats-desktop">
                {[
                  { val: "$4.2M", accent: "+", label: "Total Volume" },
                  { val: "18K",   accent: "+", label: "Active Players" },
                  { val: "1.1M",  accent: "+", label: "Hands Dealt" },
                ].map(s => (
                  <div key={s.label} className="stat">
                    <div className="stat-val">{s.val}<em>{s.accent}</em></div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image — renders second on mobile, below text */}
            <div className="hero-right">
              <div className="card-image-wrap">
                <img
                  className="card-img"
                  src="/hero.png"
                  alt="Royal Stacks poker cards and chips"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>

              {/* Stats shown on mobile below image */}
              <div className="stats-row stats-mobile">
                {[
                  { val: "$4.2M", accent: "+", label: "Total Volume" },
                  { val: "18K",   accent: "+", label: "Active Players" },
                  { val: "1.1M",  accent: "+", label: "Hands Dealt" },
                ].map(s => (
                  <div key={s.label} className="stat">
                    <div className="stat-val">{s.val}<em>{s.accent}</em></div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer>
          <div className="footer-logo">
            <span>♠ ♥ ♦ ♣</span>
            <span>ROYAL STACKS</span>
          </div>
          <p className="footer-copy">© 2026 Royal Stacks · Powered by Mezo Blockchain</p>
          <ul className="footer-links">
            {["Twitter", "Discord", "Telegram", "Docs"].map(l => (
              <li key={l}><a href="#">{l}</a></li>
            ))}
          </ul>
        </footer>
      </div>
    </>
  );
}