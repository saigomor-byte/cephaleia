import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Clock,
  Pill,
  Zap,
  Smartphone,
  CheckCircle,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  Layers,
  Sparkles,
  Share2,
  BookmarkPlus
} from 'lucide-react';
import { MigraineRecord } from '../types/migraine';

interface HomeScreenWidgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCrisis: MigraineRecord | null;
  onStartCrisisNow: (intensity?: number) => void;
  onOpenSOSModal: () => void;
  onFinishCrisis: () => void;
  isFloatingWidgetActive: boolean;
  onToggleFloatingWidget: (active: boolean) => void;
}

export const HomeScreenWidgetModal: React.FC<HomeScreenWidgetModalProps> = ({
  isOpen,
  onClose,
  activeCrisis,
  onStartCrisisNow,
  onOpenSOSModal,
  onFinishCrisis,
  isFloatingWidgetActive,
  onToggleFloatingWidget,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [widgetFormat, setWidgetFormat] = useState<'medium' | 'small'>('medium');
  const [deviceTab, setDeviceTab] = useState<'ios' | 'android'>('android');

  // Elapsed timer for active crisis
  useEffect(() => {
    if (!activeCrisis || !activeCrisis.inProgress) {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = new Date(activeCrisis.startDate).getTime();
    const updateTimer = () => {
      const diff = Math.max(0, Math.floor((Date.now() - startTimestamp) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCrisis]);

  if (!isOpen) return null;

  const formatElapsed = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const lastMed = activeCrisis?.medications && activeCrisis.medications.length > 0
    ? activeCrisis.medications[activeCrisis.medications.length - 1]
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header toolbar */}
        <div className="px-5 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Widget Écran d’Accueil & Raccourcis
              </h2>
              <p className="text-xs text-slate-400">
                Accès instantané en 1 tap & suivi de la crise en cours
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Format Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">Aperçu du format de widget :</span>
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setWidgetFormat('medium')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  widgetFormat === 'medium' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Rectangle (4x2)
              </button>
              <button
                type="button"
                onClick={() => setWidgetFormat('small')}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  widgetFormat === 'small' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Carré (2x2)
              </button>
            </div>
          </div>

          {/* WIDGET PREVIEW SIMULATOR */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Phone home screen mockup background */}
            <div className="absolute top-2 left-6 right-6 flex justify-between text-[10px] text-slate-500 font-mono">
              <span>09:41</span>
              <span>5G · 100%</span>
            </div>

            {/* Simulated Widget Box */}
            <div
              className={`mt-4 transition-all duration-300 w-full ${
                widgetFormat === 'medium' ? 'max-w-md' : 'max-w-xs'
              } p-4 rounded-3xl bg-slate-900/95 border ${
                activeCrisis
                  ? 'border-rose-500/60 shadow-lg shadow-rose-950/40 ring-1 ring-rose-500/30'
                  : 'border-slate-800 shadow-xl'
              } space-y-3`}
            >
              {/* Widget Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-lg bg-rose-600 flex items-center justify-center text-white text-[10px] font-bold">
                    C
                  </div>
                  <span className="text-xs font-bold text-white tracking-tight">Céphaleia</span>
                </div>

                {activeCrisis ? (
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Crise active
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Jour sain
                  </span>
                )}
              </div>

              {/* Dynamic State: Crisis in Progress VS Healthy state */}
              {activeCrisis ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[11px] text-slate-400">Durée d'attaque</div>
                      <div className="text-2xl sm:text-3xl font-mono font-bold text-white tabular-nums tracking-tight">
                        {formatElapsed(elapsedSeconds)}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] text-slate-400">Douleur EVA</div>
                      <span className="text-lg font-bold text-rose-400 tabular-nums">
                        {activeCrisis.intensity} / 10
                      </span>
                    </div>
                  </div>

                  {lastMed ? (
                    <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <Pill className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{lastMed.name} ({lastMed.dose})</span>
                      </span>
                      <span className="text-slate-400 text-[10px] shrink-0 ml-2">Pris à {lastMed.takenAt}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-300/90 flex items-center gap-1">
                      <Zap className="w-3 h-3 text-amber-400" />
                      Aucun triptan ou antalgique encore pris
                    </div>
                  )}

                  {/* 1-Tap Widget Quick Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenSOSModal();
                      }}
                      className="min-h-[40px] px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30 transition-transform active:scale-95"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Ouvrir SOS
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onFinishCrisis();
                        onClose();
                      }}
                      className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      Fin de crise
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-1">
                  <div>
                    <div className="text-sm font-bold text-white">Pas de céphalée active</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Prêt pour un enregistrement instantané en cas de douleur subite.
                    </p>
                  </div>

                  {/* Giant 1-Tap Start Button */}
                  <button
                    type="button"
                    onClick={() => {
                      onStartCrisisNow(7);
                      onClose();
                    }}
                    className="w-full min-h-[44px] px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-transform active:scale-98"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Enregistrer une crise en 1 appui
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-4 text-center">
              Simulation du widget interactif sur votre écran d'accueil
            </p>
          </div>

          {/* Floating In-App Mini-Widget Option */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h4 className="text-xs font-bold text-white">Widget Flottant Toujours Visible</h4>
              </div>
              <p className="text-[11px] text-slate-400">
                Affiche une capsule interactive flottante dans l’application avec chronomètre et bouton 1-tap.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isFloatingWidgetActive}
                onChange={(e) => onToggleFloatingWidget(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
            </label>
          </div>

          {/* How to add widget to mobile home screen guide */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BookmarkPlus className="w-3.5 h-3.5 text-rose-400" />
                Installer sur votre écran d'accueil
              </h4>

              <div className="flex gap-1 text-xs">
                <button
                  type="button"
                  onClick={() => setDeviceTab('android')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                    deviceTab === 'android' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Android / Chrome
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceTab('ios')}
                  className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                    deviceTab === 'ios' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  iPhone / Safari
                </button>
              </div>
            </div>

            {deviceTab === 'android' ? (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <div>
                    Appuyez sur le menu <strong className="text-white">⋮ (Trois points)</strong> en haut à droite de Chrome.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <div>
                    Sélectionnez <strong className="text-white">« Ajouter à l'écran d'accueil »</strong> ou <strong className="text-white">« Installer l'application »</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-white">Raccourci 1-Tap :</strong> Sur votre écran d'accueil, restez appuyé sur l'icône Céphaleia pour ouvrir instantanément <strong className="text-rose-400">« SOS Crise »</strong> en un clic !
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                  <div>
                    Dans Safari, appuyez sur le bouton <strong className="text-white">Partager (carré avec flèche vers le haut)</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                  <div>
                    Faites défiler et appuyez sur <strong className="text-white">« Sur l'écran d'accueil »</strong>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-white">Astuce Raccourcis iOS :</strong> Vous pouvez créer un widget iOS 1-tap via l'application Raccourcis ouvrant directement l'URL avec l'action SOS.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
