import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, ShieldAlert } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  private reportToJudgeMode = () => {
    if ((window as any).__JUDGE_MODE_ENABLED) {
       const event = new CustomEvent('api_call_logged', {
        detail: {
          method: 'ERROR',
          url: 'React Boundary',
          status: 500,
          duration: 0,
          requestBody: { componentStack: this.state.errorInfo?.componentStack },
          responseBody: { message: this.state.error?.message, stack: this.state.error?.stack }
        }
      });
      window.dispatchEvent(event);
      alert("Error logged to Judge Mode panel.");
    } else {
      alert("Please enable Judge Mode first to record this error.");
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 border border-red-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6 mx-auto">
              <ShieldAlert className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Something went wrong</h1>
            <p className="text-slate-500 text-center mb-6">
              A critical error occurred in the React component tree.
            </p>
            
            <div className="bg-slate-100 rounded-lg p-4 mb-6 overflow-x-auto">
              <p className="text-sm font-mono text-red-600 break-words font-semibold">
                {this.state.error?.message}
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                <RefreshCcw className="w-4 h-4" /> Retry
              </button>
              <button 
                onClick={this.reportToJudgeMode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" /> Report to Judge
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
