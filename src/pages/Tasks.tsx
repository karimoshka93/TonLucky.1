import { useState, useEffect } from 'react';
import { ListChecks, Twitter, Instagram, Send, PlayCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export default function Tasks() {
  const [adCooldown, setAdCooldown] = useState(0);

  const tasks = [
    { id: '1', title: 'Join Telegram Channel', icon: Send, reward: 0.001, color: 'text-blue-400' },
    { id: '2', title: 'Follow on X (Twitter)', icon: Twitter, reward: 0.001, color: 'text-white' },
    { id: '3', title: 'Follow on Instagram', icon: Instagram, reward: 0.001, color: 'text-pink-500' },
  ];

  useEffect(() => {
    if (adCooldown > 0) {
      const timer = setInterval(() => setAdCooldown(c => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [adCooldown]);

  const watchAd = () => {
    if (adCooldown > 0) return;
    alert('Simulating Ad Play...');
    setAdCooldown(3600); // 1 hour
  };

  return (
    <div className="px-5 pt-8 pb-24 max-w-md mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ListChecks className="text-blue-500" /> Daily Tasks
        </h1>
        <p className="text-xs text-neutral-400">Complete tasks and watch ads to earn TON.</p>
      </header>

      <section className="mb-8">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-4">Ad Rewards</h2>
        <div className="bg-neutral-900 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center">
          <div className="p-4 bg-blue-500/10 rounded-full text-blue-500 mb-4">
            <PlayCircle size={32} />
          </div>
          <h3 className="font-bold text-lg mb-1">Watch & Earn</h3>
          <p className="text-xs text-neutral-500 mb-6 font-medium">Earn 0.001 TON every hour by watching a quick ad.</p>
          
          <button 
            onClick={watchAd}
            disabled={adCooldown > 0}
            className="w-full bg-blue-600 disabled:bg-neutral-800 disabled:text-neutral-600 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {adCooldown > 0 ? (
              <>
                <Clock size={16} /> {Math.floor(adCooldown / 60)}:{String(adCooldown % 60).padStart(2, '0')}
              </>
            ) : (
              'Watch Ad (0.001 TON)'
            )}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-1">Social Tasks</h2>
        {tasks.map((task) => (
          <div key={task.id} className="bg-neutral-900 border border-white/5 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={"p-2 bg-white/5 rounded-xl " + task.color}>
                <task.icon size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{task.title}</span>
                <span className="text-[10px] text-blue-500 font-bold">+{task.reward} TON</span>
              </div>
            </div>
            <button className="bg-white text-black text-[10px] font-black px-4 py-2 rounded-lg active:scale-95 transition-transform uppercase">
              Start
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
