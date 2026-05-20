const cache: Record<string, HTMLAudioElement> = {};

function play(src: string) {
  if (typeof window === "undefined") return;
  if (!cache[src]) {
    cache[src] = new Audio(src);
    cache[src].preload = "auto";
  }
  cache[src].currentTime = 0;
  cache[src].play().catch(() => {});
}

export const sounds = {
  walletSigned:   () => play("/Voicy_Surprise.mp3"),
  welcomeToGame:  () => play("/Voicy_WELCOME TO OUR CLUB.mp3"),
  yourTurn:       () => play("/Voicy_Your turn.mp3"),
  congratulations:() => play("/congratulations.mp3"),
  lobby:          () => play("/lobby.mp3"),
  stopLobby:      () => {
    const el = cache["/lobby.mp3"];
    if (el) { el.pause(); el.currentTime = 0; }
  },
};
