import React, { useState, useEffect } from 'react';
import { 
  Terminal, 
  Search, 
  Trash2, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Bookmark, 
  BookmarkCheck, 
  Mail, 
  Globe, 
  FileCode, 
  HelpCircle, 
  CheckCircle2, 
  Circle, 
  AlertTriangle
} from 'lucide-react';
import { AnalysisCategory, RiskLevel, SecurityAnalysisResult, UserProfile } from '../types';
import { 
  getUserAnalyses, 
  deleteUserAnalysis, 
  clearUserAnalyses, 
  toggleAnalysisActionCompleted, 
  toggleBookmarkAnalysis,
  subscribeToUserAnalyses 
} from '../services/storage';

interface AnalysisHistoryProps {
  user: UserProfile;
  onNewAnalysis: () => void;
}

export const AnalysisHistory: React.FC<AnalysisHistoryProps> = ({ user, onNewAnalysis }) => {
  const [analyses, setAnalyses] = useState<SecurityAnalysisResult[]>(() => getUserAnalyses(user.uid));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AnalysisCategory | 'all'>('all');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'all'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    // Realtime subscription to user's private Firestore threat analyses
    const unsubscribe = subscribeToUserAnalyses(user.uid, (loaded) => {
      setAnalyses(loaded);
    });
    return () => unsubscribe();
  }, [user.uid]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this analysis record from your private Cloud Firestore audit log?')) {
      await deleteUserAnalysis(user.uid, id);
      setAnalyses(getUserAnalyses(user.uid));
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete all past analysis history in Cloud Firestore?')) {
      await clearUserAnalyses(user.uid);
      setAnalyses(getUserAnalyses(user.uid));
    }
  };

  const handleToggleBookmark = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleBookmarkAnalysis(user.uid, id);
    setAnalyses(getUserAnalyses(user.uid));
  };

  const handleToggleAction = async (analysisId: string, actionIdx: number) => {
    await toggleAnalysisActionCompleted(user.uid, analysisId, actionIdx);
    setAnalyses(getUserAnalyses(user.uid));
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(analyses, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisAI-Firestore-AuditHistory-${user.uid}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Category', 'Risk Level', 'Threat Type', 'Summary'];
    const rows = analyses.map((a) => [
      new Date(a.timestamp).toISOString(),
      a.category,
      a.riskLevel,
      `"${a.threatType.replace(/"/g, '""')}"`,
      `"${a.summary.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AegisAI-Firestore-AuditHistory-${user.uid}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter analyses based on search and filters
  const filteredAnalyses = analyses.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRisk = selectedRisk === 'all' || item.riskLevel === selectedRisk;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.threatType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rawInput.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesRisk && matchesSearch;
  });

  const getCategoryIcon = (cat: AnalysisCategory) => {
    switch (cat) {
      case 'message':
        return <Mail className="w-4 h-4 text-cyan-400" />;
      case 'url':
        return <Globe className="w-4 h-4 text-sky-400" />;
      case 'log':
        return <FileCode className="w-4 h-4 text-amber-400" />;
      case 'question':
      default:
        return <HelpCircle className="w-4 h-4 text-purple-400" />;
    }
  };

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-900/30 text-red-400 border-red-900/50';
      case 'HIGH':
        return 'bg-red-900/30 text-red-400 border-red-900/50';
      case 'MEDIUM':
        return 'bg-yellow-900/30 text-yellow-400 border-yellow-900/50';
      case 'LOW':
      default:
        return 'bg-emerald-950/40 text-emerald-400 border-emerald-900/50';
    }
  };

  return (
    <div id="cyber-analysis-history" className="max-w-6xl mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-[#1f2937] gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tighter text-white uppercase font-sans">
            Threat History & Audit Log
          </h2>
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest mt-0.5">
            Cloud Firestore Isolated Incidents // {analyses.length} Records Saved
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={analyses.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>CSV</span>
          </button>
          <button
            onClick={handleExportJSON}
            disabled={analyses.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1f2937] border border-[#1f2937] hover:border-[#00f2fe]/40 text-gray-300 hover:text-[#00f2fe] font-mono text-xs uppercase tracking-wider transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 text-[#00f2fe]" />
            <span>JSON</span>
          </button>
          <button
            onClick={handleClearAll}
            disabled={analyses.length === 0}
            className="p-2 rounded-lg bg-[#111827] hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-[#1f2937] hover:border-rose-700/40 transition-all disabled:opacity-40"
            title="Clear All History"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-[#0a0c10] border border-[#1f2937] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search threat type, summary, or IOC..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#050608] border border-[#1f2937] text-white placeholder-gray-600 text-xs font-mono focus:outline-none focus:border-[#00f2fe]/50"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1f2937] text-gray-300 text-xs font-mono focus:outline-none focus:border-[#00f2fe]/50 cursor-pointer"
            >
              <option value="all">Category: All</option>
              <option value="message">Messages (Phishing)</option>
              <option value="url">URLs (Malicious / Typosquat)</option>
              <option value="log">Security Logs (Syslog/Auth)</option>
              <option value="question">Threat Questions</option>
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1f2937] text-gray-300 text-xs font-mono focus:outline-none focus:border-[#00f2fe]/50 cursor-pointer"
            >
              <option value="all">Risk Level: All</option>
              <option value="CRITICAL">Critical Threats</option>
              <option value="HIGH">Elevated / High</option>
              <option value="MEDIUM">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of Analysis Records */}
      {filteredAnalyses.length > 0 ? (
        <div className="space-y-4">
          {filteredAnalyses.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`rounded-xl border transition-all cursor-pointer ${
                  isExpanded
                    ? 'bg-[#0a0c10] border-[#00f2fe]/40 shadow-2xl'
                    : 'bg-[#0a0c10] border-[#1f2937] hover:border-gray-700'
                }`}
              >
                {/* Main Card Summary Row */}
                <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <div className="p-2.5 rounded-lg bg-[#111827] border border-[#1f2937] shrink-0 text-[#00f2fe]">
                      {getCategoryIcon(item.category)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${getRiskBadge(item.riskLevel)}`}>
                          {item.riskLevel}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 uppercase">
                          [{item.category}]
                        </span>
                        <span className="text-[10px] font-mono text-gray-500">
                          {new Date(item.timestamp).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white truncate">
                        {item.threatType}
                      </h4>
                      <p className="text-xs text-gray-400 truncate font-sans mt-0.5">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleToggleBookmark(item.id, e)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-[#00f2fe] transition-colors"
                      title={item.bookmarked ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      {item.bookmarked ? (
                        <BookmarkCheck className="w-4 h-4 text-[#00f2fe]" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1 text-gray-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-[#00f2fe]" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Detailed Breakdown */}
                {isExpanded && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="p-5 border-t border-[#1f2937] bg-[#050608] rounded-b-xl space-y-4 cursor-default font-sans"
                  >
                    {/* Raw Input Payload */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Submitted Payload:
                      </p>
                      <pre className="p-3 rounded-lg bg-[#0a0c10] text-[#00f2fe] text-xs font-mono border border-[#1f2937] whitespace-pre-wrap break-all">
                        {item.rawInput}
                      </pre>
                    </div>

                    {/* Detailed Explanation */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                        Technical Threat Explanation:
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed bg-[#0a0c10] p-3 rounded-lg border border-[#1f2937]">
                        {item.explanation}
                      </p>
                    </div>

                    {/* Warning Signs */}
                    {item.warningSigns && item.warningSigns.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Identified Red Flags:</span>
                        </p>
                        <ul className="space-y-1 text-xs text-gray-300">
                          {item.warningSigns.map((w, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-400">⚠️</span>
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Defensive Actions Checklists */}
                    {item.defensiveActions && item.defensiveActions.length > 0 && (
                      <div>
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Defensive Remediation Checklist:</span>
                        </p>
                        <div className="space-y-1.5">
                          {item.defensiveActions.map((act, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleToggleAction(item.id, idx)}
                              className={`flex items-start gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                act.completed
                                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200 line-through'
                                  : 'bg-[#0a0c10] border-[#1f2937] text-gray-300 hover:border-[#00f2fe]/40'
                              }`}
                            >
                              {act.completed ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              ) : (
                                <Circle className="w-3.5 h-3.5 text-gray-600 shrink-0 mt-0.5" />
                              )}
                              <span>{act.action}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-xl bg-[#0a0c10] border border-dashed border-[#1f2937] p-12 text-center">
          <Terminal className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white mb-1">
            No Past Analysis Records Found
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4 font-sans">
            {searchQuery || selectedCategory !== 'all' || selectedRisk !== 'all'
              ? 'No historical logs match your current search or filter criteria.'
              : 'You have not run any threat analyses yet on this account.'}
          </p>
          <button
            onClick={onNewAnalysis}
            className="px-4 py-2 rounded-lg bg-[#00f2fe] hover:bg-[#4facfe] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Launch Security Analysis
          </button>
        </div>
      )}
    </div>
  );
};
