import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Ignore abort errors
    if (error.name === 'AbortError' || 
        error.message?.includes('aborted') ||
        error.message?.includes('body stream')) {
      return { hasError: false };
    }
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Ignore abort errors
    if (error.name === 'AbortError' || 
        error.message?.includes('aborted') ||
        error.message?.includes('body stream')) {
      return;
    }
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-stone-900 mb-2">Something went wrong</h1>
            <p className="text-stone-500 mb-4">Please refresh the page and try again.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
