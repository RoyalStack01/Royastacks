"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { joinPool } from "../../lib/server";
import { MEZO_TOKEN_ADDRESS, POOL_CONTRACT_ADDRESS, CHAIN_ID } from "../../lib/config";

const STORAGE_KEY_TOKEN  = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL   = "royalstack:poolId";

const MEZO_TESTNET = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: "Mezo Testnet",
  nativeCurrency: { name: "mBTC", symbol: "mBTC", decimals: 18 },
  rpcUrls: ["https://rpc.test.mezo.org"],
  blockExplorerUrls: ["https://explorer.test.mezo.org"],
};

const ERC20_APPROVE_ABI = [
  { type: "function", name: "approve", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
];
const POOL_DEPOSIT_ABI = [
  { type: "function", name: "deposit", inputs: [{ name: "poolId", type: "uint256" }, { name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
];

type Status = "ready" | "approving" | "approved" | "depositing" | "deposited" | "registering" | "complete";

export default function FundPage() {
  const router = useRouter();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionToken, setSessionToken]   = useState<string | null>(null);
  const [poolId, setPoolId]               = useState<string | null>(null);
  const [amount, setAmount]               = useState("1");
  const [status, setStatus]               = useState<Status>("ready");
  const [error, setError]                 = useState("");
  const [approveHash, setApproveHash]     = useState("");
  const [depositHash, setDepositHash]     = useState("");
  const [wrongNetwork, setWrongNetwork]   = useState(false);
  const [netChecked, setNetChecked]       = useState(false);

  useEffect(() => {
    const w = sessionStorage.getItem(STORAGE_KEY_WALLET);
    const t = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const p = sessionStorage.getItem(STORAGE_KEY_POOL);
    setWalletAddress(w);
    setSessionToken(t);
    setPoolId(p);
    // check network
    const eth = (window as any).ethereum;
    if (eth) {
      eth.request({ method: "eth_chainId" }).then((hex: string) => {
        setWrongNetwork(parseInt(hex, 16) !== CHAIN_ID);
        setNetChecked(true);
      });
    }
  }, []);

  const provider = useMemo(() => {
    if (typeof window === "undefined") return null;
    const eth = (window as any).ethereum;
    return eth ? new ethers.BrowserProvider(eth) : null;
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

  function parseAmountWei() {
    if (!amount || isNaN(Number(amount))) throw new Error("Enter a valid amount.");
    return ethers.parseUnits(amount.trim(), 18);
  }

  async function approveToken() {
    setError("");
    if (!provider) { setError("No wallet found."); return; }
    try {
      setStatus("approving");
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(CHAIN_ID)) throw new Error(`Switch to Mezo Testnet (Chain ID ${CHAIN_ID}) first.`);
      const token = new ethers.Contract(MEZO_TOKEN_ADDRESS, ERC20_APPROVE_ABI, signer);
      const tx = await token.approve(POOL_CONTRACT_ADDRESS, parseAmountWei());
      setApproveHash(tx.hash);
      await tx.wait();
      setStatus("approved");
    } catch (e) { setError((e as Error).message); setStatus("ready"); }
  }

  async function depositToPool() {
    setError("");
    if (!provider || !poolId) { setError("Missing provider or pool ID."); return; }
    try {
      setStatus("depositing");
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(CHAIN_ID)) throw new Error(`Switch to Mezo Testnet (Chain ID ${CHAIN_ID}) first.`);
      const pool = new ethers.Contract(POOL_CONTRACT_ADDRESS, POOL_DEPOSIT_ABI, signer);
      const tx = await pool.deposit(ethers.toBigInt(poolId), parseAmountWei());
      setDepositHash(tx.hash);
      await tx.wait();
      setStatus("deposited");
    } catch (e) { setError((e as Error).message); setStatus("approved"); }
  }

  async function registerWithServer() {
    setError("");
    if (!sessionToken || !poolId || !depositHash) { setError("Complete the deposit first."); return; }
    try {
      setStatus("registering");
      await joinPool(sessionToken, poolId);
      setStatus("complete");
    } catch (e) { setError((e as Error).message); setStatus("deposited"); }
  }

  const missingSession = !walletAddress || !sessionToken || !poolId;

  // Current sub-step: 0=approve, 1=deposit, 2=register, 3=done
  const subStep = status === "complete" ? 3
    : status === "deposited" || status === "registering" ? 2
    : status === "approved" || status === "depositing" ? 1
    : 0;

  const SUB_STEPS = ["Approve Token", "Deposit to Pool", "Register Player", "Ready to Play"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Audiowide&family=Electrolize&family=Share+Tech+Mono&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #000; }
        .fund-wrap {
          min-height: 100vh;
          background:
            radial-gradient(circle at 80% 20%, rgba(255,10,84,0.07) 0%, transparent 50%),
            radial-gradient(circle at 20% 80%, rgba(255,10,84,0.05) 0%, transparent 50%),
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
        .fund-title {
          font-family: 'Audiowide', sans-serif;
          font-size: clamp(22px, 5vw, 36px);
          color: #fff;
          letter-spacing: 3px;
          text-transform: uppercase;
          margin-bottom: 6px;
          text-align: center;
        }
        .fund-sub {
          font-family: 'Electrolize', sans-serif;
          font-size: 13px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          margin-bottom: 28px;
          text-align: center;
        }
        /* Main flow progress (outer) */
        .outer-flow {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 28px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          letter-spacing: 1.5px;
          color: rgba(255,255,255,0.25);
          text-transform: uppercase;
          flex-wrap: wrap;
          justify-content: center;
        }
        .outer-flow .done  { color: rgba(255,10,84,0.6); }
        .outer-flow .arrow { color: rgba(255,255,255,0.12); }
        .outer-flow .now   { color: #FF0A54; font-weight: 700; }
        /* Network banner */
        .net-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
          max-width: 520px;
          border-radius: 12px;
          padding: 12px 18px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .net-banner.ok    { background: rgba(74,222,128,0.07); border: 1px solid rgba(74,222,128,0.2); }
        .net-banner.wrong { background: rgba(255,10,84,0.08); border: 1px solid rgba(255,10,84,0.3); }
        .net-info { font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; }
        .net-banner.ok    .net-info { color: #4ade80; }
        .net-banner.wrong .net-info { color: #FF0A54; }
        .switch-btn {
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
        .switch-btn:hover { background: rgba(255,10,84,0.3); }
        /* Pool info card */
        .info-card {
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 18px 20px;
          margin-bottom: 18px;
        }
        .info-card-title {
          font-family: 'Audiowide', sans-serif;
          font-size: 11px;
          letter-spacing: 2px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 6px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .info-row:last-child { border-bottom: none; }
        .info-key {
          font-family: 'Electrolize', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
        }
        .info-val {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.6);
          word-break: break-all;
          text-align: right;
          max-width: 260px;
        }
        /* Sub-step progress */
        .sub-steps {
          display: flex;
          gap: 0;
          width: 100%;
          max-width: 520px;
          margin-bottom: 24px;
        }
        .sub-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .sub-step-dot {
          width: 26px; height: 26px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.25);
          background: #000;
          z-index: 1;
          transition: all 0.3s;
        }
        .sub-step-dot.done   { border-color: #FF0A54; background: #FF0A54; color: #fff; }
        .sub-step-dot.active { border-color: #FF0A54; color: #FF0A54; box-shadow: 0 0 10px rgba(255,10,84,0.4); }
        .sub-step-label {
          font-family: 'Electrolize', sans-serif;
          font-size: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.2);
          margin-top: 5px;
          text-align: center;
          transition: color 0.3s;
        }
        .sub-step-label.done   { color: rgba(255,255,255,0.4); }
        .sub-step-label.active { color: #FF0A54; }
        .sub-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin-bottom: 22px;
          align-self: flex-start;
          margin-top: 13px;
          transition: background 0.3s;
        }
        .sub-line.done { background: #FF0A54; }
        /* Action area */
        .action-area {
          width: 100%;
          max-width: 520px;
          background: rgba(255,10,84,0.04);
          border: 1px solid rgba(255,10,84,0.2);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 14px;
        }
        .action-title {
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 2px;
          color: #fff;
          text-transform: uppercase;
          margin-bottom: 6px;
        }
        .action-desc {
          font-family: 'Electrolize', sans-serif;
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          line-height: 1.6;
          margin-bottom: 18px;
        }
        .amount-input-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .amount-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          letter-spacing: 1px;
          white-space: nowrap;
        }
        .amount-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px;
          padding: 10px 14px;
          color: #fff;
          font-family: 'Share Tech Mono', monospace;
          font-size: 14px;
          width: 120px;
          outline: none;
          transition: border-color 0.2s;
        }
        .amount-input:focus { border-color: rgba(255,10,84,0.5); }
        .amount-suffix {
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          letter-spacing: 1px;
        }
        .btn-row { display: flex; flex-wrap: wrap; gap: 10px; }
        .action-btn {
          font-family: 'Audiowide', sans-serif;
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 12px 24px;
          clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
          cursor: pointer;
          box-shadow: 0 0 20px rgba(255,10,84,0.3);
          transition: box-shadow 0.2s, transform 0.2s;
          min-height: 44px;
        }
        .action-btn:hover { box-shadow: 0 0 35px rgba(255,10,84,0.6); transform: translateY(-2px); }
        .action-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
        .action-btn.ghost {
          background: transparent;
          border: 1px solid rgba(255,10,84,0.4);
          color: #FF0A54;
          box-shadow: none;
          clip-path: none;
          border-radius: 8px;
        }
        .tx-hash {
          font-family: 'Share Tech Mono', monospace;
          font-size: 10px;
          color: rgba(255,255,255,0.3);
          word-break: break-all;
          margin-top: 12px;
          letter-spacing: 0.5px;
        }
        .tx-hash span { color: #4ade80; }
        .error-box {
          width: 100%;
          max-width: 520px;
          background: rgba(255,50,50,0.1);
          border: 1px solid rgba(255,50,50,0.3);
          border-radius: 10px;
          padding: 12px 16px;
          font-family: 'Share Tech Mono', monospace;
          font-size: 11px;
          color: #ff6b6b;
          letter-spacing: 0.5px;
          margin-top: 4px;
        }
        .play-btn-wrap {
          width: 100%;
          max-width: 520px;
          margin-top: 8px;
        }
        .play-btn {
          width: 100%;
          font-family: 'Audiowide', sans-serif;
          font-size: 13px;
          letter-spacing: 3px;
          text-transform: uppercase;
          background: #FF0A54;
          color: #fff;
          border: none;
          padding: 18px;
          clip-path: polygon(12px 0%, 100% 0%, calc(100% - 12px) 100%, 0% 100%);
          cursor: pointer;
          box-shadow: 0 0 30px rgba(255,10,84,0.5);
          transition: box-shadow 0.2s, transform 0.2s;
          animation: pulseGlow 2s ease-in-out infinite;
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 30px rgba(255,10,84,0.5); }
          50%       { box-shadow: 0 0 60px rgba(255,10,84,0.8); }
        }
        .play-btn:hover { transform: translateY(-3px); }
      `}</style>

      <div className="fund-wrap">
        <a href="/connect" className="back-link">← Back to connect</a>

        <div className="fund-title">Fund the Pot</div>
        <div className="fund-sub">Deposit Mezo Token into the pool to take your seat</div>

        {/* Outer flow breadcrumb */}
        <div className="outer-flow">
          <span className="done">Connect</span>
          <span className="arrow">›</span>
          <span className="done">Authenticate</span>
          <span className="arrow">›</span>
          <span className="done">Create Room</span>
          <span className="arrow">›</span>
          <span className="now">Fund &amp; Play</span>
        </div>

        {/* Network status */}
        {netChecked && (
          <div className={`net-banner ${wrongNetwork ? "wrong" : "ok"}`}>
            {wrongNetwork ? (
              <>
                <div className="net-info">⚠ Wrong network — switch to Mezo Testnet (Chain ID {CHAIN_ID})</div>
                <button className="switch-btn" onClick={switchNetwork}>Switch Network</button>
              </>
            ) : (
              <div className="net-info">✓ Connected to Mezo Testnet · Chain ID {CHAIN_ID} · Gas: mBTC</div>
            )}
          </div>
        )}

        {/* Pool info */}
        <div className="info-card">
          <div className="info-card-title">Session Info</div>
          <div className="info-row">
            <span className="info-key">Wallet</span>
            <span className="info-val">{walletAddress ?? "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-key">Pool ID</span>
            <span className="info-val">{poolId ?? "—"}</span>
          </div>
          <div className="info-row">
            <span className="info-key">Deposit Token</span>
            <span className="info-val">{MEZO_TOKEN_ADDRESS}</span>
          </div>
          <div className="info-row">
            <span className="info-key">Pool Contract</span>
            <span className="info-val">{POOL_CONTRACT_ADDRESS}</span>
          </div>
        </div>

        {/* Sub-step progress */}
        <div className="sub-steps">
          {SUB_STEPS.map((label, i) => {
            const isDone   = subStep > i;
            const isActive = subStep === i;
            return (
              <div key={label} style={{ display: "flex", alignItems: "flex-start", flex: i < SUB_STEPS.length - 1 ? "1" : "0" }}>
                <div className="sub-step">
                  <div className={`sub-step-dot${isDone ? " done" : isActive ? " active" : ""}`}>
                    {isDone ? "✓" : i + 1}
                  </div>
                  <div className={`sub-step-label${isDone ? " done" : isActive ? " active" : ""}`}>{label}</div>
                </div>
                {i < SUB_STEPS.length - 1 && <div className={`sub-line${isDone ? " done" : ""}`} />}
              </div>
            );
          })}
        </div>

        {/* Action area — only shown when not complete */}
        {status !== "complete" && (
          <div className="action-area">
            <div className="action-title">
              {subStep === 0 ? "Step 1 — Approve Mezo Token" : subStep === 1 ? "Step 2 — Deposit into Pool" : "Step 3 — Register with Server"}
            </div>
            <div className="action-desc">
              {subStep === 0 && "Allow the pool contract to spend your Mezo Token. This is a wallet signature — mBTC gas required."}
              {subStep === 1 && "Send your Mezo Token into the pool. This is an on-chain transaction — mBTC gas required."}
              {subStep === 2 && "Tell the server you have deposited so it can register your seat. No gas needed."}
            </div>

            {subStep === 0 && (
              <div className="amount-input-wrap">
                <span className="amount-label">Amount</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="amount-input"
                />
                <span className="amount-suffix">Mezo Token</span>
              </div>
            )}

            <div className="btn-row">
              {subStep === 0 && (
                <button className="action-btn" onClick={approveToken} disabled={status === "approving" || missingSession || wrongNetwork}>
                  {status === "approving" ? "Approving…" : "Approve Token"}
                </button>
              )}
              {subStep === 1 && (
                <button className="action-btn" onClick={depositToPool} disabled={status === "depositing" || !approveHash || wrongNetwork}>
                  {status === "depositing" ? "Depositing…" : "Deposit to Pool"}
                </button>
              )}
              {subStep === 2 && (
                <button className="action-btn" onClick={registerWithServer} disabled={status === "registering" || !depositHash}>
                  {status === "registering" ? "Registering…" : "Confirm Seat"}
                </button>
              )}
            </div>

            {approveHash && subStep >= 1 && (
              <div className="tx-hash">Approve TX: <span>{approveHash}</span></div>
            )}
            {depositHash && subStep >= 2 && (
              <div className="tx-hash">Deposit TX: <span>{depositHash}</span></div>
            )}
          </div>
        )}

        {error && <div className="error-box">{error}</div>}

        {/* Play button — shown when complete */}
        {status === "complete" && (
          <div className="play-btn-wrap">
            <button className="play-btn" onClick={() => router.push("/game")}>
              Take Your Seat →
            </button>
          </div>
        )}
      </div>
    </>
  );
}
