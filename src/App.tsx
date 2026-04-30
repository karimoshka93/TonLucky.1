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
        // Ensure TG WebApp is marked as ready
        if ((window as any).Telegram?.WebApp) {
          (window as any).Telegram.WebApp.ready();
          (window as any).Telegram.WebApp.expand();
        }

        const initData = (window as any).Telegram?.WebApp?.initData;
        const walletAddress = wallet?.account.address;
        
        if (!initData && !walletAddress) {
          syncInProgress = false;
          return;
        }

        // 1. Get current session
        const { data: { user: currentUser } } = await supabase.auth.getUser();

        // 2. Perform Secure Sync if Telegram is present
        if (initData) {
          try {
            const syncRes = await fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ initData })
            });

            if (!syncRes.ok) throw new Error("Sync failed");
            const credentials = await syncRes.json();

            // If not logged in as this user, sign in
            if (!currentUser || currentUser.email !== credentials.email) {
              await supabase.auth.signInWithPassword({ 
                email: credentials.email, 
                password: credentials.password 
              });
            }

            // Sync wallet if needed
            if (walletAddress) {
              await supabase.from('profiles').update({ wallet_address: walletAddress }).eq('tg_id', credentials.user.tg_id);
            }

            syncInProgress = false;
            return;
          } catch (err) {
            console.error("Secure Sync Failed:", err);
          }
        }

        // 3. Fallback for Wallet-only users (Insecure, but manageable for pure web)
        if (walletAddress && !initData) {
          const identityId = `wallet_${walletAddress.toLowerCase()}`;
          const email = `${identityId}@tonbet.internal`;
          const password = `secret_${identityId}`;

          if (isMounted && currentUser && currentUser.email === email) {
            syncInProgress = false;
            return;
          }

          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
             await supabase.auth.signUp({ email, password, options: { data: { wallet_address: walletAddress } } });
             await supabase.auth.signInWithPassword({ email, password });
          }
        }
      } catch (e) {
        console.error('Master Sync Error:', e);
      } finally {
        syncInProgress = false;
      }
    }

    sync(); 
    const interval = setInterval(sync, 4000); // More frequent checks initially
    return () => { isMounted = false; clearInterval(interval); };
  }, [wallet, (window as any).Telegram?.WebApp?.initDataUnsafe]);

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
