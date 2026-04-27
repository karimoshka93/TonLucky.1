import { TonConnectButton } from '@tonconnect/ui-react';
import { NavLink } from 'react-router-dom';
import { Home, Trophy, Gift, Target, ListChecks, Users, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
  const navItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/lottery', icon: Trophy, label: 'Lottery' },
    { to: '/boxes', icon: Gift, label: 'Boxes' },
    { to: '/predictions', icon: Target, label: 'Bets' },
    { to: '/tasks', icon: ListChecks, label: 'Tasks' },
    { to: '/referral', icon: Users, label: 'Ref' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#161920] border-t border-white/5 pb-safe pb-4">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 transition-all",
                isActive ? "text-ton-blue opacity-100" : "text-white opacity-40 hover:opacity-100"
              )
            }
          >
            <item.icon size={22} className="transition-all" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function WalletContainer() {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-[#161920]/50 rounded-3xl border border-white/5 mb-6">
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Total Balance</span>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold">0.00 <span className="text-ton-blue">TON</span></span>
        </div>
      </div>
      <div className="bg-ton-blue/10 border border-ton-blue/30 px-3 py-2 rounded-xl">
        <TonConnectButton />
      </div>
    </div>
  );
}
