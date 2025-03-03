export const degenDreamAbi = [
  // Game Constants
  {
    "inputs": [],
    "name": "MIN_BET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_BET",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Game Functions
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint8[]", "name": "numbers", "type": "uint8[]"}
    ],
    "name": "placeBet",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllBets",
    "outputs": [
      {
        "components": [
          {"internalType": "address", "name": "player", "type": "address"},
          {"internalType": "uint256", "name": "amount", "type": "uint256"},
          {"internalType": "uint8[]", "name": "numbers", "type": "uint8[]"},
          {"internalType": "bool", "name": "processed", "type": "bool"},
          {"internalType": "uint8", "name": "matches", "type": "uint8"},
          {"internalType": "uint256", "name": "payout", "type": "uint256"}
        ],
        "internalType": "struct DegenDream.Bet[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Player tracking
  {
    "inputs": [{"internalType": "address", "name": "", "type": "address"}],
    "name": "players",
    "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getPlayerCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "uint256"},
      {"indexed": true, "name": "player", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "numbers", "type": "uint8[]"}
    ],
    "name": "BetPlaced",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "uint256"},
      {"indexed": false, "name": "numbers", "type": "uint8[]"}
    ],
    "name": "NumbersDrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "requestId", "type": "uint256"},
      {"indexed": true, "name": "player", "type": "address"},
      {"indexed": false, "name": "amount", "type": "uint256"},
      {"indexed": false, "name": "matches", "type": "uint8"}
    ],
    "name": "PrizeAwarded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "name": "player", "type": "address"}
    ],
    "name": "NewPlayer",
    "type": "event"
  }
] as const 