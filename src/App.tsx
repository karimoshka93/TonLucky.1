import { TonConnectUIProvider, useTonWallet } from '@tonconnect/ui-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Lottery from './pages/Lottery';
import MysteryBoxes from './pages/MysteryBoxes';
import Predictions from './pages/Predictions';
import Tasks from './pages/Tasks';
import Admin from './pages/Admin';
import Referral from './pages/Referral';
import Profile from './pages/Profile';
import About from './pages/About';
import Winners from './pages/Winners';
import { supabase } from './lib/supabase';

const manifestUrl = import.meta.env.VITE_TON_MANIFEST_URL || 'https://tonbet-sand.vercel.app/tonconnect-manifest.json';

function WalletAuthSync() {
  const wallet = useTonWallet();

  useEffect(() => {
    let isMounted = true;
    let syncInProgress = false;

    async function sync() {
      if (syncInProgress) return;
      syncInProgress = true;

      try {
        const tgUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
        const walletAddress = wallet?.account.address;
        
        // If no Telegram user and no wallet, we can't sync yet
        if (!tgUser && !walletAddress) {
          syncInProgress = false;
          return;
        }

        // Primary identity is Telegram ID if available, fallback to Wallet
        const identityId = tgUser?.id ? `tg_${tgUser.id}` : `wallet_${walletAddress?.toLowerCase()}`;
        const email = `${identityId}@tonbet.internal`;
        const password = `secret_${identityId}`;
        const username = tgUser?.username || tgUser?.first_name || `TonPlayer_${walletAddress?.slice(-8)}`;

        // 1. Check current session
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (isMounted && currentUser && currentUser.email === email) {
          // If we have a session but no wallet_address in profile yet, we should update it
          if (walletAddress) {
            await supabase.from('profiles').update({ wallet_address: walletAddress }).eq('id', currentUser.id);
          }
          syncInProgress = false;
          return;
        }

        // 2. Try sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // 3. Attempt SignUp
          const urlParams = new URLSearchParams(window.location.search);
          const referrerAddress = urlParams.get('ref') || urlParams.get('tgWebAppStartParam');
          let referrerId = null;

          if (referrerAddress) {
            const { data: refProfile } = await supabase
              .from('profiles')
              .select('id')
              .eq('wallet_address', referrerAddress)
              .single();
            if (refProfile) referrerId = refProfile.id;
          }

          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                wallet_address: walletAddress,
                username: username,
                referred_by: referrerId,
                tg_id: tgUser?.id
              }
            }
          });

          if (!signUpError || (signUpError && signUpError.message.includes('already registered'))) {
            await supabase.auth.signInWithPassword({ email, password });
          }
        }
      } catch (e) {
        console.error('Telegram sync error:', e);
      } finally {
        syncInProgress = false;
      }
    }

    sync();
    const interval = setInterval(sync, 10000); 
    return () => { isMounted = false; clearInterval(interval); };
  }, [wallet]);

  return null;
}

export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Router>
        <WalletAuthSync />
        <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-ton-blue/30 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/boxes" element={<MysteryBoxes />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/about" element={<About />} />
            <Route path="/winners" element={<Winners />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </TonConnectUIProvider>
  );
}
