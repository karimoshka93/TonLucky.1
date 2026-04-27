import { useState } from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Clock, ExternalLink } from 'lucide-react';

type Withdrawal = {
  id: string;
  user: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  date: string;
  address: string;
};

const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: '1', user: 'User_442', amount: 15.5, status: 'pending', date: '10m ago', address: 'EQD...33f' },
  { id: '2', user: 'Lucky_99', amount: 50.0, status: 'pending', date: '1h ago', address: 'EQA...11a' },
  { id: '3', user: 'TonMaster', amount: 5.2, status: 'completed', date: '4h ago', address: 'EQB...99x' },
];

export default function Admin() {
  const [requests, setRequests] = useState(MOCK_WITHDRAWALS);

  const updateStatus = (id: string, status: 'completed' | 'rejected') => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  return (
    <div className="px-5 pt-8 pb-24 max-w-md mx-auto">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Admin Panel
          </h1>
          <p className="text-xs text-neutral-400">Withdrawal management</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-900 border border-white/5 p-4 rounded-3xl">
          <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Total Paid</span>
          <span className="text-xl font-black">1,244 TON</span>
        </div>
        <div className="bg-neutral-900 border border-white/5 p-4 rounded-3xl">
          <span className="text-[10px] text-neutral-500 font-bold uppercase block mb-1">Pending</span>
          <span className="text-xl font-black text-red-500">65.5 TON</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-black text-neutral-500 uppercase tracking-widest px-2 mb-4">Pending Requests</h2>
        {requests.filter(r => r.status === 'pending').map((req) => (
          <div key={req.id} className="bg-neutral-900 border border-white/5 rounded-3xl p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-lg font-black text-blue-500">{req.amount} TON</span>
                <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
                  <Clock size={12} />
                  <span>{req.date}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold block">{req.user}</span>
                <span className="text-[10px] font-mono text-neutral-600">{req.address}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => updateStatus(req.id, 'rejected')}
                className="flex items-center justify-center gap-2 bg-red-500/10 text-red-500 py-3 rounded-2xl font-bold text-sm hover:bg-red-500/20 transition-colors"
              >
                <XCircle size={16} /> Reject
              </button>
              <button 
                onClick={() => updateStatus(req.id, 'completed')}
                className="flex items-center justify-center gap-2 bg-green-500/10 text-green-500 py-3 rounded-2xl font-bold text-sm hover:bg-green-500/20 transition-colors"
              >
                <CheckCircle2 size={16} /> Mark Paid
              </button>
            </div>
          </div>
        ))}

        {requests.filter(r => r.status === 'pending').length === 0 && (
          <div className="text-center py-12 text-neutral-600">
            <CheckCircle2 size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-sm font-medium">All clear! No pending requests.</p>
          </div>
        )}
      </div>
    </div>
  );
}
