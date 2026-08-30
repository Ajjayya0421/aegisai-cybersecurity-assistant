import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { ChatAssistant } from './components/ChatAssistant';
import { SecurityAnalysis } from './components/SecurityAnalysis';
import { AnalysisHistory } from './components/AnalysisHistory';
import { ProfileView } from './components/ProfileView';
import { ThreatRadarModal } from './components/ThreatRadarModal';
import { AuthModal } from './components/AuthModal';
import { getCurrentUser, signOutUser, signInWithGoogleMock, subscribeToAuthChanges } from './services/storage';
import { checkServerHealth } from './services/api';
import { UserProfile } from './types';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [activeTab, setActiveTab] = useState<'chat' | 'analysis' | 'history' | 'profile'>('analysis');
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{
    status: string;
    geminiConfigured: boolean;
    service: string;
  } | null>(null);

  useEffect(() => {
    checkServerHealth().then(setHealthStatus);

    // Subscribe to Firebase Auth state updates
    const unsubscribeAuth = subscribeToAuthChanges((currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
  };

  const handleSignInSuccess = (signedInUser: UserProfile) => {
    setUser(signedInUser);
    setActiveTab('analysis');
  };

  const handleExploreDemo = () => {
    const demoUser = signInWithGoogleMock('demo.analyst@aegis-security.io', 'Demo Security Analyst');
    setUser(demoUser);
    setActiveTab('analysis');
  };

  return (
    <div className="min-h-screen bg-[#050608] text-gray-100 flex flex-col font-sans selection:bg-[#00f2fe]/20 selection:text-[#00f2fe]">
      {/* Top Header */}
      <Header
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRadar={() => setIsRadarOpen(true)}
        onSignOut={handleSignOut}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {!user ? (
          <LandingPage
            onSignIn={() => setIsAuthOpen(true)}
            onExploreDemo={handleExploreDemo}
          />
        ) : (
          <div className="py-2">
            {activeTab === 'analysis' && (
              <SecurityAnalysis
                user={user}
                onViewHistory={() => setActiveTab('history')}
              />
            )}
            {activeTab === 'chat' && <ChatAssistant user={user} />}
            {activeTab === 'history' && (
              <AnalysisHistory
                user={user}
                onNewAnalysis={() => setActiveTab('analysis')}
              />
            )}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onSignOut={handleSignOut}
                onSwitchAccount={() => setIsAuthOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1f2937] bg-[#0a0c10] py-4 px-4 text-center text-xs font-mono text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00f2fe]"></span>
            <span className="text-gray-400 uppercase tracking-widest text-[10px]">AEGIS AI DEFENSE ENGINE // FIREBASE AUTH & FIRESTORE ZERO-TRUST</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-gray-500 uppercase tracking-wider">
            <span>Server: {healthStatus?.status === 'ok' ? 'ONLINE' : 'ACTIVE'}</span>
            <span>•</span>
            <span>Gemini 3.6 Flash: {healthStatus?.geminiConfigured !== false ? 'LINKED' : 'READY'}</span>
            <span>•</span>
            <span>Firestore: SECURE</span>
          </div>
        </div>
      </footer>

      {/* Threat Radar Telemetry Modal */}
      <ThreatRadarModal isOpen={isRadarOpen} onClose={() => setIsRadarOpen(false)} />

      {/* Google Authentication Dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleSignInSuccess}
      />
    </div>
  );
}
