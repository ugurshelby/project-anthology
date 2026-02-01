import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { errorTracker } from '../utils/errorTracker';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track error in production
    errorTracker.captureError(error, {
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    });

    // Also log to console for development
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-f1-black text-paper flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl w-full text-center space-y-8"
          >
            {/* Red Flag Indicator */}
            <div className="flex justify-center items-center gap-4 mb-8">
              <div className="h-[2px] w-16 bg-f1-red" />
              <span className="font-mono text-f1-red text-sm uppercase tracking-[0.3em]">
                DNF
              </span>
              <div className="h-[2px] w-16 bg-f1-red" />
            </div>

            {/* Main Error Message */}
            <h1 className="font-serif text-5xl md:text-7xl text-white leading-tight mb-6">
              Pit Stop Required
            </h1>

            <p className="font-sans text-lg text-gray-300 leading-relaxed mb-8">
              We encountered an unexpected issue while loading this archival record.
              The system has been flagged for immediate review.
            </p>

            {/* Technical Details (Collapsible) */}
            {this.state.error && (
              <details className="mt-8 text-left">
                <summary className="font-mono text-xs text-gray-300 uppercase tracking-widest cursor-pointer hover:text-f1-red transition-colors mb-4">
                  Technical Details
                </summary>
                <div className="bg-f1-dark border border-white/10 p-6 rounded font-mono text-xs text-gray-300 space-y-2">
                  <div>
                    <span className="text-f1-red">Error:</span> {this.state.error.toString()}
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <span className="text-f1-red">Component Stack:</span>
                      <pre className="mt-2 text-[10px] overflow-auto max-h-48">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <button
                onClick={() => window.location.reload()}
                aria-label="Retry session and reload page"
                className="px-8 py-3 bg-f1-red text-white font-mono text-xs uppercase tracking-widest hover:bg-f1-red/80 transition-colors focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black"
              >
                Retry Session
              </button>
              <button
                onClick={() => window.location.href = '/'}
                aria-label="Return to archive homepage"
                className="px-8 py-3 border border-white/20 text-white font-mono text-xs uppercase tracking-widest hover:border-f1-red hover:text-f1-red transition-colors focus:outline-none focus:ring-2 focus:ring-f1-red focus:ring-offset-2 focus:ring-offset-f1-black"
              >
                Return to Archive
              </button>
            </div>

            {/* Telemetry Footer */}
            <div className="mt-16 pt-8 border-t border-white/10">
              <div className="font-mono text-[9px] text-gray-500 space-y-1">
                <p>STATUS: SYSTEM_ERROR</p>
                <p>CODE: {this.state.error?.name || 'UNKNOWN'}</p>
                <p>TIME: {new Date().toISOString()}</p>
              </div>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
