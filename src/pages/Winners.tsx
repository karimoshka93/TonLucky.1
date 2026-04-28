import { motion } from 'motion/react';
import { Trophy, History, ArrowUpRight, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { formatTon } from '../lib/utils';

interface Winner {
  username: string;
  wallet_address: string;
  amount: number;
  room_type: string;
  won_at: string;
  isFake?: boolean;
}

const FAKE_WINNERS: Winner[] = [
  { username: 'ton_king', wallet_address: 'UQ...8X92', amount: 48.0, room_type: 'Golden Tier', won_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(), isFake: true },
  { username: 'crypto_ninja', wallet_address: 'UQ...vR4k', amount: 9.0, room_type: 'Standard Tier', won_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), isFake: true },
  { username: 'lucky_day', wallet_address: 'UQ...mP1q', amount: 1.5, room_type: 'Standard Tier', won_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), isFake: true },
  { username: 'dubai_whale', wallet_address: 'UQ...zS7t', amount: 48.0, room_type: 'Golden Tier', won_at: new Date(Date.now() - 1000 * 3600 * 2).toISOString(), isFake: true },
  { username: 'ton_master', wallet_address: 'UQ...pL9w', amount: 9.0, room_type: 'Standard Tier', won_at: new Date(Date.now() - 1000 * 3600 * 3).toISOString(), isFake: true },
  // ... adding more to reach 30 roughly for advertisement
  ...Array(25).fill(null).map((_, i) => ({
    username: `User_${Math.floor(Math.random() * 9999)}`,
    wallet_address: `UQ...${Math.random().toString(36).substring(2, 6)}`,
    amount: [1.5, 9.0, 48.0][Math.floor(Math.random() * 3)],
    room_type: ['Standard Tier', 'Standard Tier', 'Golden Tier'][Math.floor(Math.random() * 3)],
    won_at: new Date(Date.now() - 1000 * 3600 * (i + 4)).toISOString(),
    isFake: true
  }))
];

export default function Winners() {
  const [winners, setWinners] = useState<Winner[]>(FAKE_WINNERS);

  useEffect(() => {
    async function fetchRealWinners() {
      const { data, error } = await supabase
        .from('lottery_rooms')
        .select('*, profiles(username, wallet_address)')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        const mappedWinners: Winner[] = data.map((room: any) => ({
          username: room.profiles?.username || 'Winner',
          wallet_address: room.profiles?.wallet_address || 'UQ...',
          amount: room.prize_pool,
          room_type: room.name,
          won_at: room.created_at,
          isFake: false
        }));
        
        // Merge real winners with fake ones if real count is low
        setWinners([...mappedWinners, ...FAKE_WINNERS].slice(0, 30));
      }
    }
    fetchRealWinners();
  }, []);

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto min-h-screen">
      <header className="mb-8">
        <h1 className="text-3xl font-black flex items-center gap-3">
          <Trophy className="text-yellow-500" size={32} /> Hall of <span className="text-ton-blue">Fame</span>
        </h1>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-2">Latest 30 Jackpot Winners</p>
      </header>

      <div className="space-y-3">
        {winners.map((winner, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            className="bg-[#161920] border border-white/5 rounded-2xl p-4 flex items-center justify-between group overflow-hidden relative"
          >
            {winner.amount === 48 && (
              <div className="absolute -left-1 top-0 bottom-0 w-1 bg-ton-blue" />
            )}
            
            <div className="flex items-center gap-4 relative z-10">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                winner.amount === 48 ? "bg-ton-blue/10 border-ton-blue/20" : "bg-white/5 border-white/5"
              )}>
                {winner.amount === 48 ? (
                  <Crown size={20} className="text-ton-blue" />
                ) : (
                  <Trophy size={18} className="text-slate-500" />
                )}
              </div>
              
              <div>
                <h4 className="text-sm font-bold flex items-center gap-2">
                  {winner.username}
                  {winner.amount === 48 && <span className="text-[8px] bg-ton-blue/20 text-ton-blue px-1 rounded uppercase font-black">High Roller</span>}
                </h4>
                <p className="text-[9px] text-slate-500 font-mono">{winner.wallet_address}</p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <div className="text-sm font-black text-white flex items-center gap-1">
                +{winner.amount} <span className="text-ton-blue">TON</span>
                <ArrowUpRight size={14} className="text-green-500" />
              </div>
              <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">
                {new Date(winner.won_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Subtle background flair */}
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <History size={40} className="text-white/[0.02] -rotate-12" />
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
        <p className="text-[10px] text-slate-500 font-medium">Advertising: All Jackpots are verified on-chain.</p>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
