import Link from "next/link";
import Hero from "../components/Hero/page";
import { API_BASE_URL } from "../lib/config";

export default function Home() {
  return (
    <>
      <Hero />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/connect"
          style={{
            borderRadius: 999,
            padding: "12px 22px",
            background: "#e8003a",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(232,0,58,0.25)",
          }}
        >
          Connect Wallet
        </Link>
        <Link
          href="/integration"
          style={{
            borderRadius: 999,
            padding: "12px 22px",
            background: "#111",
            color: "white",
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 10px 30px rgba(0,0,0,0.16)",
          }}
        >
          Integration Guide
        </Link>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 18,
          color: "#888",
          fontSize: 14,
        }}
      >
        Server base URL: <code style={{ marginLeft: 8 }}>{API_BASE_URL}</code>
      </div>
    </>
  );
}
