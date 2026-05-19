# RoyalStack Poker — Frontend UI Flow & Structure Guide

## Overview
RoyalStack is a decentralized poker game built on the Mezo Testnet. The frontend interacts with both a backend server (for room management, authentication, and game orchestration) and smart contracts (for deposits, withdrawals, and event listening). This guide details the UI flow, component structure, and integration points for developers working on the frontend.

---

## 1. Project Structure

```
components/
  Hero/
    Navbar.tsx         # Main navigation bar
    page.tsx           # Hero section (landing page)
  playerprofile/
    playerprofile.tsx  # Player profile and stats
  Tournament/
    Tournament.tsx     # Tournament/lobby view
app/
  globals.css          # Global styles
  layout.tsx           # App layout (header/footer)
  page.tsx             # Main entry point
public/                # Static assets (images, icons)
```

---


## 2. UI Flow (with Landing Page)

### A. Landing Page (Hero Section)
The landing page is the user's first interaction with RoyalStack and sets the tone for the app:

- **Navbar**: Persistent at the top, includes navigation, wallet connect, and session status.
- **Hero Section**:
  - **Chain Pill**: Shows "Live · Mezo Blockchain" with animated pulse.
  - **Title**: "ROYAL STACKS" with glitch animation on "STACKS".
  - **Subtitle**: "The world's most advanced on-chain poker experience. Real stakes. Provably fair. Your keys, your chips. Powered by Mezo Blockchain."
  - **Call-to-Action Buttons**:
    - **Play Poker Now**: Primary action, routes to authentication or lobby.
    - **How It Works**: Secondary action, scrolls to or opens a modal/section explaining the game flow.
  - **Stats Row**: Shows real-time stats (e.g., Total Volume, Active Players, Hands Dealt) both on mobile (below image) and desktop (left column).
  - **Hero Image**: Poker cards and chips visual, animated.

**Footer**: Contains branding, copyright, and social links.

### B. Authentication
1. **Connect Wallet**: User clicks "Play Poker Now" or wallet button to connect (e.g., MetaMask).
2. **Nonce Request**: Frontend POSTs `/api/auth/nonce` with wallet address.
3. **Sign Message**: User signs the returned message using their wallet.
4. **Verify Signature**: Frontend POSTs `/api/auth/verify` with wallet address, signature, and message.
5. **Session Token**: Store the returned `sessionToken` for all subsequent API and WebSocket calls.

### C. Lobby & Room Management
1. **Lobby View**: Shows list of open rooms (GET `/api/pools`).
2. **Create Room**: User clicks "Start Room" → POST `/api/rooms/create` (server creates pool on-chain, returns `poolId`).
3. **Join Room**: User selects a room from the lobby or after creating one.

### D. Funding the Pot
1. **Approve Token**: User approves the Pool contract to spend their Mezo Token (ERC-20 `approve`).
2. **Deposit**: User deposits tokens into the pool (`deposit(poolId, amount)` on contract).
3. **Register**: After deposit, frontend POSTs `/api/pools/:poolId/join` to register player in server state.
4. **Wait for Players**: UI shows waiting state until 5 players have joined.

### E. Game Start & Play
1. **Game Start**: When 5 players are registered, the game starts automatically.
2. **WebSocket Connection**: Frontend connects to server via Socket.IO, authenticates with session token.
3. **Join Pool Channel**: `JOIN_POOL` event with `poolId`.
4. **Gameplay**: UI updates in real-time based on `GAME_STATE_UPDATED` and other events.
5. **Player Actions**: User can bet, call, raise, fold, or check via UI controls (emits `PLAYER_ACTION`).

### F. Leaving a Room
- **Before Game Starts**: User can withdraw deposit on-chain (`withdrawDeposit(poolId)`), then POST `/api/pools/:poolId/leave` to update server state.
- **After Game Starts**: Leaving is handled by game logic (folding, elimination, etc.).

### G. Pool Cancellation
- If a room doesn't fill within 10 minutes, the server cancels the pool and refunds all deposits automatically. UI should listen for cancellation events and update accordingly.

### H. Player Stats & Leaderboard
- **Profile View**: Shows hands played, hands won, total winnings (GET `/api/players/:walletAddress/stats`).
- **Leaderboard**: Shows top players (GET `/api/leaderboard?limit=10`).

---

## 3. Component Responsibilities

- **Navbar**: Navigation links (Lobby, Profile, Leaderboard, etc.), wallet connect button, session status.
- **Hero Section**: Landing page, call-to-action to join or create a room.
- **Lobby/Tournament**: Lists open rooms, allows creating/joining rooms, shows room status.
- **PlayerProfile**: Displays player stats, recent hands, and leaderboard.
- **Game Table**: Main poker UI, shows cards, pot, player actions, and game state.
- **DepositModal**: Handles token approval and deposit flow.
- **WaitingRoom**: Shows waiting state until enough players join.
- **Notifications**: Displays errors, confirmations, and real-time updates.

---

## 4. Integration Points

### Blockchain
- **Network**: Mezo Testnet (Chain ID: 31611)
- **RPC**: https://rpc.test.mezo.org
- **Pool Contract**: 0x16CaA43924343bd66793108e0c22b701665ea5aa
- **Deposit Token**: 0x7B7c000000000000000000000000000000000001 (Mezo Token, ERC-20)
- **Gas Token**: mBTC (for transaction fees)

### Server
- **Base URL**: http://localhost:3002
- **REST API**: For auth, room management, player stats, etc.
- **WebSocket**: Real-time game state and events

---

## 5. Key API & Contract Calls

### Auth
- `POST /api/auth/nonce` → Get nonce
- `POST /api/auth/verify` → Verify signature, get session token
- `POST /api/auth/logout` → Logout

### Room Management
- `POST /api/rooms/create` → Create new room
- `GET /api/pools` → List open rooms
- `GET /api/pools/:poolId` → Get room details
- `POST /api/pools/:poolId/join` → Register player after deposit
- `POST /api/pools/:poolId/leave` → Leave room (after withdrawal)

### Contract
- `approve(spender, amount)` on Mezo Token
- `deposit(poolId, amount)` on Pool contract
- `withdrawDeposit(poolId)` on Pool contract

### WebSocket Events
- `JOIN_POOL`, `POOL_JOINED`, `PLAYER_JOINED`, `PLAYER_ACTION`, `GAME_STATE_UPDATED`, `ACTION_INVALID`, `PLAYER_LEFT`, `HAND_SAVED`, `LEAVE_POOL`

---

## 6. Error Handling
- All API errors return `{ "error": "message" }`.
- Handle HTTP status codes: 400 (bad request), 401 (auth), 403 (admin), 404 (not found), 429 (rate limit), 500 (server error).
- UI should display clear error messages and guide the user to resolve issues (e.g., reconnect wallet, refresh session).

---

## 7. Best Practices
- Always require wallet connection before gameplay.
- Store session token securely (memory or encrypted storage).
- Listen for contract events for real-time updates (optional, but improves UX).
- Use optimistic UI updates for deposits/withdrawals, but confirm with on-chain events.
- Handle network errors gracefully and provide retry options.

---

## 8. References
- [Mezo Testnet Docs](https://docs.mezo.org/)
- [Ethers.js Documentation](https://docs.ethers.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

---

## 9. Example User Journey
1. User connects wallet and authenticates.
2. User creates a new room or joins an existing one.
3. User approves and deposits Mezo Token to fund the pot.
4. User waits for other players; game starts at 5 players.
5. User plays poker in real-time, interacting via WebSocket.
6. User can withdraw before game starts or view stats after.

---

## 10. TODOs for Developers
- [ ] Implement wallet connection and authentication flow
- [ ] Build lobby and room management UI
- [ ] Integrate deposit/withdrawal contract calls
- [ ] Handle WebSocket game state updates
- [ ] Build player profile and leaderboard views
- [ ] Add error handling and notifications

---

For further details, see the backend and smart contract documentation, or contact the RoyalStack core team.
