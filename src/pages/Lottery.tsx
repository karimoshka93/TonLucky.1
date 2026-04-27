import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Info, Ticket } from 'lucide-react';
import { LOTTERY_TIERS, formatTon, cn } from '../lib/utils';
import { WalletContainer } from '../components/Navbar';
import { useTonConnectUI } from '@tonconnect/ui-react';

export default function Lottery() {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState<string | null>(null);

  const buyTicket = async (tierId: string, cost: number) => {
    // ... function logic remains unchanged ...
  };

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto">
      <header className="mb-6 px-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3">
            <Trophy className="text-yellow-500" size={28} /> Lottery
          </h1>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Winning Rooms</p>
        </div>
        <button className="p-2 bg-[#161920] rounded-xl text-slate-500 border border-white/5">
          <Info size={18} />
        </button>
      </header>

      <WalletContainer />

      <div className="px-2 mb-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Rooms</p>
      </div>

      <div className="space-y-4">
        {LOTTERY_TIERS.map((tier, idx) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={cn(
              "p-6 rounded-[32px] relative overflow-hidden border",
              idx === 2 ? "bg-gradient-to-br from-[#1e222b] to-[#14161c] border-white/10 shadow-xl" : "bg-[#161920] border-white/5"
            )}
          >
            {idx === 2 && (
              <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-400 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest">Hot</div>
            )}
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">
                    {tier.cost === 5 ? 'Golden Tier' : 'Standard Tier'}
                  </p>
                  <h3 className="text-2xl font-black text-white">Win {tier.prize}.0 <span className="text-ton-blue">TON</span></h3>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider">
                  <span className="text-slate-500">Progress</span>
                  <span className="text-white">7 / {tier.participants} Entries</span>
                </div>
                <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '35%' }}
                    className="bg-ton-blue h-full rounded-full shadow-[0_0_10px_#0098EA]" 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                <div className="flex -space-x-2">
                   {[1,2,3].map(i => (
                     <div key={i} className="w-7 h-7 rounded-full border-2 border-[#161920] bg-slate-800 text-[8px] flex items-center justify-center font-bold">U{i}</div>
                   ))}
                   <div className="w-7 h-7 rounded-full border-2 border-[#161920] bg-slate-900 border-dashed flex items-center justify-center text-[8px] font-bold text-slate-500">+4</div>
                </div>
                <button 
                  disabled={loading === tier.id}
                  onClick={() => buyTicket(tier.id, tier.cost)}
                  className="bg-white text-black font-black px-8 py-3 rounded-xl text-xs active:scale-95 hover:bg-ton-blue hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest"
                >
                  {loading === tier.id ? 'PENDING...' : `BUY ${tier.cost} TON`}
                </button>
              </div>
            </div>
            
            <Trophy size={140} className="absolute -bottom-8 -right-8 text-white/[0.02] -rotate-12" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
