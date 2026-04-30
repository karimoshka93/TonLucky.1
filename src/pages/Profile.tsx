import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  User as UserIcon, 
  History, 
  Ticket, 
  Gift, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  ChevronRight,
  Mail,
  ShieldCheck,
  Info,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProfileData {
  id: string;
  username: string;
  balance: number;
  avatar_url: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  created_at: string;
}

interface TicketRecord {
  id: string;
  room_name: string;
  ticket_number: number;
  created_at: string;
}

interface BoxLog {
  id: string;
  reward_type: string;
  reward_amount: number;
  created_at: string;
}

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [boxLogs, setBoxLogs] = useState<BoxLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transactions' | 'games'>('transactions');
  
  const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;

  const fetchData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      setUser(authUser);

      // Fetch Profile
      const { data: pData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (pData) setProfile(pData);

      // Fetch Transactions
      const { data: tData } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (tData) setTransactions(tData);

      // Fetch Tickets
      const { data: ticketData } = await supabase
        .from('tickets')
        .select('*, lottery_rooms(room_name)')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (ticketData) {
        setTickets(ticketData.map((t: any) => ({
          id: t.id,
          room_name: t.lottery_rooms?.room_name || 'Lottery Entry',
          ticket_number: t.ticket_number || 0,
          created_at: t.created_at
        })));
      }

      // Fetch Box Logs
      const { data: bData } = await supabase
        .from('mystery_box_logs')
        .select('*')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (bData) setBoxLogs(bData);

    } catch (e) {
      console.error('Data fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Pulse data every 10s
    return () => clearInterval(interval);
  }, []);

  if (loading && !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <RefreshCw size={32} className="text-ton-blue animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Authenticating Profile...</p>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="w-20 h-20 bg-ton-blue/10 border border-ton-blue/20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-ton-blue/5">
          <UserIcon size={40} className="text-ton-blue" />
        </div>
        <h2 className="text-2xl font-black mb-2 italic uppercase">Identity Required</h2>
        <p className="text-slate-400 text-sm max-w-[240px] leading-relaxed mb-8 italic">
          Please wait while we establish your secure Telegram session...
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#161920] border border-white/5 py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
        >
          Reload Session
        </button>
      </div>
    );
  }

  return (
    <div className="px-6 pt-10 pb-32 max-w-md mx-auto min-h-screen">
      {/* Profile Identity Card */}
      <div className="bg-[#1e222b] border border-white/5 rounded-[32px] p-6 mb-4 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4">
          <div className="px-3 py-1 bg-ton-blue/10 border border-ton-blue/20 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-black text-ton-blue uppercase tracking-widest">Live Profile</span>
          </div>
        </div>

        <div className="flex flex-col items-center text-center mb-8 pt-4">
          <div className="relative mb-4 group">
            <div className="absolute inset-0 bg-ton-blue blur-2xl opacity-20 rounded-full scale-110 group-hover:opacity-40 transition-opacity" />
            {tgUser?.photo_url ? (
              <img 
                referrerPolicy="no-referrer"
                src={tgUser.photo_url} 
                alt="Profile" 
                className="w-24 h-24 rounded-[32px] border-4 border-[#252a35] shadow-2xl relative z-10 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-[32px] bg-[#252a35] border-4 border-[#252a35] flex items-center justify-center relative z-10 shadow-2xl">
                <UserIcon size={40} className="text-ton-blue opacity-50" />
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-black italic tracking-tight text-white mb-1">
            {tgUser?.username ? `@${tgUser.username}` : (tgUser?.first_name || profile?.username || 'Premium Player')}
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] italic">
            ID: {tgUser?.id || user?.id.slice(0, 8)}
          </p>
        </div>

        <div className="bg-black/20 rounded-2xl p-6 border border-white/5 flex flex-col items-center gap-2">
          <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-[0.2em]">Available Balance</span>
          <div className="flex items-center gap-2">
            <span className="text-4xl font-black text-white italic">
              {(profile?.balance || 0).toFixed(2)}
            </span>
            <span className="text-xs font-black text-ton-blue bg-ton-blue/10 px-2 py-1 rounded-lg">TON</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link to="/deposit" className="flex items-center justify-center gap-2 bg-white text-black py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
            Add Funds <ArrowDownLeft size={14} />
          </Link>
          <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
            Withdraw <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Stats Quick Link */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/referral" className="flex items-center justify-between p-4 bg-[#1e222b] border border-white/5 rounded-2xl group">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <RefreshCw size={14} />
            </div>
            <span className="text-[9px] font-black text-white uppercase tracking-widest">Referrals</span>
          </div>
          <ChevronRight size={12} className="text-slate-600" />
        </Link>
        <div className="flex items-center justify-between p-4 bg-[#1e222b] border border-white/5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ton-blue/10 flex items-center justify-center text-ton-blue">
              <Wallet size={14} />
            </div>
            <span className="text-[9px] font-black text-white uppercase tracking-widest italic">Verified</span>
          </div>
          <ShieldCheck size={12} className="text-green-500" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-[#1e222b] p-1.5 rounded-2xl mb-4 border border-white/5">
        <button 
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'transactions' ? "bg-white text-black" : "text-slate-500"
          )}
        >
          <History size={14} /> Activity
        </button>
        <button 
          onClick={() => setActiveTab('games')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'games' ? "bg-white text-black" : "text-slate-500"
          )}
        >
          <Ticket size={14} /> Game Log
        </button>
      </div>

      {/* Records List */}
      <div className="space-y-3">
        {activeTab === 'transactions' ? (
          transactions.length > 0 ? (
            transactions.map((tx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={tx.id} 
                className="p-4 bg-[#1e222b]/40 border border-white/5 rounded-2xl flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    tx.amount > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {tx.amount > 0 ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white capitalize italic tracking-wide">
                      {tx.type.replace('_', ' ')}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(tx.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-black italic",
                  tx.amount > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </motion.div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
              <History size={40} className="opacity-20" />
              <p className="italic text-[10px] font-black uppercase tracking-[0.2em]">No transactions recorded</p>
            </div>
          )
        ) : (
          <div className="space-y-3">
            {[...tickets, ...boxLogs].length > 0 ? (
              <>
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-[#1e222b]/40 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-ton-blue/10 text-ton-blue flex items-center justify-center">
                        <Ticket size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase italic">{ticket.room_name}</h4>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">Ticket #{ticket.ticket_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 italic">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                {boxLogs.map((log) => (
                  <div key={log.id} className="p-4 bg-[#1e222b]/40 border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                        <Gift size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white italic">Mystery Box Roll</h4>
                        <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5 capitalize">{log.reward_type}</p>
                      </div>
                    </div>
                    <span className="text-sm font-black text-purple-400 italic">
                      {log.reward_amount > 0 ? `+${log.reward_amount} TON` : 'Empty Box'}
                    </span>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-600 gap-4">
                <Ticket size={40} className="opacity-20" />
                <p className="italic text-[10px] font-black uppercase tracking-[0.2em]">No gaming activity recorded</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extra Info */}
      <div className="mt-12 space-y-3">
        <a href="mailto:support@tonbet.io" className="flex items-center justify-between p-5 bg-[#1e222b] border border-white/5 rounded-2xl group transition-all">
          <div className="flex items-center gap-4">
            <Mail size={20} className="text-ton-blue group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Technical Support</h4>
              <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5 tracking-tight">Response within 24 hours</p>
            </div>
          </div>
          <ExternalLink size={14} className="text-slate-700" />
        </a>
        <Link to="/about" className="flex items-center justify-between p-5 bg-[#1e222b] border border-white/5 rounded-2xl group transition-all">
          <div className="flex items-center gap-4">
            <Info size={20} className="text-amber-500 group-hover:scale-110 transition-transform" />
            <div>
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Platform Info</h4>
              <p className="text-[9px] text-slate-600 font-bold uppercase mt-0.5 tracking-tight">Fair Play & Rules</p>
            </div>
          </div>
          <ExternalLink size={14} className="text-slate-700" />
        </Link>
      </div>

      <p className="mt-8 text-center text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] italic">
        Powered by TON Blockchain
      </p>
    </div>
  );
}
