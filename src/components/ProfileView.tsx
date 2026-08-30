import React from 'react';
import { 
  User, 
  ShieldCheck, 
  Lock, 
  Key, 
  Award, 
  Download, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Server, 
  RefreshCw,
  Zap,
  Users
} from 'lucide-react';
import { UserProfile } from '../types';
import { getUserSecurityMetrics, exportUserData, getUserAnalyses } from '../services/storage';

interface ProfileViewProps {
  user: UserProfile;
  onSignOut: () => void;
  onSwitchAccount: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ user, onSignOut, onSwitchAccount }) => {
  const metrics = getUserSecurityMetrics(user.uid);
  const analyses = getUserAnalyses(user.uid);

  const completedActionsCount = analyses.reduce(
    (acc, a) => acc + a.defensiveActions.filter((act) => act.completed).length,
    0
  );

  const handleExportAllData = () => {
    const dataStr = exportUserData(user.uid);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisAI-UserSnapshot-${user.uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="cyber-user-profile" className="max-w-5xl mx-auto px-4 py-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#1f2937] gap-3">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
              alt={user.displayName}
              className="w-14 h-14 rounded-xl bg-[#111827] border border-[#1f2937] object-cover shadow-lg"
              referrerPolicy="no-referrer"
            />
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500 border-2 border-[#050608]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white tracking-wide">
                {user.displayName}
              </h2>
              <span className="px-2 py-0.5 rounded bg-[#111827] text-[#00f2fe] border border-[#1f2937] text-[10px] font-mono uppercase">
                {user.role || 'Security Analyst'}
              </span>
            </div>
            <p className="text-xs font-mono text-gray-400 mt-0.5">{user.email}</p>
            <p className="text-[10px] font-mono text-gray-500 mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Last login: {new Date(user.lastLoginAt).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSwitchAccount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] font-mono text-xs uppercase tracking-wider transition-all"
          >
            <Users className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>Switch</span>
          </button>
          <button
            onClick={onSignOut}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 font-mono text-xs uppercase tracking-wider transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Grid: Posture Score & Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Posture Score Widget */}
        <div className="p-6 rounded-xl bg-[#0a0c10] border border-[#1f2937] relative overflow-hidden flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Defensive Readiness</span>
            <ShieldCheck className="w-4 h-4 text-[#00f2fe]" />
          </div>

          <div className="my-5 text-center">
            <div className="text-4xl font-black text-white font-mono">
              {metrics.postureScore}%
            </div>
            <p className="text-[10px] font-mono text-green-400 mt-1 uppercase tracking-wider">
              {metrics.postureScore >= 80 ? 'High Readiness' : 'Moderate Readiness'}
            </p>
          </div>

          <div className="w-full bg-[#050608] rounded-full h-1.5 overflow-hidden border border-[#1f2937]">
            <div
              className="bg-gradient-to-r from-[#00f2fe] to-[#4facfe] h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.postureScore}%` }}
            ></div>
          </div>
        </div>

        {/* Security Metrics Overview */}
        <div className="p-6 rounded-xl bg-[#0a0c10] border border-[#1f2937] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Triage Telemetry</span>
            <Activity className="w-4 h-4 text-[#4facfe]" />
          </div>

          <div className="grid grid-cols-2 gap-3 my-4">
            <div className="p-3 rounded-lg bg-[#050608] border border-[#1f2937]">
              <span className="text-[9px] font-mono text-gray-500 uppercase">Total Scans</span>
              <p className="text-xl font-bold text-white mt-1 font-mono">{metrics.totalAnalyses}</p>
            </div>
            <div className="p-3 rounded-lg bg-[#050608] border border-[#1f2937]">
              <span className="text-[9px] font-mono text-gray-500 uppercase">High / Critical</span>
              <p className="text-xl font-bold text-red-400 mt-1 font-mono">{metrics.criticalThreatsBlocked}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-gray-400 border-t border-[#1f2937] pt-3">
            <span>Remediations Done:</span>
            <span className="text-green-400 font-bold">{completedActionsCount} tasks</span>
          </div>
        </div>

        {/* Account Security & Zero-Trust Isolation */}
        <div className="p-6 rounded-xl bg-[#0a0c10] border border-[#1f2937] flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Zero-Trust Isolation</span>
            <Lock className="w-4 h-4 text-green-400" />
          </div>

          <div className="space-y-2 my-3 text-xs font-mono">
            <div className="flex items-center justify-between text-gray-400">
              <span>Authentication:</span>
              <span className="text-[#00f2fe]">Google Auth / SSO</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Data Scope:</span>
              <span className="text-green-400">Strict UID Isolation</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>MFA Heuristics:</span>
              <span className="text-green-400">Enforced</span>
            </div>
          </div>

          <button
            onClick={handleExportAllData}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#050608] hover:bg-[#111827] border border-[#1f2937] text-gray-300 hover:text-[#00f2fe] font-mono text-xs uppercase tracking-wider transition-all"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>Export Encrypted Snapshot</span>
          </button>
        </div>
      </div>

      {/* Earned Cyber Defense Badges */}
      <div className="p-6 rounded-xl bg-[#0a0c10] border border-[#1f2937] shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#00f2fe]" />
          <span>Earned Defensive Credentials</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-sm">
              🛡️
            </div>
            <div>
              <p className="text-xs font-bold text-white">Phishing Sentinel</p>
              <p className="text-[10px] font-mono text-gray-500">Social Engineering Defense</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-sm">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold text-white">Log Analyst</p>
              <p className="text-[10px] font-mono text-gray-500">SIEM & Syslog Triager</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-sm">
              🌐
            </div>
            <div>
              <p className="text-xs font-bold text-white">URL Inspector</p>
              <p className="text-[10px] font-mono text-gray-500">Domain & Typosquat Hunter</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-sm">
              🔒
            </div>
            <div>
              <p className="text-xs font-bold text-white">Zero Trust Guard</p>
              <p className="text-[10px] font-mono text-gray-500">ABAC Policy Specialist</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
