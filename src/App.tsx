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

    async function sync() {
      if (wallet?.account.address) {
        try {
          // Normalize address to ensure consistency
          const address = wallet.account.address.toLowerCase();
          const email = `${address}@tonbet.internal`;
          const password = `wallet_${address}`; // Use normalized address for password to avoid mismatch

          console.log('Syncing wallet:', address);

          // Check current session
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (isMounted && currentUser && currentUser.email === email) {
            console.log('Already synced with Supabase');
            return;
          }

          // Try sign in
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            console.log('SignIn failed, attempting SignUp...', signInError.message);
            
            const urlParams = new URLSearchParams(window.location.search);
            const referrerAddress = urlParams.get('ref') || urlParams.get('tgWebAppStartParam');
            let referrerId = null;

            if (referrerAddress) {
              try {
                const { data: refProfile } = await supabase
                  .from('profiles')
                  .select('id')
                  .eq('wallet_address', referrerAddress)
                  .single();
                if (refProfile) referrerId = refProfile.id;
              } catch (e) {
                console.warn('Referrer lookup failed');
              }
            }

            // Try sign up
            const { error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: {
                data: {
                  wallet_address: wallet.account.address, // Store raw
                  username: `User_${address.slice(-4)}`,
                  referred_by: referrerId
                }
              }
            });
            
            if (signUpError && signUpError.message.includes('already registered')) {
               // Rare race condition, retry sign in once more
               await supabase.auth.signInWithPassword({ email, password });
            }
          }
        } catch (globalError) {
          console.error('Global Sync Error:', globalError);
        }
      }
    }

    sync();
    return () => { isMounted = false; };
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
