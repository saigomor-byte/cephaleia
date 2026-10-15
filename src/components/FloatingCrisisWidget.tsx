import React, { useState, useEffect } from 'react';
import {
  Play,
  Clock,
  ShieldAlert,
  CheckCircle,
  X,
  Minimize2,
  Maximize2,
  Smartphone,
  Pill,
  Zap
} from 'lucide-react';
import { MigraineRecord } from '../types/migraine';

interface FloatingCrisisWidgetProps {
  activeCrisis: MigraineRecord | null;
  onStartCrisisNow: (intensity?: number) => void;
  onOpenSOSModal: () => void;
  onFinishCrisis: () => void;
  onOpenWidgetModal: () => void;
}

export const FloatingCrisisWidget: React.FC<FloatingCrisisWidgetProps> = ({
  activeCrisis,
  onStartCrisisNow,
  onOpenSOSModal,
  onFinishCrisis,
  onOpenWidgetModal,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeCrisis || !activeCrisis.inProgress) {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = new Date(activeCrisis.startDate).getTime();
    const update = () => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000)));
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [activeCrisis]);

  const formatElapsed = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    if (hours > 0) {
      return `${hours}h ${minutes.toString().padStart(2, '0')}m`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const lastMed = activeCrisis?.medications && activeCrisis.medications.length > 0
    ? activeCrisis.medications[activeCrisis.medications.length - 1]
    : null;

  // If minimized to floating icon badge
  if (isMinimized) {
    return (
      <aside aria-label="Widget rapide réduit" className="fixed bottom-20 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className={`h-12 w-12 rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-90 border ${
            activeCrisis
              ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
              : 'bg-slate-900 text-slate-200 border-slate-700 hover:text-white'
          }`}
          title="Ouvrir le widget rapide"
        >
          {activeCrisis ? (
            <ShieldAlert className="w-5 h-5 text-white" />
          ) : (
            <Smartphone className="w-5 h-5" />
          )}
        </button>
      </aside>
    );
  }

  return (
    <aside aria-label="Widget rapide de crise" className="fixed bottom-20 left-4 right-4 max-w-sm mx-auto z-40 transition-all duration-300">
      <div
        className={`p-3.5 rounded-2xl backdrop-blur-xl border shadow-2xl ${
          activeCrisis
            ? 'bg-slate-950/95 border-rose-500/70 shadow-rose-950/50 ring-1 ring-rose-500/30'
            : 'bg-slate-950/95 border-slate-800'
        } space-y-2.5 text-xs text-white`}
      >
        {/* Widget Top Line */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                activeCrisis ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="font-bold tracking-tight text-[11px] uppercase">
              {activeCrisis ? 'Crise en cours (Widget)' : 'Widget Écran d’Accueil'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenWidgetModal}
              title="Configurer le widget écran d'accueil"
              className="text-slate-400 hover:text-white p-1"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Réduire le widget"
              className="text-slate-400 hover:text-white p-1"
            >
              <Minimize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Content */}
        {activeCrisis ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-rose-100 font-mono text-sm font-bold tabular-nums">
                <Clock className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{formatElapsed(elapsedSeconds)}</span>
              </div>

              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold tabular-nums text-[11px]">
                EVA {activeCrisis.intensity}/10
              </span>
            </div>

            {lastMed && (
              <div className="text-[11px] text-slate-300 flex items-center justify-between truncate bg-slate-900/60 px-2 py-1 rounded-lg">
                <span className="truncate flex items-center gap-1">
                  <Pill className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{lastMed.name}</span>
                </span>
                <span className="text-slate-400 text-[10px] shrink-0 ml-1">à {lastMed.takenAt}</span>
              </div>
            )}

            {/* Quick 1-tap Actions */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={onOpenSOSModal}
                className="min-h-[34px] px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Gérer SOS
              </button>

              <button
                type="button"
                onClick={onFinishCrisis}
                className="min-h-[34px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1 transition-colors border border-slate-700"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                Terminer
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-400 leading-tight">
              Enregistrer une crise dès les premiers prodromes :
            </span>

            <button
              type="button"
              onClick={() => onStartCrisisNow(7)}
              className="min-h-[36px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 shrink-0 transition-transform active:scale-95 whitespace-nowrap"
            >
              <Play className="w-3 h-3 fill-white" />
              1-Tap Crise
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
