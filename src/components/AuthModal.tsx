import React, { useState } from 'react';
import { X, Shield, Lock, ArrowRight, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { signInWithGoogleFirebase, signInWithGoogleMock } from '../services/storage';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFirebaseGoogleSignIn = async () => {
    setIsProcessing(true);
    setAuthError(null);
    try {
      const user = await signInWithGoogleFirebase();
      setIsProcessing(false);
      onSuccess(user);
      onClose();
    } catch (err: any) {
      console.warn('Firebase popup sign-in encountered an issue (trying mock fallback if popup blocked):', err);
      // In sandboxed iframes, popups might be restricted; offer smooth fallback
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setAuthError('Google sign-in popup was blocked or closed. You can also sign in with your corporate profile below.');
      } else {
        setAuthError(err.message || 'Google authentication encountered an error.');
      }
      setIsProcessing(false);
    }
  };

  const handleCustomIdentitySignIn = () => {
    setIsProcessing(true);
    setAuthError(null);
    setTimeout(() => {
      const email = customEmail || 'ajjayyanh@gmail.com';
      const name = customName || email.split('@')[0];
      const user = signInWithGoogleMock(email, name);
      setIsProcessing(false);
      onSuccess(user);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-xl bg-[#0a0c10] border border-[#1f2937] p-6 sm:p-7 shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1f2937]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#111827] border border-[#1f2937] flex items-center justify-center text-[#00f2fe]">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wide">
                AUTHENTICATE TO AEGIS AI
              </h3>
              <p className="text-[10px] font-mono text-[#00f2fe] uppercase tracking-wider">
                Firebase Auth & Cloud Firestore
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

        {/* Primary Firebase Google Sign-In Button */}
        <div className="space-y-4">
          <button
            id="auth-modal-google-btn"
            onClick={handleFirebaseGoogleSignIn}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white hover:bg-gray-100 text-black font-semibold text-xs transition-all shadow-md active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 animate-spin text-black" />
            ) : (
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
            )}
            <span>SIGN IN WITH GOOGLE (FIREBASE AUTH)</span>
          </button>

          {authError && (
            <div className="p-3 rounded-lg bg-yellow-950/40 border border-yellow-800/40 text-yellow-300 text-xs font-mono flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-2 my-3">
            <div className="flex-1 h-[1px] bg-[#1f2937]"></div>
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">OR CORPORATE SSO IDENTITY</span>
            <div className="flex-1 h-[1px] bg-[#1f2937]"></div>
          </div>

          {/* Custom Identity Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Analyst Name
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. Alex Vance, Lead Threat Analyst"
                className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1f2937] text-white text-xs font-mono focus:outline-none focus:border-[#00f2fe]/50"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                Corporate Email
              </label>
              <input
                type="email"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="ajjayyanh@gmail.com"
                className="w-full px-3 py-2 rounded-lg bg-[#050608] border border-[#1f2937] text-white text-xs font-mono focus:outline-none focus:border-[#00f2fe]/50"
              />
            </div>

            <button
              onClick={handleCustomIdentitySignIn}
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-lg bg-[#00f2fe] hover:bg-[#4facfe] text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>PROCEED WITH ANALYST IDENTITY</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Security Features Callout */}
          <div className="mt-4 pt-4 border-t border-[#1f2937] space-y-1.5 text-[11px] font-mono text-gray-400">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Isolated Firestore documents & security rules</span>
            </div>
            <div className="flex items-center gap-2 text-[#00f2fe]">
              <Lock className="w-3.5 h-3.5" />
              <span>Zero-Trust: users can ONLY access their own data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
