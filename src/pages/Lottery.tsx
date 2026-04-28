import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Users, Info, Ticket } from 'lucide-react';
import { LOTTERY_TIERS, formatTon, cn } from '../lib/utils';
import { WalletContainer } from '../components/Navbar';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { supabase } from '../lib/supabase';

export default function Lottery() {
  const [tonConnectUI] = useTonConnectUI();
  const [loading, setLoading] = useState<string | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);

  useEffect(() => {
    fetchRooms();
    const subscription = supabase
      .channel('rooms-update')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lottery_rooms' }, fetchRooms)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tickets' }, fetchRooms)
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const fetchRooms = async () => {
    // Fetch all active rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('lottery_rooms')
      .select('*')
      .eq('status', 'active')
      .order('entry_fee', { ascending: true });
    
    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return;
    }

    if (roomsData && roomsData.length > 0) {
      // For each room, fetch the ticket count
      const roomsWithCounts = await Promise.all(roomsData.map(async (room, idx) => {
        const { count, error: countError } = await supabase
          .from('tickets')
          .select('*', { count: 'exact', head: true })
          .eq('room_id', room.id);
        
        return {
          id: room.id,
          tier: idx + 1,
          name: room.name,
          participants_count: count || 0,
          max_tickets: room.max_tickets || [20, 10, 10][idx] || 10,
          prize_pool: room.prize_pool,
          status: room.status,
          entry_fee: room.entry_fee
        };
      }));

      setRooms(roomsWithCounts);
    } else {
      // Fallback
      setRooms(LOTTERY_TIERS.map((t, idx) => ({
        id: t.id,
        tier: idx + 1,
        name: t.cost === 5 ? 'Golden Tier' : t.cost === 1 ? 'Pro Tier' : 'Standard Tier',
        participants_count: 0,
        max_tickets: t.participants,
        prize_pool: t.prize,
        status: 'open',
        entry_fee: t.cost
      })));
    }
  };

  const buyTicket = async (roomId: string, cost: number) => {
    if (!tonConnectUI.connected) {
      alert('Please connect your wallet first');
      return;
    }

    setLoading(roomId);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Check balance and execute transaction
      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [{ 
          address: "UQCWOWCOQULzFdZttBaH3iUJyue51OEYvRhbCaitE4ktTxO4", 
          amount: (cost * 1000000000).toString() 
        }],
      };

      const txResult = await tonConnectUI.sendTransaction(transaction);
      
      // Save ticket purchase to DB
      const { data, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          room_id: roomId
        });
      
      if (!error) {
        alert('Success! Your ticket has been registered.');
        
        // Check if room is now full and trigger draw
        await checkAndTriggerDraw(roomId);
        
        fetchRooms();
      } else {
        throw error;
      }
    } catch (e) {
      console.error(e);
      alert('Transaction failed: User canceled or insufficient balance.');
    } finally {
      setLoading(null);
    }
  };

  const checkAndTriggerDraw = async (roomId: string) => {
    // Fetch room and ticket count
    const { data: room } = await supabase
      .from('lottery_rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    
    if (!room || room.status !== 'active') return;

    const { count, data: tickets } = await supabase
      .from('tickets')
      .select('*', { count: 'exact' })
      .eq('room_id', roomId);
    
    const max = room.max_tickets || 10;
    if (count !== null && count >= max && tickets) {
      console.log('Room full! Triggering draw for:', roomId);
      
      // Randomly pick a winner
      const winnerTicket = tickets[Math.floor(Math.random() * tickets.length)];
      
      // Update room status and winner
      await supabase
        .from('lottery_rooms')
        .update({ 
          status: 'completed', 
          winner_id: winnerTicket.user_id 
        })
        .eq('id', roomId);
      
      // Get winner details
      const { data: winnerProfile } = await supabase
        .from('profiles')
        .select('username, wallet_address')
        .eq('id', winnerTicket.user_id)
        .single();

      if (winnerProfile) {
        await supabase
          .from('transactions')
          .insert({
            user_id: winnerTicket.user_id,
            type: 'game_win',
            amount: room.prize_pool,
            description: `Won ${room.name} lottery!`
          });
          
        // Re-seed a new room
        await supabase
          .from('lottery_rooms')
          .insert({
            name: room.name,
            tier: room.tier,
            entry_fee: room.entry_fee,
            prize_pool: room.prize_pool,
            max_tickets: room.max_tickets,
            status: 'active'
          });
      }
    }
  };

  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto">
      <header className="mb-6 px-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-3 italic">
            <Trophy className="text-yellow-500" size={28} /> Lottery <span className="text-ton-blue">Rooms</span>
          </h1>
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Winning Rooms</p>
        </div>
        <button className="p-2 bg-[#161920] rounded-xl text-slate-500 border border-white/5">
          <Info size={18} />
        </button>
      </header>

      <div className="px-2 mb-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
         <h4 className="text-[10px] uppercase font-black text-blue-400 mb-2 flex items-center gap-2">
           <Ticket size={12} /> Terms & Conditions
         </h4>
         <ul className="text-[9px] text-slate-400 space-y-1 font-medium leading-relaxed">
           <li>• Players can buy multiple tickets in the same room to increase odds.</li>
           <li>• <span className="text-white">Rooms are only drawn once they are 100% full.</span></li>
           <li>• The draw process is handled by a transparent random mechanism.</li>
           <li>• Winners are instantly credited and announced in the Hall of Fame.</li>
           <li>• Platform fee of 5% is deducted from the total prize pool.</li>
         </ul>
      </div>

      <WalletContainer />

      <div className="px-2 mb-4 mt-8">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Rooms</p>
      </div>

      <div className="space-y-4">
        {rooms.map((room, idx) => {
          const progress = (room.participants_count / room.max_tickets) * 100;
          return (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={cn(
                "p-6 rounded-[32px] relative overflow-hidden border",
                room.tier === 'GOLDEN' ? "bg-gradient-to-br from-[#1e222b] to-[#14161c] border-white/10 shadow-xl" : "bg-[#161920] border-white/5"
              )}
            >
              {room.tier === 'GOLDEN' && (
                <div className="absolute top-4 right-4 bg-orange-500/20 text-orange-400 text-[8px] font-black px-2 py-1 rounded-md uppercase tracking-widest">High Stakes</div>
              )}
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-wider mb-1">
                      {room.name}
                    </p>
                    <h3 className="text-2xl font-black text-white italic">Win {room.prize_pool}.0 <span className="text-ton-blue">TON</span></h3>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-wider">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-white">{room.participants_count} / {room.max_tickets} Entries</span>
                  </div>
                  <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="bg-ton-blue h-full rounded-full shadow-[0_0_10px_#0098EA]" 
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                  <div className="flex -space-x-2">
                     {room.participants_count > 0 ? (
                       Array(Math.min(3, room.participants_count)).fill(0).map((_, i) => (
                         <div key={i} className="w-7 h-7 rounded-full border-2 border-[#161920] bg-slate-800 text-[8px] flex items-center justify-center font-bold">U{i+1}</div>
                       ))
                     ) : (
                       <span className="text-[10px] text-slate-600 italic font-black">Waiting for first player</span>
                     )}
                     {room.participants_count > 3 && (
                       <div className="w-7 h-7 rounded-full border-2 border-[#161920] bg-slate-900 border-dashed flex items-center justify-center text-[8px] font-bold text-slate-500">+{room.participants_count - 3}</div>
                     )}
                  </div>
                  <button 
                    disabled={loading === room.id}
                    onClick={() => buyTicket(room.id, room.tier === 1 ? 0.1 : room.tier === 2 ? 1 : 5)}
                    className="bg-white text-black font-black px-8 py-3 rounded-xl text-xs active:scale-95 hover:bg-ton-blue hover:text-white transition-all disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-white/5"
                  >
                    {loading === room.id ? 'PENDING...' : `BUY TICKET`}
                  </button>
                </div>
              </div>
              
              <Trophy size={140} className="absolute -bottom-8 -right-8 text-white/[0.02] -rotate-12" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
