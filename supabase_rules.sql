/* 
  SUPABASE SECURITY RULES (RLS POLICIES)
  
  CRITICAL: 
  1. Your frontend MUST use the ANON_KEY (VITE_SUPABASE_ANON_KEY).
  2. Your backend MUST use the SERVICE_ROLE_KEY (SUPABASE_SERVICE_ROLE_KEY).
  3. These rules block users from updating their own 'balance' or 'status' fields.
  4. ALL game outcomes are calculated on the server to prevent cheating.
*/

-- Disable all writes by default
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_box_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES: View own only. 
CREATE POLICY "Profiles are viewable by owner" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Allow users to update their own profile (with column protection trigger below)
CREATE POLICY "Profiles are updatable by owner" 
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- PROTECTION TRIGGER (Critical: Prevents balance tampering)
CREATE OR REPLACE FUNCTION public.protect_profile_sensitive_fields()
RETURNS trigger AS $$
BEGIN
  IF auth.role() = 'authenticated' THEN
    NEW.balance := OLD.balance;
    NEW.referral_count := OLD.referral_count;
    NEW.total_earned_referral := OLD.total_earned_referral;
    NEW.created_at := OLD.created_at;
    NEW.id := OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_profile_update_protect ON profiles;
CREATE TRIGGER on_profile_update_protect
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_sensitive_fields();

-- 2. TICKETS: View own, insert own.
CREATE POLICY "Tickets viewable by owner" 
ON tickets FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Tickets insertable by owner" 
ON tickets FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. ROOMS: Public read.
CREATE POLICY "Rooms are public" 
ON lottery_rooms FOR SELECT 
USING (true);

-- 4. LOGS: View own history.
CREATE POLICY "Logs viewable by owner" 
ON mystery_box_logs FOR SELECT 
USING (auth.uid() = user_id);

-- 5. WITHDRAWALS: Secure flow.
CREATE POLICY "Withdrawals viewable by owner" 
ON withdrawals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Withdrawals requestable by owner" 
ON withdrawals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- NOTE: The Service Role Key bypasses all these policies. 
-- The server uses it to update balances safely.
