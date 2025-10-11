# Stacks On-Chain Tic Tac Toe with Game Statistics Tracking

A decentralized Tic Tac Toe game built on the Stacks blockchain with real-time game statistics tracking. This project demonstrates how to build a full-stack Web3 application using Clarity smart contracts and a Next.js frontend.

## 🎯 Project Overview

This project implements a complete Tic Tac Toe game where:

- Players can create games with STX bets
- Players can join existing games
- Games are played on-chain with immutable move history
- **NEW**: Real-time statistics tracking shows total games created on the platform

## ✨ Key Features

### Core Game Features

- **On-Chain Game Logic**: All game rules and state managed by Clarity smart contracts
- **STX Betting System**: Players can bet STX tokens when creating/joining games
- **Real-Time Updates**: Frontend automatically updates when games change
- **Wallet Integration**: Connect with Stacks wallet for seamless transactions

### 🆕 Game Statistics Enhancement

- **Total Games Counter**: Tracks every game created on the blockchain
- **Real-Time Display**: Shows statistics on the homepage
- **Persistent Storage**: Statistics persist across all transactions
- **Error Handling**: Graceful fallback if statistics can't be loaded

## 🏗️ Architecture

### Smart Contract (`contracts/stacks-tic-tac-toe.clar`)

The Clarity smart contract manages:

- Game state and rules
- STX transfers and betting
- Player authentication
- **Game statistics tracking**

### Frontend (`frontend/`)

Next.js application with:

- React components for game UI
- Stacks Connect integration
- Real-time contract data fetching
- **Statistics display components**

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Clarinet (Stacks development tool)
- Stacks wallet (Hiro Wallet recommended)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd stacks-tic-tac-toe
```

2. **Install dependencies**

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

3. **Start the development environment**

```bash
# Start Clarinet development environment
clarinet console

# In another terminal, start the frontend
cd frontend
npm run dev
```

## 📊 Game Statistics Enhancement - Technical Deep Dive

### Problem Statement

The original Tic Tac Toe game lacked visibility into platform activity. Users had no way to see how popular the platform was or track overall engagement metrics.

### Solution Architecture

#### 1. Smart Contract Enhancement

**Added Data Variable (Lines 4-6)**

```clarity
;; ADDED FUNCTIONALITY: Track total number of games created
;; This variable keeps count of all games that have been created, including completed ones
(define-data-var total-games-created uint u0)
```

**Explanation**:

- Creates a persistent variable that survives across all transactions
- Initialized to 0 and increments with each new game
- Tracks ALL games created, regardless of their current status (active, completed, abandoned)

**Increment Logic (Lines 78-80)**

```clarity
;; ADDED FUNCTIONALITY: Increment total games counter when a new game is created
;; This tracks the total number of games created, regardless of their current status
(var-set total-games-created (+ (var-get total-games-created) u1))
```

**Explanation**:

- Placed in the `create-game` function after successful game creation
- Uses `var-get` to read current value, adds 1, then `var-set` to store new value
- Atomic operation ensures counter is always accurate

**Read-Only Query Function (Lines 209-213)**

```clarity
;; ADDED FUNCTIONALITY: Read-only function to get total games created
;; This allows the frontend to query how many games have been created in total
(define-read-only (get-total-games-created)
    (var-get total-games-created)
)
```

**Explanation**:

- Read-only functions are free to call (no transaction fees)
- Allows frontend to query statistics without making transactions
- Returns the current value of the counter

#### 2. Frontend Integration

**Contract Interface Function (`frontend/lib/contract.ts` Lines 87-106)**

```typescript
// ADDED FUNCTIONALITY: Fetch total number of games created from the contract
// This function calls the new get-total-games-created read-only function
export async function getTotalGamesCreated() {
  try {
    const totalGamesCV = (await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: "get-total-games-created",
      functionArgs: [],
      senderAddress: CONTRACT_ADDRESS,
      network: NETWORK,
    })) as UIntCV;

    // Convert the uintCV to a JS/TS number type
    return parseInt(totalGamesCV.value.toString());
  } catch (_err) {
    console.error("getTotalGamesCreated failed:", _err);
    return 0; // Return 0 if the call fails
  }
}
```

**Explanation**:

- Uses `fetchCallReadOnlyFunction` to call the contract without transactions
- Converts Clarity `uint` to JavaScript `number` for frontend use
- Includes comprehensive error handling with fallback value
- Async/await pattern for clean asynchronous code

**UI Integration (`frontend/app/page.tsx` Lines 8-9, 18-26)**

```typescript
// ADDED FUNCTIONALITY: Fetch total games created to display statistics
const totalGamesCreated = await getTotalGamesCreated();

// In JSX:
{/* ADDED FUNCTIONALITY: Display total games created as a statistic */}
<div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
  <p className="text-lg font-semibold text-white">
    Total Games Created: <span className="text-blue-400">{totalGamesCreated}</span>
  </p>
  <p className="text-sm text-gray-400 mt-1">
    This shows how many games have been created on the blockchain
  </p>
</div>
```

**Explanation**:

- Server-side rendering ensures statistics load with the page
- Styled card component provides clear visual hierarchy
- Color-coded display (blue for the number) draws attention
- Descriptive text helps users understand what the statistic means

### 3. Data Flow Architecture

```
User Creates Game
       ↓
Smart Contract create-game()
       ↓
Increment total-games-created counter
       ↓
Frontend calls getTotalGamesCreated()
       ↓
Contract returns current counter value
       ↓
Frontend displays updated statistics
```

### 4. Error Handling Strategy

**Smart Contract Level**:

- No additional error handling needed (atomic operations)
- Counter increments only after successful game creation

**Frontend Level**:

- Try-catch blocks around all contract calls
- Graceful fallback to 0 if statistics can't be loaded
- Console logging for debugging

**Network Level**:

- Handles network failures gracefully
- Retries not implemented (could be added for production)

## 🔧 Technical Implementation Details

### Clarity Smart Contract Patterns

**Data Variables**

```clarity
(define-data-var variable-name type initial-value)
```

- Persistent across all transactions
- Can be read and written by contract functions
- Gas-efficient storage

**Read-Only Functions**

```clarity
(define-read-only (function-name parameters)
    (return-expression)
)
```

- Free to call (no transaction fees)
- Cannot modify contract state
- Perfect for querying statistics

**Variable Operations**

```clarity
;; Read current value
(var-get variable-name)

;; Set new value
(var-set variable-name new-value)

;; Atomic increment
(var-set counter (+ (var-get counter) u1))
```

### Frontend Integration Patterns

**Contract Function Calls**

```typescript
const result = await fetchCallReadOnlyFunction({
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  functionName: "function-name",
  functionArgs: [],
  senderAddress: CONTRACT_ADDRESS,
  network: NETWORK,
});
```

**Type Conversion**

```typescript
// Clarity uint to JavaScript number
const jsNumber = parseInt(clarityUint.value.toString());
```

**Error Handling**

```typescript
try {
  const result = await contractCall();
  return result;
} catch (error) {
  console.error("Operation failed:", error);
  return fallbackValue;
}
```

## 🎨 UI/UX Design Decisions

### Statistics Display

- **Location**: Below main title, above game list
- **Styling**: Dark card with border for contrast
- **Typography**: Large, bold number with descriptive text
- **Color**: Blue accent for the number to draw attention

### Responsive Design

- Card adapts to different screen sizes
- Text remains readable on mobile devices
- Consistent with overall app design language

## 🚀 Future Enhancement Opportunities

### Additional Statistics

- Games completed vs. abandoned
- Total STX volume bet
- Most active players
- Average game duration

### Real-Time Updates

- WebSocket connections for live updates
- Polling mechanism for automatic refresh
- Push notifications for game events

### Advanced Analytics

- Historical trends and charts
- Player performance metrics
- Platform growth statistics

## 🧪 Testing Strategy

### Smart Contract Testing

```bash
# Run Clarinet tests
clarinet test
```

### Frontend Testing

```bash
# Run frontend tests
cd frontend
npm test
```

### Integration Testing

- Test statistics increment on game creation
- Test statistics display on page load
- Test error handling for failed contract calls

## 📈 Performance Considerations

### Smart Contract

- **Gas Efficiency**: Counter increment adds minimal gas cost
- **Storage**: Single uint variable uses minimal storage
- **Read Operations**: Read-only functions are free

### Frontend

- **Server-Side Rendering**: Statistics load with initial page
- **Error Boundaries**: Graceful degradation on failures
- **Caching**: Could implement caching for frequently accessed data

## 🔒 Security Considerations

### Smart Contract Security

- Counter can only be incremented, never decremented
- No external access to modify counter
- Atomic operations prevent race conditions

### Frontend Security

- Input validation on all user inputs
- Error messages don't expose sensitive information
- Contract addresses are hardcoded (consider environment variables)

## 📚 Learning Outcomes

This enhancement demonstrates:

1. **Smart Contract Development**: Adding persistent state tracking
2. **Frontend Integration**: Calling smart contract functions from React
3. **Error Handling**: Graceful degradation in Web3 applications
4. **UI/UX Design**: Presenting blockchain data in user-friendly ways
5. **Full-Stack Web3**: Complete integration between contract and frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Stacks Foundation for the Clarity language and development tools
- Hiro for the Stacks Connect library
- Next.js team for the excellent React framework

---

**Note**: This README documents the game statistics tracking enhancement added to demonstrate real-time platform analytics in a Web3 application. The implementation showcases best practices for smart contract development, frontend integration, and user experience design in decentralized applications.
