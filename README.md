# Aegis AI Platform

A high-fidelity crypto analysis and strategy execution platform built with Next.js 16, MongoDB, and Base Sepolia.

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
- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Framer Motion.
- **Backend API**: Next.js API Routes, Mongoose, Zod.
- **Infrastructure**: MongoDB 7, Nginx (Reverse Proxy), Node.js 20 Alpine.
- **Web3**: Wagmi, Viem, RainbowKit, Base Sepolia Testnet.

## 🧪 Testing
To run the end-to-end verification suite:
1. Ensure Docker containers are healthy.
2. Visit the dashboard at [http://localhost/dashboard](http://localhost/dashboard).
3. Connect MetaMask and verify the Base Sepolia network auto-switch.
4. Execute a strategy and verify the on-chain proof in the History tab.

---

## 🛡️ Multi-User Architecture & Security

Aegis AI is built to handle multiple concurrent users with production-grade stability and security:

### 1. Wallet-Based Isolation
Identity is managed entirely via the user's wallet address.
- **Frontend Isolation**: User sessions are browser-isolated via `localStorage`.
- **Backend Isolation**: API responses are strictly filtered by the connected wallet address.

### 2. Infrastructure Protection
- **Nginx Rate Limiting**: Protects the API layer from DDoS and spam by limiting requests to **5 req/s per IP** with a burst threshold of 10.
- **Database Pooling**: Configured with `maxPoolSize: 10` to ensure stable resource allocation under heavy concurrent load.

### 3. Trustless Verification
The system enforces security via the **Blockchain Proof (`txHash`)**:
- **Uniqueness**: Every transaction hash is indexed as a unique constraint in MongoDB, preventing duplicate strategy submissions.
- **Anti-Spam**: Successful database entry requires a valid `txHash`, ensuring that only users who have actually executed on-chain have their data recorded.

0164cd6d2d891504b85d0f7263648dff

RTsv_g_q9WWOQLlepuTbdSkbdzz4yd7ajwAuhkAVmVQTQVLsb4A-Lsvjo5TYtbGx2iRKn4MWBZYdDLPWLg_OhA

SỬ DỤNG https://thirdweb.com/team/moji-studio/ssssss-0164cd/contract/84532/0xdf1d1968c54e6d537bbdad0a9ed481c22f69f4aa để tạo smart contract