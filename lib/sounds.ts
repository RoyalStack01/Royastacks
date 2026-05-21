const cache: Record<string, HTMLAudioElement> = {};
let muted = false;
let lobbyDesired = false;

function play(src: string, volume = 1.0) {
  if (typeof window === "undefined") return;
  if (muted) return;
  if (!cache[src]) {
    cache[src] = new Audio(src);
    cache[src].preload = "auto";
  }
  cache[src].volume = volume;
  cache[src].currentTime = 0;
  cache[src].play().catch(() => {});
}

function setMuted(value: boolean) {
  muted = value;
  const lobbyAudio = cache["/lobby.mp3"];
  if (muted) {
    if (lobbyAudio) {
      lobbyAudio.pause();
      lobbyAudio.currentTime = 0;
    }
    return;
  }

  if (lobbyDesired && lobbyAudio && lobbyAudio.paused) {
    lobbyAudio.play().catch(() => {});
  }
}

function isMuted() {
  return muted;
}

export const sounds = {
  walletSigned:    () => play("/wallet-signed.mp3"),
  welcomeToGame:   () => play("/welcome.mp3"),
  yourTurn:        () => play("/your-turn.mp3"),
  congratulations: () => play("/congratulations.mp3"),
  cardDeal:        () => play("/card-deal.mp3"),
  chipClink:       () => play("/chip-clink.mp3"),
  fold:            () => play("/fold.mp3"),
  lobby: () => {
    if (typeof window === "undefined") return;
    lobbyDesired = true;
    if (!cache["/lobby.mp3"]) {
      cache["/lobby.mp3"] = new Audio("/lobby.mp3");
      cache["/lobby.mp3"].preload = "auto";
      cache["/lobby.mp3"].loop = true;
    }
    cache["/lobby.mp3"].currentTime = 0;
    if (!muted) {
      cache["/lobby.mp3"].play().catch(() => {});
    }
  },
  stopLobby: () => {
    const el = cache["/lobby.mp3"];
    lobbyDesired = false;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
  },
  setMuted,
  isMuted,
};
