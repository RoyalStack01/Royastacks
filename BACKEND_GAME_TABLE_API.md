# Backend Integration Guide for RoyalStacks Game Table

This document outlines the backend requirements and API endpoints needed to make the Game Table UI fully functional and standard for a decentralized poker experience.

---

## 1. WebSocket (Real-Time Game State)
- **Connect**: Client connects to the backend via Socket.IO after authentication.
- **Auth**: Use session token for authentication.
- **Events to Support**:
  - `JOIN_POOL` (client → server): Join a specific pool/game.
  - `POOL_JOINED` (server → client): Confirmation of join.
  - `PLAYER_JOINED` (server → all in pool): Notify when a player joins.
  - `PLAYER_ACTION` (client → server): Player sends an action (bet, call, raise, fold, check, amount).
  - `GAME_STATE_UPDATED` (server → all in pool): Broadcast new game state after any action.
  - `ACTION_INVALID` (server → client): Invalid move.
  - `PLAYER_LEFT` (server → all in pool): Player leaves/disconnects.
  - `HAND_SAVED` (server → client): Hand is recorded after showdown.
  - `LEAVE_POOL` (client → server): Player leaves the pool.

### Game State Object Example
```
{
  stage: 'flop', // 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'
  pot: 600,
  currentPlayer: '0x...',
  communityCards: ['Ah', 'Kd', '7c'],
  players: [
    { walletAddress: '0x...', chips: 9500, bet: 100, folded: false, holeCards: ['As', 'Ks'] },
    ...
  ],
  winners: null // or array at showdown
}
```

---

## 2. REST Endpoints
- **/api/pools/:poolId** (GET): Get current pool/game state (for reloads).
- **/api/pools/:poolId/join** (POST): Register player after deposit.
- **/api/pools/:poolId/leave** (POST): Remove player after withdrawal.
- **/api/players/:walletAddress/stats** (GET): Player stats for profile.
- **/api/leaderboard** (GET): Leaderboard data.

---

## 3. Contract Event Monitoring
- Listen for on-chain events (DepositMade, WithdrawalMade, awardedPot, etc.) and update game state accordingly.
- Ensure server emits updates to all connected clients in the pool.

---

## 4. Session & Auth
- All endpoints and sockets require a valid session token (JWT or similar).
- Expired/invalid tokens should return 401.

---

## 5. Error Handling
- All errors should return `{ "error": "message" }` and appropriate HTTP status codes.
- WebSocket errors should emit `ACTION_INVALID` or similar events.

---

## 6. Standardization & Best Practices
- Use consistent player and pool IDs (preferably wallet addresses and numeric pool IDs).
- Ensure all state transitions are atomic and race-condition free.
- Document all payloads and event schemas for frontend consumption.
- Support reconnection and state recovery for dropped clients.

---

## 7. Optional (for UX)
- Provide mock/test endpoints for frontend development.
- Allow querying historical hands for replays.
- Emit player join/leave and action events with timestamps.

---

For questions or clarifications, coordinate with the frontend team and refer to the main integration guide.
