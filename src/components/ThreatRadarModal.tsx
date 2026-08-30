import React from 'react';
import { X, Radio, Shield, Globe, Activity, AlertOctagon, Terminal } from 'lucide-react';

interface ThreatRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GLOBAL_THREAT_FEED = [
  { region: 'US-EAST (Virginia)', vector: 'Spear-Phishing Campaign (T1566)', level: 'HIGH', time: '1m ago' },
  { region: 'EU-WEST (Frankfurt)', vector: 'SSH Brute-Force Automated Botnet', level: 'MEDIUM', time: '3m ago' },
  { region: 'AP-EAST (Tokyo)', vector: 'Log4j JNDI Probe Blocked', level: 'CRITICAL', time: '5m ago' },
  { region: 'SA-EAST (São Paulo)', vector: 'SQLi Malicious Payload Sinkholed', level: 'LOW', time: '8m ago' },
];

export const ThreatRadarModal: React.FC<ThreatRadarModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl rounded-xl bg-[#0a0c10] border border-[#1f2937] p-6 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1f2937]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00f2fe]">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                Global Defense Radar // Telemetry
              </h3>
              <p className="text-[10px] font-mono text-[#00f2fe] uppercase tracking-wider">
                Active Heuristics & Real-Time Incident Stream
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#111827] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Radar & Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* 3D Animated Radar Sweep Display (5 cols) */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl bg-[#050608] border border-[#1f2937] relative overflow-hidden h-[280px]">
            {/* Concentric Radar Rings */}
            <div className="absolute w-56 h-56 rounded-full border border-[#00f2fe]/20"></div>
            <div className="absolute w-40 h-40 rounded-full border border-[#00f2fe]/30"></div>
            <div className="absolute w-24 h-24 rounded-full border border-[#00f2fe]/40"></div>
            <div className="absolute w-8 h-8 rounded-full bg-[#00f2fe]/20 border border-[#00f2fe]"></div>

            {/* Radar Crosshairs */}
            <div className="absolute w-full h-[1px] bg-[#00f2fe]/20"></div>
            <div className="absolute h-full w-[1px] bg-[#00f2fe]/20"></div>

            {/* Rotating Radar Beam */}
            <div className="absolute w-56 h-56 rounded-full animate-radar pointer-events-none">
              <div className="w-1/2 h-1/2 bg-gradient-to-br from-[#00f2fe]/30 to-transparent rounded-tl-full origin-bottom-right"></div>
            </div>

            {/* Simulated Radar Blips */}
            <span className="absolute top-16 left-20 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="absolute bottom-20 right-16 w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span className="absolute top-28 right-24 w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse"></span>

            <div className="absolute bottom-2 text-[9px] font-mono text-gray-500 tracking-wider">
              SWEEP FREQUENCY: 120 RPM
            </div>
          </div>

          {/* Real-time Global Triage Feed (7 cols) */}
          <div className="md:col-span-7 space-y-3">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00f2fe]" />
              <span>Intercepted Global Threats</span>
            </p>

            <div className="space-y-2">
              {GLOBAL_THREAT_FEED.map((feed, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#050608] border border-[#1f2937] flex items-center justify-between text-xs font-mono"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        feed.level === 'CRITICAL'
                          ? 'bg-red-500 animate-ping'
                          : feed.level === 'HIGH'
                          ? 'bg-yellow-500'
                          : 'bg-[#00f2fe]'
                      }`}
                    ></span>
                    <div>
                      <p className="text-gray-200 font-semibold">{feed.vector}</p>
                      <p className="text-[10px] text-gray-500">{feed.region}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        feed.level === 'CRITICAL'
                          ? 'bg-red-900/30 text-red-400 border-red-900/50'
                          : feed.level === 'HIGH'
                          ? 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50'
                          : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50'
                      }`}
                    >
                      {feed.level}
                    </span>
                    <p className="text-[9px] text-gray-600 mt-0.5">{feed.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[#050608] border border-[#1f2937] text-xs font-mono text-gray-400 flex items-center justify-between">
              <span>Active Perimeter Defense:</span>
              <span className="text-green-400 font-bold">100% OPERATIONAL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
