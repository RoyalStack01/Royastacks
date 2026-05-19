"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createRoom, getNonce, verifyAuth } from "../../lib/server";

type Step = "connect" | "auth" | "room" | "ready";

const STORAGE_KEY_TOKEN = "royalstack:sessionToken";
const STORAGE_KEY_WALLET = "royalstack:walletAddress";
const STORAGE_KEY_POOL = "royalstack:poolId";

export default function ConnectPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("connect");
  const [walletAddress, setWalletAddress] = useState<string>("");
  const [sessionToken, setSessionToken] = useState<string>("");
  const [poolId, setPoolId] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(STORAGE_KEY_TOKEN);
    const storedWallet = sessionStorage.getItem(STORAGE_KEY_WALLET);
    const storedPool = sessionStorage.getItem(STORAGE_KEY_POOL);

    if (storedWallet) {
      setWalletAddress(storedWallet);
      setStep(storedToken ? "room" : "auth");
    }

    if (storedToken) {
      setSessionToken(storedToken);
      setStep(storedPool ? "ready" : "room");
    }

    if (storedPool) {
      setPoolId(storedPool);
      setStep("ready");
    }
  }, []);

  const connectWallet = async () => {
    setError("");
    setMessage("");

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setError(
        "No Ethereum wallet detected. Install MetaMask or another injected wallet.",
      );
      return;
    }

    try {
      setLoading(true);
      const accounts = (await ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!accounts || accounts.length === 0) {
        throw new Error("No wallet account found.");
      }
      const address = accounts[0];
      setWalletAddress(address);
      sessionStorage.setItem(STORAGE_KEY_WALLET, address);
      setStep("auth");
      setMessage(`Wallet connected: ${address}`);
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    setError("");
    setMessage("");
    if (!walletAddress) {
      setError("Wallet is not connected.");
      return;
    }

    const ethereum = (window as any).ethereum;
    if (!ethereum) {
      setError("No Ethereum wallet detected.");
      return;
    }

    try {
      setLoading(true);
      const nonceResponse = await getNonce(walletAddress);
      const signature = (await ethereum.request({
        method: "personal_sign",
        params: [nonceResponse.message, walletAddress],
      })) as string;

      const verifyResponse = await verifyAuth(
        walletAddress,
        signature,
        nonceResponse.message,
      );
      setSessionToken(verifyResponse.sessionToken);
      sessionStorage.setItem(STORAGE_KEY_TOKEN, verifyResponse.sessionToken);
      setStep("room");
      setMessage("Authentication successful.");
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  const startRoom = async () => {
    setError("");
    setMessage("");
    if (!sessionToken) {
      setError("Session token is missing. Authenticate first.");
      return;
    }

    try {
      setLoading(true);
      const roomResponse = await createRoom(sessionToken);
      setPoolId(roomResponse.poolId);
      sessionStorage.setItem(STORAGE_KEY_POOL, roomResponse.poolId);
      setMessage(`Room created: ${roomResponse.poolId}`);
      setStep("ready");
      router.push("/fund");
    } catch (err) {
      setError((err as Error)?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, maxWidth: 780, margin: "0 auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Connect Wallet</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Follow the flow to connect your wallet, authenticate with the server,
        and create a room.
      </p>

      <div style={{ display: "grid", gap: 18 }}>
        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: "#111",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Step 1 — Connect Wallet</h2>
          <p style={{ color: "#ccc" }}>
            Use your injected wallet to connect to the app.
          </p>
          <button
            type="button"
            onClick={connectWallet}
            disabled={loading || step !== "connect"}
            style={{
              marginTop: 16,
              padding: "14px 20px",
              borderRadius: 999,
              background: "#e8003a",
              color: "white",
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading && step === "connect" ? "Connecting…" : "Connect Wallet"}
          </button>
          {walletAddress && (
            <p style={{ marginTop: 16, color: "#9ccbff" }}>
              Connected account: {walletAddress}
            </p>
          )}
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: "#111",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Step 2 — Authenticate</h2>
          <p style={{ color: "#ccc" }}>
            Sign the nonce message from the server and receive a session token.
          </p>
          <button
            type="button"
            onClick={authenticate}
            disabled={loading || step === "connect" || step === "ready"}
            style={{
              marginTop: 16,
              padding: "14px 20px",
              borderRadius: 999,
              background: "#0070f3",
              color: "white",
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading && step === "auth"
              ? "Authenticating…"
              : "Authenticate Wallet"}
          </button>
          {sessionToken && (
            <p style={{ marginTop: 16, color: "#9ceb9c" }}>
              Authenticated successfully.
            </p>
          )}
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 16,
            background: "#111",
            color: "white",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 20 }}>Step 3 — Create Room</h2>
          <p style={{ color: "#ccc" }}>
            Create a game room on the server. After creation, you will be
            redirected to funding.
          </p>
          <button
            type="button"
            onClick={startRoom}
            disabled={loading || !sessionToken || step === "ready"}
            style={{
              marginTop: 16,
              padding: "14px 20px",
              borderRadius: 999,
              background: "#11cdef",
              color: "black",
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading && step === "room" ? "Creating room…" : "Create Room"}
          </button>
          {poolId && (
            <p style={{ marginTop: 16, color: "#9ceb9c" }}>
              Created pool: {poolId}
            </p>
          )}
        </section>

        {message && <div style={{ color: "#9ceb9c" }}>{message}</div>}
        {error && <div style={{ color: "#ff6b6b" }}>{error}</div>}
      </div>
    </main>
  );
}
