/* 
  FULL SUPABASE DATABASE SCHEMA
  
  This script creates all necessary tables for:
  - User Profiles (Balances, Referrals)
  - Lottery Rooms & Tickets
  - Mystery Box Logs
  - Withdrawals & Deposits
  - Referral System
*/

-- 1. PROFILES (Users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  wallet_address TEXT,
  balance DECIMAL(20, 4) DEFAULT 0.0000,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES profiles(id),
  referral_count INTEGER DEFAULT 0,
  total_earned_referral DECIMAL(20, 4) DEFAULT 0.0000,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BITMAP / LOTTERY ROOMS
CREATE TABLE IF NOT EXISTS lottery_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_name TEXT NOT NULL,
  entry_fee DECIMAL(20, 4) NOT NULL,
  prize_pool DECIMAL(20, 4) DEFAULT 0.0000,
  max_participants INTEGER DEFAULT 20,
  winner_id UUID REFERENCES profiles(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  ends_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TICKETS
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  room_id UUID NOT NULL REFERENCES lottery_rooms(id),
  ticket_number SERIAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MYSTERY BOX LOGS
CREATE TABLE IF NOT EXISTS mystery_box_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  reward_type TEXT NOT NULL,
  reward_amount DECIMAL(20, 4) NOT NULL,
  cost DECIMAL(20, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. WITHDRAWALS
CREATE TABLE IF NOT EXISTS withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  amount DECIMAL(20, 4) NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TRANSACTIONS (History)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'game_win', 'game_loss', 'referral_bonus', 'task_reward')),
  amount DECIMAL(20, 4) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. USER TASKS (Tracking)
CREATE TABLE IF NOT EXISTS user_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id),
  task_id TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, task_id)
);

-- 8. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_box_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tasks ENABLE ROW LEVEL SECURITY;

-- 9. POLICIES (Client Side - Anon/Auth)
-- Profiles: View own only
CREATE POLICY "View own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Rooms: Anyone can view
CREATE POLICY "Anyone can view rooms" ON lottery_rooms FOR SELECT USING (true);

-- Tickets: View own
CREATE POLICY "View own tickets" ON tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own ticket" ON tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Logs: View own
CREATE POLICY "View own box logs" ON mystery_box_logs FOR SELECT USING (auth.uid() = user_id);

-- Withdrawals: View/Insert own
CREATE POLICY "View own withdrawals" ON withdrawals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert own withdrawal" ON withdrawals FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions: View own
CREATE POLICY "View own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);

-- Tasks: View own
CREATE POLICY "View own completed tasks" ON user_tasks FOR SELECT USING (auth.uid() = user_id);

-- REFERRAL BONUS POLICY
-- Note: Balances and referral counts are handled by the server (Service Role). 
-- Users cannot update their own profiles directly to prevent cheating.

-- 10. FUNCTIONS & TRIGGERS (Auto Profile Creation)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, wallet_address, referral_code, referred_by)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'wallet_address',
    encode(gen_random_bytes(6), 'hex'),
    (new.raw_user_meta_data->>'referred_by')::uuid
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

/*
  HOW TO APPLY:
  1. Open Supabase Dashboard -> SQL Editor.
  2. Paste this entire script and RUN.
  3. Then run the rules script to finalize RLS.
*/
