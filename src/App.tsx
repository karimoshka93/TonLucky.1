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
        
        if (!tgUser && !walletAddress) {
          syncInProgress = false;
          return;
        }

        // Stability: Ensure identity is locked to TG first
        const identityId = tgUser?.id ? `tg_${tgUser.id}` : `wallet_${walletAddress?.toLowerCase()}`;
        const email = `${identityId}@tonbet.internal`;
        const password = `secret_${identityId}`;
        const username = tgUser?.username || tgUser?.first_name || (walletAddress ? `TonPlayer_${walletAddress.slice(-8)}` : 'Guest');

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        // If already logged in as the correct user
        if (isMounted && currentUser && currentUser.email === email) {
          // Check if profile needs wallet update
          if (walletAddress) {
            await supabase.from('profiles').update({ wallet_address: walletAddress }).eq('id', currentUser.id);
          }
          syncInProgress = false;
          return;
        }

        // Try sign in first (fastest)
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
          // If sign in fails, it might be a new user
          const urlParams = new URLSearchParams(window.location.search);
          const referrerAddress = urlParams.get('ref') || urlParams.get('tgWebAppStartParam');
          let referrerId = null;

          if (referrerAddress) {
            const { data: refProfile } = await supabase.from('profiles').select('id').eq('wallet_address', referrerAddress).single();
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
        console.error('Critical sync failure:', e);
      } finally {
        syncInProgress = false;
      }
    }

    sync(); // Run immediately on mount
    const interval = setInterval(sync, 5000); 
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
