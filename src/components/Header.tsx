import React from 'react';
import { Shield, Radio, Terminal, LogOut, User, Activity, AlertTriangle, Sparkles, Lock } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile | null;
  activeTab: 'chat' | 'analysis' | 'history' | 'profile';
  setActiveTab: (tab: 'chat' | 'analysis' | 'history' | 'profile') => void;
  onOpenRadar: () => void;
  onSignOut: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenRadar,
  onSignOut,
  onOpenAuth,
}) => {
  return (
    <header id="main-cyber-header" className="sticky top-0 z-40 border-b border-[#1f2937] bg-[#0a0c10] backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => user ? setActiveTab('analysis') : undefined}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#00f2fe] to-[#4facfe] rounded-lg shadow-[0_0_15px_rgba(0,242,254,0.4)] flex items-center justify-center flex-shrink-0">
              <span className="text-black font-black text-xs font-mono">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tighter text-white uppercase font-sans">
                  Aegis<span className="text-[#00f2fe]">.AI</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-mono uppercase rounded bg-[#111827] text-[#00f2fe] border border-[#1f2937] tracking-wider">
                  v3.7 Core
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links for Authenticated Users */}
          {user && (
            <nav className="hidden md:flex items-center gap-1.5 bg-[#050608] p-1 rounded-xl border border-[#1f2937]">
              <button
                id="nav-tab-analysis"
                onClick={() => setActiveTab('analysis')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                  activeTab === 'analysis'
                    ? 'text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/20 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Security Analysis</span>
              </button>

              <button
                id="nav-tab-chat"
                onClick={() => setActiveTab('chat')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                  activeTab === 'chat'
                    ? 'text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/20 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Gemini</span>
              </button>

              <button
                id="nav-tab-history"
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                  activeTab === 'history'
                    ? 'text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/20 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>History</span>
              </button>

              <button
                id="nav-tab-profile"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider transition-all ${
                  activeTab === 'profile'
                    ? 'text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/20 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-[#111827]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>
            </nav>
          )}

          {/* Right Section: Threat Radar & User Account */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Core Engine Active Pill */}
            <div className="hidden lg:flex items-center gap-2 bg-[#111827] px-3 py-1.5 rounded-full border border-[#1f2937]">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                Core Engine Active
              </span>
            </div>

            {/* Live Threat Radar Button */}
            <button
              id="header-threat-radar-btn"
              onClick={onOpenRadar}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-[#00f2fe] text-xs font-mono transition-all"
              title="Open Global Threat Radar"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-[#00f2fe]" />
              <span className="hidden sm:inline text-[11px] font-bold uppercase tracking-wider">Radar</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 border-l border-[#1f2937] pl-3 sm:pl-4">
                <div 
                  onClick={() => setActiveTab('profile')}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-7 h-7 rounded bg-[#1f2937] border border-[#1f2937] group-hover:border-[#00f2fe]/60 object-cover transition-colors"
                    referrerPolicy="no-referrer"
                  />
                  <div className="hidden xl:block text-left">
                    <p className="text-xs font-medium text-gray-300 group-hover:text-white leading-tight truncate max-w-[120px]">
                      {user.displayName}
                    </p>
                    <p className="text-[10px] font-mono text-[#00f2fe]">
                      {user.securityScore}% Score
                    </p>
                  </div>
                </div>

                <button
                  id="header-signout-btn"
                  onClick={onSignOut}
                  className="px-3 py-1.5 bg-[#1f2937] hover:bg-[#374151] text-gray-300 hover:text-white rounded text-[11px] font-semibold uppercase tracking-wider border border-transparent transition-all"
                  title="Logout Session"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="header-signin-btn"
                onClick={onOpenAuth}
                className="px-4 py-1.5 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(0,242,244,0.3)] hover:scale-105 active:scale-95 transition-all"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        {user && (
          <div className="md:hidden flex items-center justify-around py-2 border-t border-[#1f2937] bg-[#0a0c10]">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wider ${
                activeTab === 'analysis' ? 'text-[#00f2fe]' : 'text-gray-400'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Analyze</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wider ${
                activeTab === 'chat' ? 'text-[#00f2fe]' : 'text-gray-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wider ${
                activeTab === 'history' ? 'text-[#00f2fe]' : 'text-gray-400'
              }`}
            >
              <Terminal className="w-4 h-4" />
              <span>History</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 py-1 px-2 text-[10px] uppercase font-bold tracking-wider ${
                activeTab === 'profile' ? 'text-[#00f2fe]' : 'text-gray-400'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
