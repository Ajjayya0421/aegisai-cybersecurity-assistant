import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  props: ErrorBoundaryProps;
  state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AegisAI Root Error Caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050608] text-white flex items-center justify-center p-6 font-mono">
          <div className="max-w-lg w-full bg-[#0a0c10] border border-red-500/40 rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
              <h2 className="text-lg font-bold uppercase tracking-wider">AegisAI Diagnostic Safe Mode</h2>
            </div>
            <p className="text-xs text-gray-400">
              A client-side initialization anomaly occurred during rendering. All security telemetry has been contained.
            </p>
            {this.state.error && (
              <div className="p-3 bg-[#050608] border border-red-900/40 rounded text-[11px] text-red-300 overflow-x-auto">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#00f2fe] text-black font-bold text-xs uppercase tracking-wider rounded hover:bg-[#4facfe] transition-all cursor-pointer"
              >
                Reload AegisAI Engine
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
);

