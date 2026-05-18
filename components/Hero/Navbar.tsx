"use client";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Electrolize&display=swap');

        .rs-nav {
          position: relative;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 24px;
          border-bottom: 1px solid rgba(255,10,84,0.15);
          background: rgba(0,0,0,0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .rs-nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }

        .rs-nav-logo img {
          height: 36px;
          width: auto;
          object-fit: contain;
        }

        .rs-nav-logo-text {
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #fff;
          text-shadow: 0 0 10px rgba(255,10,84,0.5);
          white-space: nowrap;
        }

        /* Hamburger */
        .rs-hamburger {
          display: flex;
          flex-direction: column;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          z-index: 110;
        }

        .rs-hamburger span {
          display: block;
          width: 24px;
          height: 2px;
          background: #FF0A54;
          border-radius: 2px;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .rs-hamburger.open span:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .rs-hamburger.open span:nth-child(2) {
          opacity: 0;
          transform: scaleX(0);
        }
        .rs-hamburger.open span:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Mobile dropdown */
        .rs-nav-mobile-menu {
          display: none;
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(5,0,15,0.97);
          border-bottom: 1px solid rgba(255,10,84,0.2);
          padding: 16px 0 24px;
          flex-direction: column;
          align-items: stretch;
          gap: 0;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          z-index: 99;
        }

        .rs-nav-mobile-menu.open {
          display: flex;
        }

        .rs-nav-mobile-menu a {
          font-family: 'Electrolize', sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          padding: 14px 28px;
          border-bottom: 1px solid rgba(255,10,84,0.08);
          transition: color 0.2s, background 0.2s;
        }

        .rs-nav-mobile-menu a:last-of-type {
          border-bottom: none;
        }

        .rs-nav-mobile-menu a:hover {
          color: #FF0A54;
          background: rgba(255,10,84,0.06);
        }

        .rs-nav-mobile-cta {
          margin: 16px 24px 0;
          background: #FF0A54;
          color: #fff !important;
          border: none;
          padding: 13px 24px;
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          text-align: center;
          box-shadow: 0 0 20px rgba(255,10,84,0.35);
          text-decoration: none !important;
        }

        /* Desktop nav links (hidden on mobile) */
        .rs-nav-links {
          display: none;
          list-style: none;
          gap: 28px;
          margin: 0;
          padding: 0;
        }

        .rs-nav-links a {
          font-family: 'Electrolize', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.5);
          text-decoration: none;
          transition: color 0.3s, text-shadow 0.3s;
        }

        .rs-nav-links a:hover {
          color: #FF0A54;
          text-shadow: 0 0 10px rgba(255,10,84,0.7);
        }

        /* Desktop CTA button */
        .rs-nav-cta {
          display: none;
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 10px 24px;
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          cursor: pointer;
          clip-path: polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%);
          transition: box-shadow 0.3s, transform 0.2s;
          box-shadow: 0 0 20px rgba(255,10,84,0.3);
        }

        .rs-nav-cta:hover {
          box-shadow: 0 0 40px rgba(255,10,84,0.7);
          transform: translateY(-2px);
        }

        /* Tablet+ */
        @media (min-width: 768px) {
          .rs-nav {
            padding: 20px 48px;
          }

          .rs-hamburger {
            display: none;
          }

          .rs-nav-mobile-menu {
            display: none !important;
          }

          .rs-nav-links {
            display: flex;
          }

          .rs-nav-cta {
            display: block;
          }
        }

        @media (min-width: 1024px) {
          .rs-nav {
            padding: 24px 72px;
          }
        }
      `}</style>

      <nav className="rs-nav">
        {/* Logo */}
        <a href="/" className="rs-nav-logo">
          <img src="/logo.png" alt="Royal Stacks Logo" />
          <span className="rs-nav-logo-text">ROYAL STACKS</span>
        </a>

        {/* Desktop links */}
        <ul className="rs-nav-links">
          {["Poker Room", "How to Play", "Promotions", "Players", "About"].map(l => (
            <li key={l}><a href="#">{l}</a></li>
          ))}
        </ul>

        {/* Desktop CTA */}
        <button className="rs-nav-cta">Launch App</button>

        {/* Mobile hamburger */}
        <button
          className={`rs-hamburger${menuOpen ? " open" : ""}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>

        {/* Mobile dropdown */}
        <div className={`rs-nav-mobile-menu${menuOpen ? " open" : ""}`}>
          {["Poker Room", "How to Play", "Promotions", "Players", "About"].map(l => (
            <a key={l} href="#" onClick={() => setMenuOpen(false)}>{l}</a>
          ))}
          <a href="#" className="rs-nav-mobile-cta" onClick={() => setMenuOpen(false)}>
            Launch App
          </a>
        </div>
      </nav>
    </>
  );
}