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
      if (wallet?.account.address && !syncInProgress) {
        syncInProgress = true;
        try {
          const address = wallet.account.address.toLowerCase();
          const email = `${address}@tonbet.internal`;
          const password = `wallet_${address}`;

          // Check current session
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (isMounted && currentUser && currentUser.email === email) {
            syncInProgress = false;
            return;
          }

          // Force sign in
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
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

            await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  wallet_address: wallet.account.address,
                  username: `User_${address.slice(-4)}`,
                  referred_by: referrerId
                }
              }
            });
          }
        } catch (e) {
          console.error('Sync error:', e);
        } finally {
          syncInProgress = false;
        }
      }
    }

    sync();
    const interval = setInterval(sync, 5000); // Heartbeat sync
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
