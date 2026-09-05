import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="h-dvh flex flex-col items-center justify-center p-4 bg-bg-primary text-center">
          <h2 className="text-xl font-bold text-text-primary mb-4">Something went wrong.</h2>
          <p className="text-text-secondary mb-6">{this.state.error?.message || "An unexpected error occurred."}</p>
          <div className="flex gap-4">
            <button
              className="px-4 py-2 bg-accent text-white rounded-lg hover:opacity-90"
              onClick={() => window.location.reload()}
            >
              Reload Everything
            </button>
            <button
              className="px-4 py-2 bg-bg-tertiary text-text-primary rounded-lg hover:bg-border-primary"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Try Recovering
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
