import { useState, useEffect } from 'react';
import { Users, Copy, Share2, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useTonWallet } from '@tonconnect/ui-react';
import { supabase } from '../lib/supabase';

export default function Referral() {
  const wallet = useTonWallet();
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ count: 0, earned: 0 });
  const [referrals, setReferrals] = useState<any[]>([]);

  const address = wallet?.account.address || "";
  const refLink = address 
    ? `https://t.me/XTonBet_bot/play?startapp=${address}`
    : "Connect wallet to get link";

  useEffect(() => {
    if (address) {
      fetchReferralStats();
    }
  }, [address]);

  const fetchReferralStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch referrals count and total earned
    const { data, count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('referred_by', user.id);

    if (data) {
      // Find my own profile for earnings
      const { data: myProfile } = await supabase
        .from('profiles')
        .select('total_earned_referral')
        .eq('id', user.id)
        .single();

      setReferrals(data);
      setStats({
        count: count || 0,
        earned: Number(myProfile?.total_earned_referral || 0)
      });
    }
  };

  const copyToClipboard = () => {
    if (!address) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnTelegram = () => {
    if (!address) return;
    const text = encodeURIComponent("Join TonBet and win big! Use my link to get a bonus:");
    const url = encodeURIComponent(refLink);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  return (
    <div className="px-5 pt-8 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2 font-black">
          <Users className="text-blue-500" /> Refer & Earn
        </h1>
        <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">Build your team, get lifetime bonuses.</p>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[32px] p-8 mb-8 relative overflow-hidden shadow-2xl shadow-blue-500/20"
      >
        <div className="relative z-10">
          <h2 className="text-4xl font-black mb-2 italic tracking-tighter">20% Bonus</h2>
          <p className="text-sm text-blue-100 opacity-90 leading-relaxed max-w-[200px] font-medium">
            Get 20% of whatever your friend deposits for the first time.
          </p>
        </div>
        <TrendingUp size={160} className="absolute -bottom-10 -right-10 text-white/10" />
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900 border border-white/5 p-5 rounded-3xl text-center">
          <span className="text-[10px] uppercase font-black text-neutral-500 tracking-wider mb-1 block">Total Refs</span>
          <span className="text-2xl font-black">{stats.count}</span>
        </div>
        <div className="bg-neutral-900 border border-white/5 p-5 rounded-3xl text-center">
          <span className="text-[10px] uppercase font-black text-neutral-500 tracking-wider mb-1 block">Earned</span>
          <span className="text-2xl font-black text-blue-500">{stats.earned} TON</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em] px-2">Your Link</h2>
        <div className="flex bg-black border border-white/10 p-2 rounded-2xl items-center group">
          <input 
            readOnly 
            value={refLink} 
            className="bg-transparent flex-1 px-3 py-2 text-[10px] font-mono outline-none text-neutral-400 group-hover:text-white transition-colors"
          />
          <button 
            onClick={copyToClipboard}
            className="p-3 bg-blue-600 rounded-xl active:scale-95 transition-all shadow-lg shadow-blue-600/30"
          >
            {copied ? <span className="text-[10px] font-black uppercase px-2">Copied</span> : <Copy size={16} />}
          </button>
        </div>
        
        <button 
          onClick={shareOnTelegram}
          className="w-full bg-white text-black py-4 rounded-2xl font-black flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg"
        >
          Share on Telegram <Share2 size={18} />
        </button>
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-[0.2em] px-2 mb-4">Latest Referrals</h2>
        <div className="space-y-2">
          {referrals.length === 0 ? (
            <div className="text-center py-8 bg-neutral-900/30 rounded-3xl border border-dashed border-white/10">
               <p className="text-xs text-neutral-500">No referrals yet. Share your link!</p>
            </div>
          ) : (
            referrals.map((ref, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-neutral-900/50 rounded-2xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Users size={14} className="text-blue-500" />
                  </div>
                  <span className="text-xs font-bold">{ref.username || `User_${ref.wallet_address.slice(-4)}`}</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono italic">{new Date(ref.created_at).toLocaleDateString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
