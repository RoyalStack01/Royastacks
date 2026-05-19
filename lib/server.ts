import { API_BASE_URL } from "./config";

const defaultHeaders: Record<string, string> = {
  "Content-Type": "application/json",
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = new URL(path, API_BASE_URL).toString();
  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  const body = await response.text();
  const data = body ? JSON.parse(body) : null;

  if (!response.ok) {
    const error = data?.error || response.statusText || "Server request failed";
    throw new Error(error);
  }

  return data as T;
}

export async function getNonce(walletAddress: string) {
  return request<{ nonce: string; message: string }>("/api/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
}

export async function verifyAuth(walletAddress: string, signature: string, message: string) {
  return request<{ sessionToken: string; walletAddress: string; expiresIn: number }>("/api/auth/verify", {
    method: "POST",
    body: JSON.stringify({ walletAddress, signature, message }),
  });
}

export async function logout(sessionToken: string) {
  return request<{ message: string }>("/api/auth/logout", {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

export async function createRoom(sessionToken: string) {
  return request<{ poolId: string }>("/api/rooms/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

export async function joinPool(sessionToken: string, poolId: string, amount: number) {
  return request<{ poolId: string; playerCount: number; isFull: boolean }>(`/api/pools/${encodeURIComponent(poolId)}/join`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
    body: JSON.stringify({ amount }),
  });
}

export async function leavePool(sessionToken: string, poolId: string) {
  return request<{ message: string; poolId: string; playersRemaining: number }>(`/api/pools/${encodeURIComponent(poolId)}/leave`, {
    method: "POST",
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

export async function listPools(sessionToken: string) {
  return request<Array<Record<string, unknown>>>("/api/pools", {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}

export async function getPool(sessionToken: string, poolId: string) {
  return request<Record<string, unknown>>(`/api/pools/${encodeURIComponent(poolId)}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
}
