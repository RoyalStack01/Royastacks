const AVATARS = [
  "🦊","🐯","🦁","🐻","🐼","🦝","🦄","🐸","🦋","🐺",
  "🦅","🦜","🐙","🦈","🐲","🤖","👾","🎭","💀","🃏",
  "🧸","🦔","🦩","🦚","🦉","🐬","🦇","🐝","🦠","🎪",
];

export function walletEmoji(address: string): string {
  if (!address) return "🃏";
  const n = address.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATARS[n % AVATARS.length];
}
