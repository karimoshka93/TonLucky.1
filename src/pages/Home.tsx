import { motion } from 'motion/react';
import { WalletContainer } from '../components/Navbar';
import { Trophy, Gift, Target, ArrowRight, Zap, TrendingUp, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Home() {
  const features = [
    {
      title: 'Lottery Rooms',
      desc: 'Buy tickets and win up to 48 TON.',
      icon: Trophy,
      to: '/lottery',
      color: 'text-yellow-500',
      bg: 'bg-yellow-500/10',
      hot: true
    },
    {
      title: 'Mystery Boxes',
      desc: 'Test your luck for 1 TON.',
      icon: Gift,
      to: '/boxes',
      color: 'text-ton-blue',
      bg: 'bg-ton-blue/10',
    },
    {
      title: 'Football Bet',
      desc: 'Predict scores, earn rewards.',
      icon: Target,
      to: '/predictions',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
  ];

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto min-h-screen">
      <header className="mb-8 px-2 flex justify-between items-end">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-black tracking-tight"
          >
            Ton<span className="text-ton-blue">Bet</span>
          </motion.h1>
          <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-1">Premium TMA Platform</p>
        </div>
        <div className="flex gap-1.5 opacity-40 mb-2">
          <div className="w-4 h-4 rounded-full border border-white/40"></div>
          <div className="w-4 h-4 rounded-full border border-white/40"></div>
        </div>
      </header>

      <WalletContainer />

      <section className="space-y-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Recommended</h2>
          <Zap size={14} className="text-ton-blue" />
        </div>
        
        {features.map((feature, i) => (
          <Link key={feature.title} to={feature.to}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group relative p-5 bg-gradient-to-br from-[#1e222b] to-[#14161c] border border-white/10 rounded-3xl flex items-center gap-5 hover:border-ton-blue/30 active:scale-[0.98] transition-all overflow-hidden"
            >
              {feature.hot && (
                <div className="absolute top-3 right-3 bg-orange-500/20 text-orange-400 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Hot</div>
              )}
              <div className={cn(feature.bg, feature.color, "p-3 rounded-2xl shadow-sm")}>
                <feature.icon size={26} />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-lg">{feature.title}</h3>
                <p className="text-[11px] text-slate-400 font-medium">{feature.desc}</p>
              </div>
              <ArrowRight size={18} className="text-slate-700 group-hover:text-ton-blue transition-colors" />
            </motion.div>
          </Link>
        ))}
      </section>

      <div className="mt-8 p-6 bg-ton-blue rounded-[32px] relative overflow-hidden shadow-xl shadow-ton-blue/20">
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-1">Refer & Earn 20%</h3>
          <p className="text-xs text-white/80 mb-4 font-medium leading-relaxed max-w-[180px]">Invite friends and get a bonus on every deposit they make.</p>
          <Link to="/referral" className="inline-flex items-center gap-2 bg-white text-ton-blue px-6 py-2.5 rounded-xl text-xs font-black active:scale-95 transition-transform uppercase tracking-wider">
            Invite Now <Users size={14} />
          </Link>
        </div>
        <TrendingUp size={140} className="absolute -bottom-6 -right-6 text-white/10 rotate-[-10deg]" />
      </div>
    </div>
  );
}
