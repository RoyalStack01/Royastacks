"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Electrolize&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .err-root {
          min-height: 100vh;
          background: #05000f;
          color: #fff;
          font-family: 'Electrolize', sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px;
          text-align: center;
        }
        .err-logo {
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          color: #fff;
          text-shadow: 0 0 10px rgba(255,10,84,0.5);
          margin-bottom: 48px;
          opacity: 0.7;
        }
        .err-icon {
          font-size: 48px;
          margin-bottom: 24px;
          opacity: 0.6;
        }
        .err-title {
          font-family: 'Audiowide', sans-serif;
          font-size: 20px;
          letter-spacing: 2px;
          color: #fff;
          margin-bottom: 12px;
        }
        .err-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        .err-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .err-btn {
          padding: 10px 24px;
          font-family: 'Electrolize', sans-serif;
          font-size: 12px;
          letter-spacing: 2px;
          text-transform: uppercase;
          border-radius: 6px;
          cursor: pointer;
          border: none;
          transition: opacity 0.2s;
        }
        .err-btn:hover { opacity: 0.8; }
        .err-btn--primary {
          background: #FF0A54;
          color: #fff;
        }
        .err-btn--ghost {
          background: transparent;
          color: rgba(255,255,255,0.5);
          border: 1px solid rgba(255,255,255,0.15);
        }
      `}</style>
      <div className="err-root">
        <div className="err-logo">ROYAL STACKS</div>
        <div className="err-icon">⚠</div>
        <div className="err-title">THIS PAGE COULDN&apos;T LOAD</div>
        <div className="err-sub">
          Reload to try again, or go back.
        </div>
        <div className="err-actions">
          <button className="err-btn err-btn--primary" onClick={reset}>
            Reload
          </button>
          <button className="err-btn err-btn--ghost" onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    </>
  );
}
