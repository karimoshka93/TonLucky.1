import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Package, Loader2 } from 'lucide-react';
import { rollMysteryBox, formatTon, cn } from '../lib/utils';
import { WalletContainer } from '../components/Navbar';
import { useTonConnectUI } from '@tonconnect/ui-react';

export default function MysteryBoxes() {
  const [tonConnectUI] = useTonConnectUI();
  const [opening, setOpening] = useState(false);
  const [result, setResult] = useState<any>(null);

  const openBox = async () => {
    if (!tonConnectUI.connected) {
      alert('Connect wallet to open box');
      return;
    }

    setOpening(true);
    setResult(null);

    try {
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{ address: "YOUR_ADMIN_WALLET_ADDRESS", amount: "1000000000" }],
      };

      await tonConnectUI.sendTransaction(transaction);
      
      // Simulate rolling animation
      await new Promise(r => setTimeout(r, 2000));
      
      const rolled = rollMysteryBox();
      setResult(rolled);
    } catch (e) {
      console.error(e);
      alert('Transaction failed or cancelled');
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto min-h-screen">
      <header className="mb-6 px-2">
        <h1 className="text-2xl font-black flex items-center gap-3">
          <Gift className="text-ton-blue" size={28} /> Mystery Box
        </h1>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Instant Luck</p>
      </header>

      <WalletContainer />

      <div className="flex flex-col items-center justify-center min-h-[460px] bg-gradient-to-br from-[#1e222b] to-[#14161c] border border-white/10 rounded-[48px] p-8 shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key="box"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="text-center w-full"
            >
              <motion.div
                animate={opening ? { 
                  rotate: [0, -5, 5, -5, 5, 0],
                  scale: [1, 1.05, 1],
                } : { 
                  y: [0, -12, 0] 
                }}
                transition={opening ? { duration: 0.15, repeat: Infinity } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="mb-10 flex justify-center"
              >
                <div className="w-40 h-40 bg-gradient-to-br from-ton-blue to-[#005c8e] rounded-[40px] flex items-center justify-center text-6xl shadow-2xl shadow-ton-blue/30 relative">
                  <Package size={80} className="text-white/20 absolute opacity-20 rotate-12" />
                  🎁
                </div>
              </motion.div>
              
              <h2 className="text-2xl font-black mb-1">Standard Box</h2>
              <p className="text-slate-500 text-xs font-bold mb-10 uppercase tracking-widest">Prize: 0.5 — 10.0 <span className="text-ton-blue">TON</span></p>

              <button
                onClick={openBox}
                disabled={opening}
                className="w-full bg-white text-black font-black py-4 rounded-2xl shadow-xl hover:bg-ton-blue hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-[0.1em] text-sm disabled:opacity-50"
              >
                {opening ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> OPENING...
                  </>
                ) : (
                  <>
                    Open for 1.0 TON <Sparkles size={18} />
                  </>
                )}
              </button>
            </motion.div>
          ) : (
             // ... result logic ...
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              className="text-center"
            >
              <div className="mb-8 relative flex justify-center">
                {result.reward !== 'LOSE' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-ton-blue blur-[60px] rounded-full"
                  />
                )}
                <div className={cn("text-7xl drop-shadow-2xl", result.reward === 'LOSE' ? "grayscale opacity-40" : "animate-bounce")}>
                   {result.reward === 'LOSE' ? '💀' : '💎'}
                </div>
              </div>
              
              <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter">
                {result.reward === 'LOSE' ? 'Bad Luck' : 'Jackpot!'}
              </h3>
              <p className={cn("text-xl font-black mb-10 uppercase tracking-widest", result.reward === 'LOSE' ? "text-slate-600" : "text-ton-blue")}>
                {result.reward === 'LOSE' ? 'Better luck next time' : `+ ${result.amount}.0 TON`}
              </p>

              <button
                onClick={() => setResult(null)}
                className="bg-white/10 hover:bg-white/20 text-white font-black px-8 py-3 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all"
              >
                Claim & Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Probability List */}
        <div className="absolute bottom-6 left-0 right-0 px-8">
          <div className="flex justify-between items-center text-[7px] text-slate-500 uppercase font-black tracking-[0.15em] border-t border-white/5 pt-4">
            <span>10T: 0.1%</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span>2T: 0.9%</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span>1T: 19%</span>
            <span className="w-1 h-1 bg-white/10 rounded-full" />
            <span>LOSE: 30%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
