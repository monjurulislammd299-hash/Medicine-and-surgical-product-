import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'একটি অপ্রত্যাশিত ত্রুটি ঘটেছে।',
    };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, errorMessage: '' });
  };

  override render() {
    if (this.state.hasError) {
      let friendly = this.state.errorMessage;
      try {
        const parsed = JSON.parse(this.state.errorMessage) as { error?: string; operationType?: string };
        if (parsed?.error) {
          friendly = `ডেটাবেস অপারেশন (${parsed.operationType ?? 'read'}) সম্পন্ন করা যায়নি: ${parsed.error}`;
        }
      } catch {
        // Keep raw message if not JSON
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-white border border-slate-200 rounded-xl p-8">
            <div className="flex items-center gap-3 text-rose-700 mb-4">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h2 className="text-lg font-semibold text-slate-900">
                সাময়িক সমস্যা হয়েছে
              </h2>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed mb-6 break-words">
              {friendly}
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-[#087f5b] rounded-lg hover:bg-[#06694b] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              আবার চেষ্টা করুন
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
