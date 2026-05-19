import Link from "next/link";
import Hero from "@/components/Hero/page";
export default function Home() {
  return (
    <>
      <Hero />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 24,
        }}
      >
        <Link
          href="/game"
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
          View Poker Table
        </Link>
      </div>
    </>
  );
}
