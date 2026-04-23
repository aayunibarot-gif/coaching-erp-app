import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 text-center">
          <div className="card max-w-md">
            <h1 className="text-4xl">⚠️</h1>
            <h2 className="mt-4 text-2xl font-bold text-slate-900">Oops! Something went wrong.</h2>
            <p className="mt-2 text-slate-600">
              The application encountered an unexpected error. This usually happens when data is missing or corrupted.
            </p>
            <div className="mt-6 space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary w-full"
              >
                Refresh Page
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.href = "/login";
                }}
                className="btn-secondary w-full"
              >
                Clear Cache & Logout
              </button>
            </div>
            <pre className="mt-6 overflow-auto rounded-xl bg-slate-900 p-4 text-left text-[10px] text-red-400">
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
