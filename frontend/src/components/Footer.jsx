import React from 'react';
import { HelpCircle, ShieldCheck, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#31353D] text-[#A6ABB6] text-xs mt-20 border-t border-gray-800">
      
      {/* Top Banner Row */}
      <div className="bg-[#2E3139] py-4 text-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase text-xs tracking-wider border border-white/20 px-2 py-0.5 rounded">List your show</span>
            <span className="text-xs text-gray-300">Got an event, comedy show, concert, or play? List it with BookMyShow AI Discovery today!</span>
          </div>
          <button className="bg-brand text-white font-bold text-xs px-4 py-2 rounded shadow-md hover:bg-brand-dark transition-all">
            Contact Us
          </button>
        </div>
      </div>

      {/* Support Info Widgets */}
      <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-b border-gray-700/50">
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <HelpCircle className="w-8 h-8 text-brand" />
          <h6 className="font-bold text-sm text-white">24/7 Customer Care</h6>
          <p className="text-[11px] text-gray-400">Need help? Connect with our chat coordinators anytime.</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <ShieldCheck className="w-8 h-8 text-brand" />
          <h6 className="font-bold text-sm text-white">Secure Transactions</h6>
          <p className="text-[11px] text-gray-400">Your mock payments are encrypted and completely safe.</p>
        </div>
        <div className="flex flex-col items-center gap-2 text-gray-300">
          <Mail className="w-8 h-8 text-brand" />
          <h6 className="font-bold text-sm text-white">Subscribe Newsletter</h6>
          <p className="text-[11px] text-gray-400">Get top weekly AI discovery recommendations sent to your inbox.</p>
        </div>
      </div>

      {/* Corporate Copy Block */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col items-center text-center gap-4 bg-[#31353D]">
        <div className="flex items-center gap-1 bg-[#1F2125]/45 px-3 py-1.5 rounded-lg border border-gray-800">
          <span className="font-extrabold text-base tracking-tight text-white font-sans">
            book<span className="text-brand font-black">my</span>show
          </span>
          <span className="bg-brand/10 border border-brand/20 text-brand text-[8px] font-black uppercase px-1 py-0.25 rounded tracking-wider ml-1">
            AI
          </span>
        </div>
        
        <p className="max-w-2xl text-[10px] text-gray-500 leading-relaxed">
          BookMyShow AI Discovery is a high-fidelity capstone project prototype. All show titles, venue coordinates, media imagery, ticket payments, and bookings listed throughout are intended solely for simulation and AI demonstration purposes.
        </p>

        <p className="text-[11px] text-gray-400 pt-2">
          &copy; {new Date().getFullYear()} BookMyShow AI Discovery. Made with passion by Antigravity.
        </p>
      </div>

    </footer>
  );
}
