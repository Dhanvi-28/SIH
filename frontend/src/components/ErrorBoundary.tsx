import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('OptiFreight UI error:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return <>{this.props.children}</>;

    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-slate-50">
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-red-200 p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-lg mb-3">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">This page could not be displayed</h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            An unexpected error interrupted rendering. Reloading usually clears it. If it keeps happening, make sure
            the backend is running on port 5000 and the database has been seeded.
          </p>

          <pre className="mt-4 text-left text-[11px] bg-slate-50 border border-slate-200 rounded-xl p-3 text-red-700 overflow-auto max-h-32">
            {this.state.error.message}
          </pre>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => this.setState({ error: null })}
              className="px-5 py-2.5 bg-forest-900 hover:bg-forest-800 text-white font-extrabold text-xs rounded-xl shadow transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
}
