"use client";

import { useEffect, useState, useCallback } from "react";

export type ToastType = "error" | "warning" | "info" | "success";

export type ToastMessage = {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  error:   { bg: "rgba(220,30,60,0.95)",   border: "#ff2255", icon: "✕" },
  warning: { bg: "rgba(200,120,0,0.95)",   border: "#ff9900", icon: "⚠" },
  info:    { bg: "rgba(20,20,40,0.97)",    border: "rgba(255,255,255,0.2)", icon: "ℹ" },
  success: { bg: "rgba(10,140,60,0.95)",   border: "#00c864", icon: "✓" },
};

let _nextId = 1;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts(ts => ts.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info", duration = 4000) => {
    const id = _nextId++;
    setToasts(ts => [...ts, { id, message, type, duration }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  return { toasts, toast, dismiss };
}

// ─── Renderer ─────────────────────────────────────────────────────────────────

export function ToastContainer({ toasts, dismiss }: { toasts: ToastMessage[]; dismiss: (id: number) => void }) {
  return (
    <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, pointerEvents: "none", width: "min(92vw, 420px)" }}>
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} dismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, dismiss }: { toast: ToastMessage; dismiss: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const c = COLORS[toast.type];

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      onClick={() => dismiss(toast.id)}
      style={{
        pointerEvents: "all",
        width: "100%",
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        fontFamily: "monospace",
        fontSize: 13,
        color: "#fff",
        boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
        cursor: "pointer",
        backdropFilter: "blur(8px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-12px)",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      <span style={{ fontWeight: 700, flexShrink: 0 }}>{c.icon}</span>
      <span style={{ flex: 1, lineHeight: 1.5 }}>{toast.message}</span>
      <span style={{ opacity: 0.5, fontSize: 11, flexShrink: 0 }}>tap to dismiss</span>
    </div>
  );
}
