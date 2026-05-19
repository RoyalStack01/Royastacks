"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";
import { joinPool } from "../../lib/server";
import {
  MEZO_TOKEN_ADDRESS,
  POOL_CONTRACT_ADDRESS,
  CHAIN_ID,
} from "../../lib/config";

const STORAGE_KEY_TOKEN = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL = "royalstack:poolId";

const ERC20_APPROVE_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
];

const POOL_ABI = [
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "poolId", type: "uint256" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
];

export default function FundPage() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [amount, setAmount] = useState("1");
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [approveHash, setApproveHash] = useState<string>("");
  const [depositHash, setDepositHash] = useState<string>("");
  const [joinInfo, setJoinInfo] = useState<string>("");

  useEffect(() => {
    setWalletAddress(sessionStorage.getItem(STORAGE_KEY_WALLET));
    setSessionToken(sessionStorage.getItem(STORAGE_KEY_TOKEN));
    setPoolId(sessionStorage.getItem(STORAGE_KEY_POOL));
  }, []);

  const provider = useMemo(() => {
    if (typeof window === "undefined") return null;
    const ethereum = (window as any).ethereum;
    return ethereum ? new ethers.BrowserProvider(ethereum) : null;
  }, []);

  const walletMissing = !walletAddress || !sessionToken || !poolId;

  const parseAmount = () => {
    if (!amount || Number.isNaN(Number(amount))) {
      throw new Error("Enter a valid deposit amount.");
    }
    return ethers.parseUnits(amount.trim(), 18);
  };

  const approveToken = async () => {
    setError("");
    setMessage("");
    if (walletMissing) {
      setError("Wallet, session token, and pool ID are required.");
      return;
    }
    if (!provider) {
      setError("No injected Ethereum provider found.");
      return;
    }

    try {
      setStatus("approving");
      const signer = await provider.getSigner();
      const token = new ethers.Contract(
        MEZO_TOKEN_ADDRESS,
        ERC20_APPROVE_ABI,
        signer,
      );
      const amountWei = parseAmount();
      const tx = await token.approve(POOL_CONTRACT_ADDRESS, amountWei);
      setApproveHash(tx.hash);
      setMessage("Approve transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setMessage("Approval confirmed. You may now deposit.");
      setStatus("approved");
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
      setStatus("ready");
    }
  };

  const depositToPool = async () => {
    setError("");
    setMessage("");
    if (walletMissing) {
      setError("Wallet, session token, and pool ID are required.");
      return;
    }
    if (!provider) {
      setError("No injected Ethereum provider found.");
      return;
    }

    try {
      setStatus("depositing");
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();
      if (network.chainId !== CHAIN_ID) {
        throw new Error(
          `Switch your wallet to chain ID ${CHAIN_ID} before depositing.`,
        );
      }

      const pool = new ethers.Contract(POOL_CONTRACT_ADDRESS, POOL_ABI, signer);
      const amountWei = parseAmount();
      const tx = await pool.deposit(ethers.toBigInt(poolId!), amountWei);
      setDepositHash(tx.hash);
      setMessage("Deposit transaction submitted. Waiting for confirmation...");
      await tx.wait();
      setMessage(
        "Deposit confirmed. Registering your player with the server...",
      );
      setStatus("deposited");
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
      setStatus("approved");
    }
  };

  const registerWithServer = async () => {
    setError("");
    setMessage("");
    if (walletMissing) {
      setError("Wallet, session token, and pool ID are required.");
      return;
    }
    if (!depositHash) {
      setError("Complete the deposit transaction before registering.");
      return;
    }

    try {
      setStatus("registering");
      const amountNumber = Number(amount);
      if (Number.isNaN(amountNumber) || amountNumber <= 0) {
        throw new Error("Deposit amount must be a positive number.");
      }
      const response = await joinPool(sessionToken!, poolId!, amountNumber);
      setJoinInfo(
        `Registered in pool ${response.poolId}. Players: ${response.playerCount}. Full: ${response.isFull}`,
      );
      setMessage("You are now registered in the pool.");
      setStatus("complete");
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
      setStatus("deposited");
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Fund the Pot</h1>
          <p style={{ margin: "8px 0 0", color: "#666" }}>
            Approve Mezo token, deposit into the pool, then register with the
            server.
          </p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/connect"
            style={{
              color: "#9ceb9c",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Back to connect
          </Link>
          <Link
            href="/game"
            style={{
              color: "#e8003a",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Continue to game table
          </Link>
        </div>
      </div>

      <section
        style={{
          padding: 24,
          borderRadius: 16,
          background: "#111",
          color: "white",
          marginBottom: 18,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20 }}>Pool Information</h2>
        <div style={{ marginTop: 16, display: "grid", gap: 8 }}>
          <div>Wallet: {walletAddress ?? "Not connected"}</div>
          <div>Pool ID: {poolId ?? "No pool created"}</div>
          <div>Session token: {sessionToken ? "Stored" : "Not available"}</div>
        </div>
      </section>

      <section
        style={{
          padding: 24,
          borderRadius: 16,
          background: "#111",
          color: "white",
          marginBottom: 18,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 20 }}>Deposit Flow</h2>
        <div style={{ marginTop: 20, display: "grid", gap: 14 }}>
          <label style={{ display: "grid", gap: 8 }}>
            <span style={{ color: "#ccc" }}>Deposit amount (Mezo token)</span>
            <input
              type="text"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="1.0"
              style={{
                width: 140,
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #333",
                background: "#111",
                color: "white",
              }}
            />
          </label>

          <div style={{ display: "grid", gap: 10 }}>
            <button
              type="button"
              onClick={approveToken}
              disabled={
                status === "approving" || status === "depositing" || !poolId
              }
              style={{
                padding: "14px 20px",
                borderRadius: 999,
                background: "#e8003a",
                color: "white",
                border: "none",
                cursor: "pointer",
                opacity: status === "approving" || !poolId ? 0.6 : 1,
              }}
            >
              {status === "approving" ? "Approving…" : "Approve Mezo Token"}
            </button>
            <button
              type="button"
              onClick={depositToPool}
              disabled={
                status === "depositing" ||
                status === "ready" ||
                !approveHash ||
                !poolId
              }
              style={{
                padding: "14px 20px",
                borderRadius: 999,
                background: "#11cdef",
                color: "black",
                border: "none",
                cursor: "pointer",
                opacity: status === "depositing" || !approveHash ? 0.6 : 1,
              }}
            >
              {status === "depositing" ? "Depositing…" : "Deposit to Pool"}
            </button>
            <button
              type="button"
              onClick={registerWithServer}
              disabled={status !== "deposited" || !depositHash}
              style={{
                padding: "14px 20px",
                borderRadius: 999,
                background: "#9ceb9c",
                color: "black",
                border: "none",
                cursor: "pointer",
                opacity: status !== "deposited" ? 0.6 : 1,
              }}
            >
              {status === "registering"
                ? "Registering…"
                : "Register with Server"}
            </button>
          </div>

          <div style={{ background: "#000", padding: 16, borderRadius: 12 }}>
            <div style={{ color: "#9ceb9c", marginBottom: 8 }}>
              Contract addresses
            </div>
            <div>
              Pool contract: <code>{POOL_CONTRACT_ADDRESS}</code>
            </div>
            <div>
              Deposit token: <code>{MEZO_TOKEN_ADDRESS}</code>
            </div>
            <div>
              Chain ID: <code>{CHAIN_ID}</code>
            </div>
          </div>

          <div style={{ background: "#000", padding: 16, borderRadius: 12 }}>
            <div style={{ color: "#9ceb9c", marginBottom: 8 }}>
              Current status
            </div>
            <div style={{ color: "#fff" }}>Step: {status}</div>
            {approveHash && (
              <div>
                Approve TX: <code>{approveHash}</code>
              </div>
            )}
            {depositHash && (
              <div>
                Deposit TX: <code>{depositHash}</code>
              </div>
            )}
            {joinInfo && <div>{joinInfo}</div>}
          </div>

          {message && <div style={{ color: "#9ceb9c" }}>{message}</div>}
          {error && <div style={{ color: "#ff6b6b" }}>{error}</div>}
        </div>
      </section>
    </main>
  );
}
