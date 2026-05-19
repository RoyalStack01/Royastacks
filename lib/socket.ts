import { io, Socket } from "socket.io-client";
import { API_BASE_URL } from "./config";

export type ServerPlayer = {
  walletAddress: string;
  chips: number;
  bet: number;
  folded: boolean;
  holeCards: string[] | null;
};

export type GameState = {
  stage: "preflop" | "flop" | "turn" | "river" | "showdown";
  pot: number;
  currentPlayer: string;
  communityCards: string[];
  players: ServerPlayer[];
  winners: Array<{ walletAddress: string; amount: number }> | null;
};

let _socket: Socket | null = null;

export function getSocket(sessionToken: string): Socket {
  if (!_socket || !_socket.connected) {
    _socket = io(API_BASE_URL, {
      auth: { token: sessionToken },
    });
  }
  return _socket;
}

export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
}
