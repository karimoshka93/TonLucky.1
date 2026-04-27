import { useState } from 'react';
import { motion } from 'motion/react';
import { Target, TrendingUp, Calendar, Info } from 'lucide-react';
import { WalletContainer } from '../components/Navbar';

const MOCK_MATCHES = [
  { id: '1', home: 'Man City', away: 'Real Madrid', hOdds: 1.85, dOdds: 3.40, aOdds: 4.20, date: 'Tonight, 21:00' },
  { id: '2', home: 'Liverpool', away: 'Arsenal', hOdds: 2.10, dOdds: 3.20, aOdds: 3.10, date: 'Tomorrow, 19:30' },
  { id: '3', home: 'PSG', away: 'Dortmund', hOdds: 1.55, dOdds: 4.00, aOdds: 6.50, date: 'May 01, 21:00' },
];

export default function Predictions() {
  const [bettingOn, setBettingOn] = useState<{ matchId: string, outcome: string } | null>(null);

  return (
    <div className="px-5 pt-8 pb-24 max-w-md mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="text-green-500" /> Predictions
          </h1>
          <p className="text-xs text-neutral-400">Bet on matches, get high returns.</p>
        </div>
        <TrendingUp className="text-neutral-700" size={20} />
      </header>

      <WalletContainer />

      <div className="space-y-4">
        {MOCK_MATCHES.map((match) => (
          <div key={match.id} className="bg-neutral-900 border border-white/5 rounded-3xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Calendar size={12} />
                <span>{match.date}</span>
              </div>
              <Info size={14} className="text-neutral-700" />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="text-center flex-1">
                <div className="w-10 h-10 bg-white/5 rounded-full mx-auto mb-2" />
                <span className="text-sm font-bold block truncate px-1">{match.home}</span>
              </div>
              <div className="px-4 text-xs font-black text-neutral-700 italic">VS</div>
              <div className="text-center flex-1">
                <div className="w-10 h-10 bg-white/5 rounded-full mx-auto mb-2" />
                <span className="text-sm font-bold block truncate px-1">{match.away}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '1', odds: match.hOdds, type: 'home' },
                { label: 'X', odds: match.dOdds, type: 'draw' },
                { label: '2', odds: match.aOdds, type: 'away' },
              ].map((opt) => (
                <button
                  key={opt.label}
                  onClick={() => setBettingOn({ matchId: match.id, outcome: opt.type })}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-black border border-white/5 hover:border-blue-500 transition-colors uppercase"
                >
                  <span className="text-[10px] text-neutral-500 font-bold mb-1">{opt.label}</span>
                  <span className="text-sm font-black text-blue-500">{opt.odds.toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {bettingOn && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-end justify-center p-4">
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="w-full max-w-sm bg-neutral-900 rounded-[32px] p-6 border border-white/10"
          >
            <h3 className="text-lg font-bold mb-4">Place your bet</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Selection</span>
                <span className="font-bold text-blue-500 uppercase">{bettingOn.outcome}</span>
              </div>
              <div>
                <label className="text-xs text-neutral-500 block mb-2 font-bold uppercase tracking-wider">Amount (TON)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    defaultValue="1"
                    className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setBettingOn(null)}
                className="flex-1 py-4 text-sm font-bold text-neutral-400"
              >
                Cancel
              </button>
              <button className="flex-[2] bg-blue-600 rounded-2xl font-bold py-4 active:scale-95 transition-transform">
                Place Bet
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
