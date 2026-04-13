# ⬡ DigiLand – Blockchain-Based Land Information Portal

> **SIH MVP Phase 1** · Full-Stack · Blockchain · SHA-256 Tamper Detection

DigiLand unifies fragmented land ownership and encumbrance data (DORIS, DLRC, CERSAI, MCA21) into a single tamper-evident portal. Each property record is hashed with **SHA-256** and the hash is anchored on an **Ethereum smart contract** — making any off-chain tampering instantly detectable.

---

## 🧱 Tech Stack

| Layer       | Technology                                |
|-------------|-------------------------------------------|
| Frontend    | React 18, React Router v6, Axios          |
| Backend     | Node.js, Express, MVC architecture        |
| Database    | MongoDB + Mongoose                        |
| Auth        | JWT (local) · Google OAuth UI (Phase 2)   |
| Hashing     | SHA-256 via Node.js `crypto`              |
| Blockchain  | Solidity 0.8.24, Hardhat, Ethers.js       |
| Network     | Hardhat local node · Sepolia testnet ready|

---

## 📁 Folder Structure

```
digiland/
├── client/                          # React Frontend
│   ├── public/index.html
│   └── src/
│       ├── components/
│       │   ├── AddPropertyModal.js  # New property form w/ hash display
│       │   ├── Navbar.js
│       │   ├── ProtectedRoute.js
│       │   └── StatCard.js
│       ├── context/
│       │   └── AuthContext.js       # Global auth state (JWT)
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Signup.js
│       │   └── Dashboard.js         # Main land records view
│       ├── styles/
│       │   └── global.css
│       ├── utils/
│       │   └── api.js               # Axios instance + API wrappers
│       ├── App.js
│       └── index.js
│
├── server/                          # Node.js Backend (MVC)
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js        # Signup / Login / GetMe
│   │   └── propertyController.js    # CRUD + hash verify + stats
│   ├── middleware/
│   │   └── authMiddleware.js        # JWT protect + restrictTo
│   ├── models/
│   │   ├── User.js                  # email, password, googleId, role
│   │   └── Property.js              # propertyId, hash, blockchain fields
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── propertyRoutes.js
│   ├── utils/
│   │   ├── hashUtils.js             # SHA-256 generate + verify
│   │   └── jwtUtils.js              # sign + verify JWT
│   ├── .env.example
│   ├── index.js                     # Express app entry point
│   └── package.json
│
├── blockchain/                      # Hardhat Ethereum Project
│   ├── contracts/
│   │   └── DigiLandRegistry.sol     # mapping(propertyId → hash)
│   ├── scripts/
│   │   └── deploy.js                # Deploy script
│   ├── test/
│   │   └── DigiLandRegistry.test.js
│   ├── hardhat.config.js
│   └── package.json
│
├── package.json                     # Root scripts
└── README.md
```

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- Git

---

### 1. Clone & Install

```bash
git clone https://github.com/yourname/digiland.git
cd digiland
npm run install:all
```

---

### 2. Configure Backend

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/digiland
JWT_SECRET=your_secure_secret_here
PORT=5000
```

---

### 3. Start MongoDB

```bash
# Local MongoDB
mongod --dbpath /data/db

# Or use MongoDB Atlas connection string in .env
```

---

### 4. Start Backend

```bash
cd server
npm run dev
# → API running at http://localhost:5000
```

Test the health endpoint:
```bash
curl http://localhost:5000/api/health
```

---

### 5. Start Frontend

```bash
cd client
npm start
# → UI at http://localhost:3000
```

---

### 6. Run Blockchain (Local)

**Terminal A** – Start local Hardhat node:
```bash
cd blockchain
npm run compile        # Compile Solidity
npx hardhat node       # Local Ethereum node at http://127.0.0.1:8545
```

**Terminal B** – Deploy contract:
```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
# → Copy the deployed address into server/.env as CONTRACT_ADDRESS
```

Run smart contract tests:
```bash
npx hardhat test
```

---

## 🔐 Core Logic – How Tamper Detection Works

```
User submits property data
        │
        ▼
Backend: generatePropertyHash(data)
  └─ Sort fields → JSON.stringify → SHA-256 → hex string
        │
        ▼
Store { data, hash } in MongoDB
        │
        ▼
Call DigiLandRegistry.registerProperty(propertyId, hash)
  └─ Hash stored immutably on Ethereum
        │
        ▼
Later: User clicks "Verify"
  └─ Recompute hash from current DB data
  └─ Compare with stored hash
  └─ MATCH → Intact ✅  |  MISMATCH → Tampered ⚠️
  └─ (Phase 2: also compare against on-chain hash)
```

---

## 🌐 API Reference

### Auth
| Method | Endpoint         | Body                        | Auth |
|--------|------------------|-----------------------------|------|
| POST   | /api/auth/signup | { name, email, password }   | ✗    |
| POST   | /api/auth/login  | { email, password }         | ✗    |
| GET    | /api/auth/me     | —                           | ✓    |

### Properties
| Method | Endpoint                        | Description               | Auth |
|--------|---------------------------------|---------------------------|------|
| GET    | /api/properties                 | List all (filterable)     | ✓    |
| POST   | /api/properties                 | Add new property + hash   | ✓    |
| GET    | /api/properties/:id             | Get single property       | ✓    |
| POST   | /api/properties/:id/verify      | Re-verify hash integrity  | ✓    |
| GET    | /api/properties/stats/summary   | Dashboard stats           | ✓    |

---

## 📋 Smart Contract – DigiLandRegistry.sol

```solidity
// Key functions:
registerProperty(string propertyId, bytes32 dataHash)  // owner only
updatePropertyHash(string propertyId, bytes32 newHash)  // owner only
getPropertyHash(string propertyId) → bytes32
verifyHash(string propertyId, bytes32 hashToCheck) → bool
isPropertyRegistered(string propertyId) → bool
getTotalProperties() → uint256
```

---

## 🗺️ Phase 2 Roadmap

- [ ] Full Google OAuth integration (Passport.js)
- [ ] Backend calls smart contract on property creation (ethers.js)
- [ ] On-chain hash verification in verify endpoint
- [ ] Role-based access: admin, verifier, public
- [ ] IPFS document storage for land certificates
- [ ] Multi-sig approval workflow for transfers
- [ ] Sepolia/mainnet deployment

---

## 👥 Built For

**Smart India Hackathon (SIH)** — Problem Statement: Unified Land Record Portal with Blockchain-Based Tamper Detection

**Domains addressed:** DORIS · DLRC · CERSAI · MCA21
