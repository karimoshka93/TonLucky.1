import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Lottery from './pages/Lottery';
import MysteryBoxes from './pages/MysteryBoxes';
import Predictions from './pages/Predictions';
import Tasks from './pages/Tasks';
import Admin from './pages/Admin';
import Referral from './pages/Referral';

const manifestUrl = import.meta.env.VITE_TON_MANIFEST_URL || 'https://tonbet.app/tonconnect-manifest.json';

export default function App() {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <Router>
        <div className="min-h-screen bg-[#0f1115] text-white font-sans selection:bg-ton-blue/30 overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/lottery" element={<Lottery />} />
            <Route path="/boxes" element={<MysteryBoxes />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/referral" element={<Referral />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
          <Navbar />
        </div>
      </Router>
    </TonConnectUIProvider>
  );
}
