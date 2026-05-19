"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getNonce, verifyAuth } from "../../lib/server";
import { CHAIN_ID } from "../../lib/config";

type Step = "connect" | "auth";

const STORAGE_KEY_TOKEN  = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";

const MEZO_TESTNET = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: "Mezo Testnet",
  nativeCurrency: { name: "mBTC", symbol: "mBTC", decimals: 18 },
  rpcUrls: ["https://rpc.test.mezo.org"],
  blockExplorerUrls: ["https://explorer.test.mezo.org"],
};

const STEPS = [
  { key: "connect", label: "Connect Wallet" },
  { key: "auth",    label: "Authenticate" },
  { key: "lobby",   label: "Waiting Floor" },
] as const;

function stepIndex(s: Step) {
  return STEPS.findIndex((x) => x.key === s);
}

export default function ConnectPage() {
  const router = useRouter();
  const [step, setStep]               = useState<Step>("connect");
  const [walletAddress, setWalletAddress] = useState("");
  const [sessionToken, setSessionToken]   = useState("");
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [wrongNetwork, setWrongNetwork] = useState(false);

  useEffect(() => {
    const storedToken  = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const storedWallet = sessionStorage.getItem(STORAGE_KEY_WALLET);
    if (storedToken && storedWallet) {
      // Already authenticated — go straight to lobby
      router.replace("/lobby");
      return;
    }
    if (storedWallet) { setWalletAddress(storedWallet); setStep("auth"); }
    if (storedToken)  { setSessionToken(storedToken); }
  }, []);

  async function switchNetwork() {
    const eth = (window as any).ethereum;
    if (!eth) return;
    try {
      await eth.request({ method: "wallet_switchEthereumChain", params: [{ chainId: MEZO_TESTNET.chainId }] });
      setWrongNetwork(false);
    } catch (e: any) {
      if (e.code === 4902) {
        await eth.request({ method: "wallet_addEthereumChain", params: [MEZO_TESTNET] });
        setWrongNetwork(false);
      }
    }
  }

  async function checkNetwork() {
    const eth = (window as any).ethereum;
    if (!eth) return;
    const hex: string = await eth.request({ method: "eth_chainId" });
    setWrongNetwork(parseInt(hex, 16) !== CHAIN_ID);
  }

  const connectWallet = async () => {
    setError("");
    const eth = (window as any).ethereum;
    if (!eth) { setError("No Ethereum wallet found. Install MetaMask or a compatible wallet."); return; }
    try {
      setLoading(true);
      const accounts = await eth.request({ method: "eth_requestAccounts" }) as string[];
      if (!accounts?.length) throw new Error("No account returned.");
      const address = accounts[0];
      setWalletAddress(address);
      sessionStorage.setItem(STORAGE_KEY_WALLET, address);
      await checkNetwork();
      setStep("auth");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const authenticate = async () => {
    setError("");
    if (!walletAddress) { setError("Connect your wallet first."); return; }
    const eth = (window as any).ethereum;
    if (!eth) { setError("No Ethereum wallet found."); return; }
    try {
      setLoading(true);
      const { message } = await getNonce(walletAddress);
      const signature = await eth.request({ method: "personal_sign", params: [message, walletAddress] }) as string;
      const { sessionToken: token } = await verifyAuth(walletAddress, signature, message);
      setSessionToken(token);
      sessionStorage.setItem(STORAGE_KEY_TOKEN, token);
      router.push("/lobby");
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  };

  const current = stepIndex(step);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Electrolize&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        .connect-wrap {
          min-height: 100vh;
          background:
            radial-gradient(circle at 20% 50%, rgba(255,10,84,0.07) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,10,84,0.05) 0%, transparent 50%),
            #000;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px 60px;
        }
        .back-link {
          align-self: flex-start;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.3);
          text-decoration: none;
          text-transform: uppercase;
          margin-bottom: 32px;
          transition: color 0.2s;
        }
        .back-link:hover { color: #FF0A54; }
        .connect-title {
          font-family: 'Audiowide', sans-serif;
          font-size: clamp(22px, 5vw, 36px);
          color: #fff;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 6px;
          text-align: center;
        }
        .connect-sub {
          font-family: 'Electrolize', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          margin-bottom: 32px;
          text-align: center;
        }
        .chain-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,10,84,0.08);
          border: 1px solid rgba(255,10,84,0.25);
          border-radius: 12px;
          padding: 12px 20px;
          margin-bottom: 32px;
          width: 100%;
          max-width: 500px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .chain-badge-info { flex: 1; min-width: 160px; }
        .chain-badge-name {
          font-family: 'Audiowide', sans-serif;
          font-size: 12px;
          color: #FF0A54;
          letter-spacing: 1px;
        }
        .chain-badge-detail {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.35);
          letter-spacing: 1px;
          margin-top: 3px;
        }
        .chain-switch-btn {
          font-family: 'Audiowide', sans-serif;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: rgba(255,10,84,0.15);
          color: #FF0A54;
          border: 1px solid rgba(255,10,84,0.4);
          border-radius: 8px;
          padding: 7px 14px;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
        }
        .chain-switch-btn:hover { background: rgba(255,10,84,0.25); }
        .chain-ok {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: #4ade80;
          letter-spacing: 1px;
          white-space: nowrap;
        }
        /* Progress */
        .progress-row {
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 500px;
          margin-bottom: 36px;
        }
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }
        .progress-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Share Tech Mono', monospace;
          font-size: 12px;
          color: rgba(255,255,255,0.3);
          background: #000;
          position: relative;
          z-index: 1;
          transition: all 0.3s;
        }
        .progress-circle.done  { border-color: #FF0A54; background: #FF0A54; color: #fff; }
        .progress-circle.active { border-color: #FF0A54; color: #FF0A54; box-shadow: 0 0 12px rgba(255,10,84,0.4); }
        .progress-label {
          font-family: 'Electrolize', sans-serif;
          font-size: 9px;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          margin-top: 6px;
          text-align: center;
          white-space: nowrap;
          transition: color 0.3s;
        }
        .progress-label.active { color: #FF0A54; }
        .progress-label.done   { color: rgba(255,255,255,0.5); }
        .progress-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
          margin-bottom: 20px;
          transition: background 0.3s;
        }
        .progress-line.done { background: #FF0A54; }
        /* Cards */
        .step-card {
          width: 100%;
          max-width: 500px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 14px;
          transition: border-color 0.3s;
        }
        .step-card.active { border-color: rgba(255,10,84,0.35); background: rgba(255,10,84,0.04); }
        .step-card.done   { opacity: 0.55; }
        .step-card-title {
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #fff;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .done-check { color: #4ade80; font-size: 14px; }
        .step-card-desc {
          font-family: 'Electrolize', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          line-height: 1.6;
        }
        .step-card-detail {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.5);
          margin-top: 10px;
          word-break: break-all;
        }
        .action-btn {
          font-family: 'Audiowide', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 13px 28px;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          cursor: pointer;
          box-shadow: 0 0 20px rgba(255,10,84,0.3);
          transition: box-shadow 0.2s, transform 0.2s;
          min-height: 48px;
        }
        .action-btn:hover { box-shadow: 0 0 35px rgba(255,10,84,0.6); transform: translateY(-2px); }
        .action-btn:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
        .error-box {
          width: 100%;
          max-width: 500px;
          background: rgba(255,50,50,0.1);
          border: 1px solid rgba(255,50,50,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #ff6b6b;
          letter-spacing: 0.5px;
          margin-top: 8px;
        }
        .demo-link {
          margin-top: 32px;
          font-family: 'Electrolize', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.25);
          text-align: center;
        }
        .demo-link a {
          color: rgba(255,10,84,0.6);
          text-decoration: none;
          margin-left: 4px;
        }
        .demo-link a:hover { color: #FF0A54; }
      `}</style>

      <div className="connect-wrap">
        <a href="/" className="back-link">← Back to home</a>

        <div className="connect-title">Get Started</div>
        <div className="connect-sub">Connect your wallet to browse the waiting floor</div>

        {/* Chain badge */}
        <div className="chain-badge">
          <div className="chain-badge-info">
            <div className="chain-badge-name">Mezo Testnet</div>
            <div className="chain-badge-detail">Chain ID: 31611 · RPC: rpc.test.mezo.org · Gas: mBTC</div>
          </div>
          {wrongNetwork
            ? <button className="chain-switch-btn" onClick={switchNetwork}>Switch Network</button>
            : walletAddress
              ? <span className="chain-ok">✓ Correct network</span>
              : null
          }
        </div>

        {/* Progress bar — 3 steps total (connect, auth, lobby) */}
        <div className="progress-row">
          {STEPS.map((s, i) => {
            const isDone   = current > i || (s.key === "lobby" && !!sessionToken);
            const isActive = current === i && s.key !== "lobby";
            return (
              <div key={s.key} style={{ display: "flex", alignItems: "center", flex: i < STEPS.length - 1 ? "1" : "0" }}>
                <div className="progress-step">
                  <div className={`progress-circle${isDone ? " done" : isActive ? " active" : ""}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className={`progress-label${isDone ? " done" : isActive ? " active" : ""}`}>{s.label}</div>
                </div>
                {i < STEPS.length - 1 && <div className={`progress-line${current > i ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* Step 1 — Connect */}
        <div className={`step-card${step === "connect" ? " active" : current > 0 ? " done" : ""}`}>
          <div className="step-card-title">
            {current > 0 && <span className="done-check">✓</span>}
            Step 1 — Connect Wallet
          </div>
          <div className="step-card-desc">
            Connect your MetaMask or compatible wallet. Make sure you are on Mezo Testnet (Chain ID 31611) and have mBTC for gas.
          </div>
          {walletAddress
            ? <div className="step-card-detail">Connected: {walletAddress}</div>
            : (
              <button className="action-btn" onClick={connectWallet} disabled={loading}>
                {loading && step === "connect" ? "Connecting…" : "Connect Wallet"}
              </button>
            )
          }
        </div>

        {/* Step 2 — Authenticate */}
        <div className={`step-card${step === "auth" ? " active" : sessionToken ? " done" : ""}`}>
          <div className="step-card-title">
            {sessionToken && <span className="done-check">✓</span>}
            Step 2 — Authenticate
          </div>
          <div className="step-card-desc">
            Sign a nonce message to prove wallet ownership. No gas required — this is just a signature. You'll be taken to the waiting floor after.
          </div>
          {sessionToken
            ? <div className="step-card-detail">Authenticated ✓ — redirecting to lobby…</div>
            : (
              <button className="action-btn" onClick={authenticate} disabled={loading || !walletAddress || step === "connect"}>
                {loading && step === "auth" ? "Signing…" : "Sign & Enter Lobby"}
              </button>
            )
          }
        </div>

        {error && <div className="error-box">{error}</div>}

        <div className="demo-link">
          Just want to try it out?<a href="/game">Play the free demo →</a>
        </div>
      </div>
    </>
  );
}
