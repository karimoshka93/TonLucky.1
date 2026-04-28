import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Wallet, 
  History, 
  Ticket, 
  Gift, 
  Target,
  ArrowUpRight, 
  ArrowDownLeft, 
  ExternalLink,
  ChevronRight,
  Mail,
  ShieldCheck,
  AlertCircle,
  Info
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProfileData {
  id: string;
  username: string;
  balance: number;
  referral_code: string;
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
  
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    async function getInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch Profile
        const { data: pData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (pData) setProfile(pData);
        else {
          // If profile doesn't exist, it might be a new user from sync
          // We can try to wait a bit or create it if needed
          // But usually profiles are created by DB triggers
        }

        // Fetch Transactions
        const { data: tData } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (tData) setTransactions(tData);

        // Fetch Tickets (simplified join-like)
        const { data: ticketData } = await supabase
          .from('tickets')
          .select('*, lottery_rooms(room_name)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (ticketData) {
          setTickets(ticketData.map((t: any) => ({
            id: t.id,
            room_name: t.lottery_rooms?.room_name || 'Unknown Room',
            ticket_number: t.ticket_number,
            created_at: t.created_at
          })));
        }

        // Fetch Box Logs
        const { data: bData } = await supabase
          .from('mystery_box_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (bData) setBoxLogs(bData);
      }
      setLoading(false);
    }

    getInitialData();

    // Listen for auth state changes (crucial for wallet sync)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setLoading(true);
        getInitialData();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleWithdraw = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile || Number(withdrawAmount) > profile.balance) {
      setWithdrawStatus({ type: 'error', msg: 'Insufficient balance' });
      return;
    }

    try {
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id,
          amount: Number(withdrawAmount),
          wallet_address: walletAddress,
          status: 'pending'
        });

      if (error) throw error;

      setWithdrawStatus({ type: 'success', msg: 'Withdrawal request submitted!' });
      setWithdrawAmount('');
      setWalletAddress('');
      setTimeout(() => setShowWithdraw(false), 2000);
    } catch (err) {
      setWithdrawStatus({ type: 'error', msg: 'Failed to submit request' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-ton-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <AlertCircle size={48} className="text-yellow-500 mb-4" />
        <h2 className="text-2xl font-black mb-2">Login Required</h2>
        <p className="text-slate-400 mb-6">Please connect your wallet to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto min-h-screen">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-[#1e222b] to-[#14161c] border border-white/10 rounded-[32px] p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-ton-blue/20 flex items-center justify-center text-ton-blue border border-ton-blue/30 shadow-lg shadow-ton-blue/10">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-xl font-black">
              {profile?.username || 'Player'}
            </h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              ID: {user.id.slice(0, 8)}...
            </p>
          </div>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-wider">Available Balance</span>
            <Wallet size={12} className="text-ton-blue" />
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-white">{profile?.balance.toFixed(2)}</span>
            <span className="text-sm font-bold text-slate-500 mb-1">TON</span>
          </div>
          
          <button 
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="w-full mt-4 bg-ton-blue/20 text-ton-blue border border-ton-blue/30 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-ton-blue hover:text-white transition-all flex items-center justify-center gap-2"
          >
            Withdraw <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Withdraw Form */}
      <AnimatePresence>
        {showWithdraw && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-6"
          >
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
              <h3 className="text-sm font-black text-amber-500 uppercase tracking-wider mb-4">Request Withdrawal</h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase block mb-1.5 ml-1">Wallet Address</label>
                  <input 
                    type="text"
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter TON address"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-black uppercase block mb-1.5 ml-1">Amount (TON)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min 5.0 TON"
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>
                {withdrawStatus && (
                  <p className={cn(
                    "text-[10px] font-bold text-center uppercase tracking-widest p-2 rounded-lg",
                    withdrawStatus.type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                  )}>
                    {withdrawStatus.msg}
                  </p>
                )}
                <button className="w-full bg-amber-500 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest active:scale-[0.98] transition-transform">
                  Submit Request
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-2xl mb-4 border border-white/5">
        <button 
          onClick={() => setActiveTab('transactions')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'transactions' ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <History size={14} /> Transactions
        </button>
        <button 
          onClick={() => setActiveTab('games')}
          className={cn(
            "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2",
            activeTab === 'games' ? "bg-white text-black shadow-lg" : "text-slate-400 hover:text-white"
          )}
        >
          <Target size={14} /> Game History
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-3">
        {activeTab === 'transactions' ? (
          transactions.length > 0 ? (
            transactions.map((tx) => (
              <div key={tx.id} className="p-4 bg-[#1e222b]/50 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    tx.amount > 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                  )}>
                    {tx.amount > 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white capitalize">{tx.type.replace('_', ' ')}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={cn(
                  "text-sm font-black",
                  tx.amount > 0 ? "text-green-500" : "text-red-500"
                )}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 italic text-[11px]">No transactions yet</div>
          )
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 bg-[#1e222b]/50 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-ton-blue/10 text-ton-blue flex items-center justify-center">
                    <Ticket size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{ticket.room_name}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">Ticket #{ticket.ticket_number}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400">{new Date(ticket.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {boxLogs.map((log) => (
              <div key={log.id} className="p-4 bg-[#1e222b]/50 border border-white/5 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Gift size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Mystery Box Roll</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{log.reward_type}</p>
                  </div>
                </div>
                <span className="text-xs font-black text-purple-400">
                  {log.reward_amount > 0 ? `+${log.reward_amount} TON` : 'Try Again'}
                </span>
              </div>
            ))}
            {tickets.length === 0 && boxLogs.length === 0 && (
              <div className="text-center py-10 text-slate-500 italic text-[11px]">No game history yet</div>
            )}
          </div>
        )}
      </div>

      {/* Support Section */}
      <div className="mt-12 pt-8 border-t border-white/5">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Support & Security</h3>
        <div className="space-y-2">
          <a 
            href="mailto:xtonbet@gmail.com"
            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Mail size={18} className="text-ton-blue" />
              <span className="text-xs font-bold">Contact Support</span>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-white" />
          </a>
          <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-green-500" />
              <div className="text-xs font-bold">Fair Play Secured</div>
            </div>
            <div className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-500 text-[8px] font-black uppercase">Verified</div>
          </div>
          <Link 
            to="/about"
            className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-3">
              <Info size={18} className="text-amber-500" />
              <span className="text-xs font-bold">About TonBet</span>
            </div>
            <ExternalLink size={14} className="text-slate-600 group-hover:text-white" />
          </Link>
        </div>
        <p className="text-[9px] text-center text-slate-600 mt-6 font-medium">
          Official Support: <span className="text-ton-blue">xtonbet@gmail.com</span>
        </p>
      </div>
    </div>
  );
}
