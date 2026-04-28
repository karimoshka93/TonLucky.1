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
    async function sync() {
      if (wallet?.account.address) {
        const address = wallet.account.address;
        const email = `${address.toLowerCase()}@tonbet.internal`;
        const password = `wallet_${address}`;

        // Check for referrer in URL
        const urlParams = new URLSearchParams(window.location.search);
        const referrer = urlParams.get('ref') || urlParams.get('tgWebAppStartParam');

        // Check if user is already logged in with this wallet
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email === email) return;

        // Try sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          // If sign in fails, try sign up
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                wallet_address: address,
                username: `User_${address.slice(-4)}`,
                referred_by: referrer
              }
            }
          });
          
          if (signUpError) {
            console.error('Supabase Auth Sync Error:', signUpError.message);
          }
        }
      }
    }

    sync();
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
