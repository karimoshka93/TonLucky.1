import { useState } from 'react';
import { Users, Copy, Share2, Wallet, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export default function Referral() {
  const [copied, setCopied] = useState(false);
  const refLink = "https://t.me/tonbet_bot?start=ref12345";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="px-5 pt-8 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="text-blue-500" /> Refer & Earn
        </h1>
        <p className="text-xs text-neutral-400">Build your team, get lifetime bonuses.</p>
      </header>

      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] p-8 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-3xl font-black mb-2">20% Bonus</h2>
          <p className="text-sm text-blue-100 opacity-90 leading-relaxed max-w-[200px]">
            Get 20% of whatever your friend deposits for the first time.
          </p>
        </div>
        <TrendingUp size={160} className="absolute -bottom-10 -right-10 text-white/10" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900 border border-white/5 p-5 rounded-3xl text-center">
          <span className="text-[10px] uppercase font-black text-neutral-500 tracking-wider mb-1 block">Total Refs</span>
          <span className="text-2xl font-black">12</span>
        </div>
        <div className="bg-neutral-900 border border-white/5 p-5 rounded-3xl text-center">
          <span className="text-[10px] uppercase font-black text-neutral-500 tracking-wider mb-1 block">Earned</span>
          <span className="text-2xl font-black text-blue-500">4.5 TON</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em] px-2">Your Link</h2>
        <div className="flex bg-black border border-white/10 p-2 rounded-2xl items-center">
          <input 
            readOnly 
            value={refLink} 
            className="bg-transparent flex-1 px-3 py-2 text-xs font-mono outline-none"
          />
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-blue-600 rounded-xl active:scale-95 transition-all"
          >
            {copied ? <span className="text-[10px] font-black uppercase px-2">Copied</span> : <Copy size={16} />}
          </button>
        </div>
        
        <button className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          Share on Telegram <Share2 size={18} />
        </button>
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em] px-2 mb-4">Latest Referrals</h2>
        <div className="space-y-1">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full" />
                <span className="text-sm font-medium">User_0x...{i}f2</span>
              </div>
              <span className="text-xs text-blue-500 font-bold">+0.5 TON</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
