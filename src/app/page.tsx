'use client';

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/shared/Badge';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { useMetamask } from '@/hooks/useMetamask';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: 'easeOut' as const }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const { isConnected, connect, isProcessing } = useMetamask();
  const router = useRouter();

  useEffect(() => {
    if (isConnected) {
      router.push('/dashboard');
    }
  }, [isConnected, router]);
  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
      {/* Dot Pattern Background */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.4]"
        style={{
          backgroundImage: 'radial-gradient(#e4e4e7 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Header */}
      <motion.header 
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 h-[60px] bg-white/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-8"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-primary rounded-[6px] flex items-center justify-center text-white font-bold">
            🛡️
          </div>
          <span className="text-[18px] font-bold tracking-tight text-text-primary">AEGIS AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={connect} 
            disabled={isProcessing}
            className="btn-secondary flex items-center gap-2"
          >
            {isProcessing ? "Connecting..." : "Connect Wallet →"}
          </button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative z-10 pt-48 pb-[100px] flex flex-col items-center text-center px-6">
        <motion.div {...fadeInUp}>
          <Badge variant="success" className="mb-6 px-3 py-1 bg-[#f0fdf4] border border-[#bbf7d0] rounded-full">
            ✦ AI-Powered Risk Management
          </Badge>
        </motion.div>
        
        <motion.h1 
          className="text-[56px] font-bold text-text-primary tracking-[-0.04em] leading-[1.1] max-w-[800px]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Strategic Command <br />
          <span className="bg-gradient-to-r from-green-primary to-green-hover bg-clip-text text-transparent">
            Center
          </span>
        </motion.h1>

        <motion.p 
          className="mt-6 text-[18px] text-text-secondary max-w-[520px] leading-relaxed"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.2 }}
        >
          Phân tích tài sản số với AI — Quản trị rủi ro thông minh — Minh bạch Blockchain trên Base Network
        </motion.p>

        <motion.div 
          className="mt-10 flex flex-col items-center gap-4"
          {...fadeInUp}
          transition={{ ...fadeInUp.transition, delay: 0.3 }}
        >
          <button 
            onClick={connect}
            disabled={isProcessing}
            className="btn-primary py-3.5 px-8 text-[15px]"
          >
            {isConnected ? "Launch Dashboard →" : isProcessing ? "Connecting..." : "Connect Wallet →"}
          </button>
          <span className="text-[12px] text-text-muted">
            Base Sepolia Testnet · No fees required
          </span>
        </motion.div>

        {/* Value Props */}
        <motion.div 
          className="mt-[100px] grid grid-cols-1 md:grid-cols-3 gap-4 max-w-[1200px] w-full"
          variants={stagger}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          <motion.div className="card text-left p-6 border-l-[3px] border-l-green-primary" variants={fadeInUp}>
            <span className="text-[24px]">📊</span>
            <h3 className="font-semibold text-[15px] mt-4">Phân tích Đa nguồn</h3>
            <p className="text-[14px] text-text-secondary mt-2">
              RSI, On-chain data và Market sentiment tổng hợp thành Aegis Score duy nhất
            </p>
          </motion.div>
          
          <motion.div className="card text-left p-6 border-l-[3px] border-l-green-primary" variants={fadeInUp}>
            <span className="text-[24px]">🛡️</span>
            <h3 className="font-semibold text-[15px] mt-4">Quản trị Rủi ro</h3>
            <p className="text-[14px] text-text-secondary mt-2">
              Tự động tính Entry, Stop Loss và Take Profit dựa trên ATR thực tế
            </p>
          </motion.div>

          <motion.div className="card text-left p-6 border-l-[3px] border-l-green-primary" variants={fadeInUp}>
            <span className="text-[24px]">⛓️</span>
            <h3 className="font-semibold text-[15px] mt-4">Minh bạch Blockchain</h3>
            <p className="text-[14px] text-text-secondary mt-2">
              Mọi chiến lược được ghi vĩnh viễn lên Base Sepolia, tra cứu bất kỳ lúc nào
            </p>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}
