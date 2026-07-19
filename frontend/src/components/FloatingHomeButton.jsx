import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function FloatingHomeButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Do not show the home button if the user is already on the homepage
  if (location.pathname === '/') return null;

  return (
    <button
      onClick={() => navigate('/')}
      className="fixed bottom-6 left-6 z-[99] bg-brand hover:bg-brand-dark text-white rounded-full p-3.5 shadow-2xl border border-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group select-none cursor-pointer"
      title="Go to Home"
    >
      <Home className="w-5 h-5" />
      <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 ease-out text-xs font-black uppercase tracking-wider whitespace-nowrap block">
        Home
      </span>
    </button>
  );
}
