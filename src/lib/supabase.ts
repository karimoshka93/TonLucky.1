import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. App will run in demo mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Room = {
  id: string;
  tier: number;
  participants_count: number;
  max_participants: number;
  prize_pool: number;
  status: 'open' | 'drawing' | 'completed';
  created_at: string;
};

export type MysteryBoxResult = {
  id: string;
  user_id: string;
  reward_type: '1_TON' | '0_5_TON' | '2_TON' | '10_TON' | 'LOSE';
  amount: number;
  created_at: string;
};

export type Prediction = {
  id: string;
  match_id: string;
  user_id: string;
  amount: number;
  outcome: 'home' | 'draw' | 'away';
  odds: number;
  status: 'pending' | 'won' | 'lost';
};
