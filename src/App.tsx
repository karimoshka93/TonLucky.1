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
        // Normalize address to ensure consistency
        const rawAddress = wallet.account.address;
        const address = rawAddress.toLowerCase();
        const email = `${address}@tonbet.internal`;
        const password = `wallet_${rawAddress}`; // Keep raw for password consistency if desired, or use normalized

        console.log('Syncing wallet:', address);

        // Check current session
        const { data: { user } } = await supabase.auth.getUser();
        if (isMounted && user && user.email === email) {
          console.log('Already synced with Supabase');
          return;
        }

        // Try sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          console.log('SignIn failed, attempting SignUp...', signInError.message);
          
          // Check for referrer
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

          // Try sign up
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                wallet_address: rawAddress,
                username: `User_${rawAddress.slice(-4)}`,
                referred_by: referrerId
              }
            }
          });
          
          if (signUpError) {
            console.error('Supabase Auth Sync (SignUp) Error:', signUpError.message);
            
            // If already registered but signIn failed, maybe password mismatch or lockout
            // Re-attempting signIn with normalized password just in case
            if (signUpError.message.includes('already registered')) {
               const { error: retryError } = await supabase.auth.signInWithPassword({
                 email,
                 password: `wallet_${address}`, 
               });
               if (retryError) console.error('Final retry failed:', retryError.message);
            }
          } else {
            console.log('SignUp success');
          }
        } else {
          console.log('SignIn success');
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
