# DePoker - Poker Ledger Application 🎮

A blockchain-based Texas Hold'em poker accounting application that ensures game transparency and data immutability.

## Quick Start

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npm start
   ```

3. Run the app

   - Android: `npm run android`
   - iOS: `npm run ios`
   - Web: `npm run web`

## Features

✅ Create game rooms  
✅ Player buy-in management  
✅ Real-time chip tracking  
✅ Automatic profit/loss calculation  
✅ Game settlement with transfer instructions  
✅ Live poker gameplay with standard actions  
✅ Automatic blind collection  
🔄 Blockchain verification (in development)

## Project Structure

For detailed project structure, please see [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)

## UI Design

For complete UI design documentation, please see [UI_DESIGN.md](./UI_DESIGN.md)

## Tech Stack

- React Native (Expo ~54.0.25)
- TypeScript
- Expo Router
- React Native Safe Area Context
- React Native Community Slider

## Game Features

- **Room Setup**: Configure buy-in units, small blind, and big blind
- **Player Management**: Multiple players with stack-based buy-ins
- **Live Gameplay**: Fold, Check, Call, Raise, All-in actions
- **Automatic Calculations**: Auto-deduct blinds, calculate pots, track bets
- **Settlement**: Clear profit/loss breakdown with transfer instructions
- **Blockchain Ready**: All actions designed for blockchain verification

## Development Roadmap

- [x] Real-time poker gameplay
- [x] Automatic blind collection
- [x] Multi-player support
- [ ] Blockchain integration
- [ ] Data persistence
- [ ] Wallet integration
- [ ] Multi-signature verification

## License

MIT

