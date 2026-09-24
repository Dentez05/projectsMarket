import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error);
  }

  handleReload = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#1a1f2e] px-4 text-center">
          <p className="text-5xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-white mb-2">Что-то пошло не так</h1>
          <p className="text-white/40 text-sm mb-6">Произошла непредвиденная ошибка</p>
          <button onClick={this.handleReload} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-semibold">
            На главную
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
