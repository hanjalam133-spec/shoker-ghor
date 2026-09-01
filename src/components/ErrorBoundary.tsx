import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Error in React Application:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-bold text-white">পেজটি লোড হতে সমস্যা হয়েছে</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              সাময়িক যান্ত্রিক ত্রুটির জন্য দুঃখিত। নিচের বাটনে ক্লিক করে পেজটি রিফ্রেশ করুন।
            </p>
            {this.state.error && (
              <div className="bg-slate-950 p-3 rounded-lg text-xs text-red-400 text-left font-mono overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl transition-all cursor-pointer shadow-lg"
            >
              পুনরায় রিফ্রেশ করুন (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
