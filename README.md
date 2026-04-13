# Aegis AI Platform

A high-fidelity crypto analysis and strategy execution platform built with Next.js 14, MongoDB, and Base Sepolia.

## 🚀 Quick Start

### 1. Prerequisites
- Docker & Docker Compose
- MetaMask installed in your browser

### 2. Configuration
Create a `.env` file in the root directory:
```env
MONGODB_URI=mongodb://aegis:aegis123@mongo:27017/aegisdb?authSource=admin
NODE_ENV=development
NEXT_PUBLIC_CHAIN_ID=0x14A34
NEXT_PUBLIC_CONTRACT_ADDRESS=0x9115Db7012D4C2C32414705030206D39050Be6Af
NEXT_PUBLIC_APP_URL=http://localhost:80
```

### 3. Deploy with Docker
```bash
docker compose up --build -d
```
The application will be available at [http://localhost](http://localhost).

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend API**: Next.js API Routes, Mongoose, Zod.
- **Infrastructure**: MongoDB 7, Nginx (Reverse Proxy), Node.js 20 Alpine.
- **Web3**: ethers.js, MetaMask, Base Sepolia Testnet.

## 🧪 Testing
To run the end-to-end verification suite:
1. Ensure Docker containers are healthy.
2. Visit the dashboard at [http://localhost/dashboard](http://localhost/dashboard).
3. Connect MetaMask and verify the Base Sepolia network auto-switch.
4. Execute a strategy and verify the on-chain proof in the History tab.
