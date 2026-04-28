import { motion } from 'motion/react';
import { 
  Youtube, 
  Send, 
  Instagram, 
  Facebook, 
  MessageCircle, 
  Video,
  MapPin,
  Building2,
  Globe,
  Twitter
} from 'lucide-react';
import { cn } from '../lib/utils';

const SOCIAL_LINKS = [
  { icon: Youtube, label: 'YouTube', url: 'https://www.youtube.com/@XTonBet', color: 'hover:text-red-500' },
  { icon: Send, label: 'Telegram', url: 'https://t.me/XTon1Bet', color: 'hover:text-sky-500' },
  { icon: Twitter, label: 'X (Twitter)', url: 'https://x.com/XTonBet', color: 'hover:text-white' },
  { icon: Instagram, label: 'Instagram', url: 'https://www.instagram.com/xtonbet?igsh=MWFsODd2N3Iwa240dA==', color: 'hover:text-pink-500' },
  { icon: Facebook, label: 'Facebook', url: 'https://www.facebook.com/share/1Dwui6vWTp/', color: 'hover:text-blue-600' },
  { icon: MessageCircle, label: 'WhatsApp', url: 'https://whatsapp.com/channel/0029VbCU6G42v1ImrlDyOd2F', color: 'hover:text-green-500' },
  { icon: Video, label: 'TikTok', url: 'https://www.tiktok.com/@ton.bet?_r=1&_t=ZS-95uukG9YCzS', color: 'hover:text-cyan-400' },
];

export default function About() {
  return (
    <div className="px-6 pt-8 pb-32 max-w-md mx-auto min-h-screen">
      <header className="mb-8 text-center">
        <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-ton-blue to-cyan-400 rounded-3xl flex items-center justify-center shadow-2xl shadow-ton-blue/20 mb-4 border border-white/20">
          <Building2 size={40} className="text-white" />
        </div>
        <h1 className="text-3xl font-black tracking-tight">About <span className="text-ton-blue">TonBet</span></h1>
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mt-2">Innovation Meets Entertainment</p>
      </header>

      <div className="space-y-6">
        {/* Company Vision */}
        <section className="bg-white/5 border border-white/10 rounded-[32px] p-6">
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <Globe size={20} className="text-ton-blue" />
            Our Mission
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Founded and headquartered in the heart of the world's most innovative tech hub—<span className="text-white font-bold">Dubai, UAE</span>—TonBet is a premier digital entertainment platform leveraging the power of TON Blockchain.
          </p>
          <div className="mt-4 flex items-start gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
            <MapPin size={18} className="text-ton-blue mt-0.5 shrink-0" />
            <div className="text-[11px] text-slate-400 leading-tight">
              <strong className="text-slate-200 block mb-0.5">Headquarters</strong>
              Burj Khalifa District, Downtown Dubai,<br />
              United Arab Emirates
            </div>
          </div>
        </section>

        {/* Imagination Section */}
        <section className="bg-gradient-to-br from-[#1e222b] to-[#14161c] border border-white/10 rounded-[32px] p-6 shadow-xl">
          <h2 className="text-sm font-black text-ton-blue uppercase tracking-widest mb-4">Why TonBet?</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-ton-blue/10 flex items-center justify-center shrink-0 border border-ton-blue/20">
                <span className="text-ton-blue font-black">01</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Pure Authenticity.</strong> Unlike traditional platforms, our outcomes are verifiable through algorithmic transparency.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0 border border-cyan-500/20">
                <span className="text-cyan-400 font-black">02</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Seamless Integration.</strong> Deeply rooted in the TON ecosystem for instant withdrawals and zero-friction play.
              </p>
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 text-center">Join Our Community</h3>
          <div className="grid grid-cols-4 gap-3">
            {SOCIAL_LINKS.map((social) => (
              <a 
                key={social.label}
                href={social.url}
                target="_blank"
                rel="no-referrer"
                className={cn(
                  "flex flex-col items-center justify-center p-3 bg-white/5 border border-white/5 rounded-2xl transition-all active:scale-95 group",
                  social.color
                )}
              >
                <social.icon size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-[8px] font-black uppercase mt-2 text-slate-500 group-hover:text-inherit tracking-tighter">
                  {social.label}
                </span>
              </a>
            ))}
          </div>
        </section>

        <p className="text-[10px] text-center text-slate-600 mt-8">
          &copy; 2026 TonBet Dubai. All rights reserved.<br />
          Regulated in UAE Tech District.
        </p>
      </div>
    </div>
  );
}
