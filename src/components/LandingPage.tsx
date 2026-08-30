import React from 'react';
import { Shield, Sparkles, AlertOctagon, Terminal, Lock, CheckCircle2, ArrowRight, Eye, Zap, Server, ShieldCheck, Database, Key } from 'lucide-react';

interface LandingPageProps {
  onSignIn: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onExploreDemo }) => {
  return (
    <div id="cyber-landing-page" className="relative min-h-[calc(100vh-4rem)] bg-[#050608] overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20">
        {/* Main Hero Section */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#111827] border border-[#1f2937] text-gray-300 text-xs font-mono mb-6">
            <span className="w-2 h-2 rounded-full bg-[#00f2fe] animate-pulse"></span>
            <span className="uppercase tracking-widest text-[11px]">AI DEFENSIVE CYBERSECURITY</span>
            <span className="text-gray-600">|</span>
            <span className="text-gray-400 text-[11px]">GEMINI 3.6 FLASH</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight uppercase font-sans">
            Defend your assets with <br />
            <span className="text-[#00f2fe] drop-shadow-sm">
              Intelligent AI Triage
            </span>
          </h1>

          {/* Subheading */}
          <p className="mt-5 text-sm sm:text-base text-gray-400 max-w-2xl mx-auto leading-relaxed font-sans">
            Enterprise-grade AI Cybersecurity Guardian. Inspect phishing emails, deconstruct deceptive URLs, triage syslog and SIEM alerts, and receive defensive blue-team playbooks powered by Google Gemini.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="hero-signin-google-btn"
              onClick={onSignIn}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-6 py-3.5 rounded-lg bg-white hover:bg-gray-100 text-black font-semibold shadow-lg transition-all text-xs font-sans tracking-wide active:scale-98"
            >
              {/* Google SVG Icon */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12.5s.7 2.8 1.9 5.2l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 17C3.7 20.7 7.5 24 12 24z"
                />
              </svg>
              <span>SIGN IN WITH GOOGLE</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-sandbox-btn"
              onClick={onExploreDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-[#00f2fe] font-mono text-xs border border-[#1f2937] hover:border-[#00f2fe]/40 transition-all uppercase tracking-wider"
            >
              <Zap className="w-4 h-4 text-[#00f2fe]" />
              <span>EXPLORE SECURITY SANDBOX</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-gray-500 font-mono uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              <span>Defensive Guidelines Enforced</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00f2fe]" />
              <span>Zero-Trust Data Partitioning</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Server Secret Containment</span>
            </span>
          </div>
        </div>

        {/* Interactive Cyber Threat Visualizer Teaser */}
        <div className="mt-12 relative max-w-5xl mx-auto rounded-xl border border-[#1f2937] bg-[#0a0c10] p-4 sm:p-6 shadow-2xl overflow-hidden">
          {/* Header Bar of the Mock Triage Console */}
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1f2937]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              <span className="ml-2 text-[10px] font-mono text-gray-400 tracking-wider uppercase">
                AEGIS_THREAT_DETECTION_ENGINE // LIVE_PREVIEW
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-400 border border-red-900/50 uppercase font-bold">
                RISK: CRITICAL (96/100)
              </span>
            </div>
          </div>

          {/* Grid of Visual Triage */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
            {/* Left: Input Analyzed */}
            <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937]">
              <p className="text-gray-400 font-bold mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <AlertOctagon className="w-3.5 h-3.5 text-yellow-400" />
                <span>INPUT PAYLOAD</span>
              </p>
              <div className="p-2 rounded bg-[#0a0c10] text-gray-300 font-mono text-[11px] break-all border border-[#1f2937] leading-relaxed">
                <span className="text-red-400">https://login-auth-microsoft.cloud-verify.net/</span>
                <span className="text-[#00f2fe]">?token=7f9d8a&redirect=sso</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-gray-500">
                <span>Domain Age: 2 Days</span>
                <span className="text-red-400 font-bold">Typosquat Detected</span>
              </div>
            </div>

            {/* Middle: Warning Signs & Analysis */}
            <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937]">
              <p className="text-gray-400 font-bold mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <Eye className="w-3.5 h-3.5 text-[#00f2fe]" />
                <span>IDENTIFIED RED FLAGS</span>
              </p>
              <ul className="space-y-1 text-[11px] text-gray-300">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400">✖</span>
                  <span>Domain impersonates Microsoft SSO</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-400">✖</span>
                  <span>Unauthenticated token parameter</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-yellow-400">⚠</span>
                  <span>MITRE ATT&CK: T1566.002</span>
                </li>
              </ul>
            </div>

            {/* Right: Defensive Mitigation Actions */}
            <div className="p-4 rounded-lg bg-[#050608] border border-[#1f2937]">
              <p className="text-gray-400 font-bold mb-2 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                <span>DEFENSIVE PLAYBOOK</span>
              </p>
              <ul className="space-y-1 text-[11px] text-gray-300">
                <li className="flex items-center gap-1.5 text-green-400">
                  <span>✓</span>
                  <span>Null-route domain via DNS sinkhole</span>
                </li>
                <li className="flex items-center gap-1.5 text-green-400">
                  <span>✓</span>
                  <span>Revoke any active session cookies</span>
                </li>
                <li className="flex items-center gap-1.5 text-green-400">
                  <span>✓</span>
                  <span>Enforce FIDO2 / Passkey MFA</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Feature 1 */}
          <div className="p-5 rounded-xl bg-[#0a0c10] border border-[#1f2937] hover:border-[#00f2fe]/40 transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00f2fe] mb-3 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5 uppercase tracking-wide">Ask Gemini AI</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Ask deep questions about Zero Trust, cloud hardening, OWASP Top 10, or incident response with blue-team defensive guidance.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-5 rounded-xl bg-[#0a0c10] border border-[#1f2937] hover:border-red-500/40 transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-red-400 mb-3 group-hover:scale-105 transition-transform">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5 uppercase tracking-wide">Phishing & URL Scanner</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Deconstruct suspicious emails, SMS lures, and deceptive URLs. Detect homograph attacks, typosquatting, and credential traps.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-5 rounded-xl bg-[#0a0c10] border border-[#1f2937] hover:border-yellow-500/40 transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-yellow-400 mb-3 group-hover:scale-105 transition-transform">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5 uppercase tracking-wide">Security Log Triager</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Paste server logs, syslog, SSH brute-force attempts, or web access logs. Receive instant root-cause identification and MITRE mapping.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="p-5 rounded-xl bg-[#0a0c10] border border-[#1f2937] hover:border-green-500/40 transition-all group shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-green-400 mb-3 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1.5 uppercase tracking-wide">Zero-Trust History</h3>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Every authenticated user maintains their own strictly private history, analysis audit log, bookmarked notes, and readiness metrics.
            </p>
          </div>
        </div>

        {/* Ethical Guarantee & Architecture Callout */}
        <div className="mt-14 p-6 rounded-xl bg-[#0a0c10] border border-[#1f2937] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wide">
              <Shield className="w-4 h-4 text-[#00f2fe]" />
              <span>Strict Defensive Security & Ethical Mandate</span>
            </h4>
            <p className="mt-1.5 text-xs text-gray-400 max-w-2xl font-sans leading-relaxed">
              AegisAI enforces defensive blue-team guardrails. We never generate offensive malware, exploit payloads, or cracking tools. All insights focus exclusively on vulnerability mitigation, risk remediation, and protective posture.
            </p>
          </div>
          <button
            onClick={onSignIn}
            className="whitespace-nowrap px-5 py-2.5 rounded-lg bg-[#00f2fe] hover:bg-[#4facfe] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98"
          >
            GET STARTED NOW
          </button>
        </div>
      </div>
    </div>
  );
};
