const cache: Record<string, HTMLAudioElement> = {};

function play(src: string, volume = 1.0) {
  if (typeof window === "undefined") return;
  if (!cache[src]) {
    cache[src] = new Audio(src);
    cache[src].preload = "auto";
  }
  cache[src].volume = volume;
  cache[src].currentTime = 0;
  cache[src].play().catch(() => {});
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
    if (!cache["/lobby.mp3"]) {
      cache["/lobby.mp3"] = new Audio("/lobby.mp3");
      cache["/lobby.mp3"].preload = "auto";
      cache["/lobby.mp3"].loop = true;
    }
    cache["/lobby.mp3"].currentTime = 0;
    cache["/lobby.mp3"].play().catch(() => {});
  },
  stopLobby: () => {
    const el = cache["/lobby.mp3"];
    if (el) { el.pause(); el.currentTime = 0; }
  },
};
