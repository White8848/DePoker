# DePoker - Poker Ledger Application 🎮

A blockchain-ready Texas Hold'em accounting application that tracks rooms, player balances, and round results while keeping the UI consistent across web and native targets.

## Prerequisites

- **Node.js & npm** installed locally
- **Expo CLI** (used via `npx expo`)
- **Hardhat** (installed through project devDependencies)

## Installation

```bash
npm install
```

## Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the Expo Metro bundler. |
| `npm run android` | Launch the Android target. |
| `npm run ios` | Launch the iOS target (macOS only). |
| `npm run web` | Open the web target. |
| `npm run lint` | Run lint checks. |
| `npm run reset-project` | Reset the project using the provided script. |

## Run the App (Without Blockchain)

```bash
npm start
```

Then follow Expo's prompts (`w` for web, `a` for Android, `i` for iOS).

## Local Blockchain Setup

1. **Start a local Hardhat node**
   ```bash
   npx hardhat node
   ```
   Keep this terminal open. The RPC endpoint is `http://127.0.0.1:8545` with chain ID `31337`.

2. **Deploy the DePoker2 contract** (new terminal)
   ```bash
   npx hardhat run scripts/deploy_depoker2.js --network localhost
   ```
   The script saves deployment info to `deployments/localhost-DePoker2.json` and updates `blockchain/config/contract.ts` with the latest address.

3. **Start the Expo app** (new terminal)
   ```bash
   npx expo start
   ```
   Use `w`, `a`, or `i` to open your target platform once Metro is ready.

> Windows users can also follow the automated steps described in [TEST_GUIDE.md](./TEST_GUIDE.md) (`start-blockchain.ps1` / `start-dev.bat`).

## Blockchain Test Checklist

Follow these steps after the blockchain services are running to validate on-chain flows. Screens and log outputs mirror the guidance from [TEST_GUIDE.md](./TEST_GUIDE.md).

1. **Create a blockchain room**
   - In the app, tap **"Create New Room"**.
   - Example inputs: Room Name `Blockchain Test`, Buy-in `1000`, Blinds `1 / 2`.
   - Enable **"Enable Blockchain"** and create the room.
   - Expected: "Room created on blockchain!" with a room ID (e.g., `0`).

2. **Add players**
   - Tap **"Add Player"** and enter Name `Alice`, Amount `1000`; repeat for `Bob`.
   - Expected: "Player added to blockchain!" with distinct addresses for each player.

3. **Start the game**
   - Tap **"Start Game"**, then **"Start New Round"**.
   - Expected: UI switches to **BlockchainGamePlay**, shows the blockchain icon, and the action button reads **"End Round & Vote on Chain"**.

4. **Play and settle a round**
   - Use **Fold / Check / Call / Raise / All-In** actions as usual.
   - Tap **"End Round & Vote on Chain"** to select winners (modal on web, alert on mobile) and confirm on-chain settlement and reputation updates.

5. **Verify logs**
   - Hardhat terminal should show transactions such as contract deployment and calls to `joinRoom` and `startRoom`.
   - Expo console should log steps like loading test accounts and starting blockchain rooms.

## Additional Documentation

- [QUICK_START.md](./QUICK_START.md) – short setup summary
- [START_INSTRUCTIONS.md](./START_INSTRUCTIONS.md) – detailed startup walkthrough
- [TEST_GUIDE.md](./TEST_GUIDE.md) – full blockchain testing guide
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) – code layout
- [UI_DESIGN.md](./UI_DESIGN.md) – interface details

## License

MIT
