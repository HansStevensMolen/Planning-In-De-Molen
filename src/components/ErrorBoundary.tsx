import React, { Component, ReactNode, ErrorInfo } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in component tree:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('cafe_employees');
      localStorage.removeItem('cafe_shifts');
      localStorage.removeItem('cafe_availabilities');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-xl border-2 border-orange-200 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <AlertCircle size={32} />
            </div>
            
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              In De Molen • Café Planning
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Er is een tijdelijke weergavefout opgetreden bij het inladen van de gegevens. Klik hieronder om de weergave opnieuw op te starten.
            </p>

            {this.state.error && (
              <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200">
                <p className="text-[11px] font-mono text-slate-600 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-3 px-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw size={15} />
                <span>Opnieuw laden</span>
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                title="Herstel fabrieksinstellingen / cache legen"
              >
                Cache Herstellen
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
