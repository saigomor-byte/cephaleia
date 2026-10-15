import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Volume2,
  VolumeX,
  Clock,
  Pill,
  Sparkles,
  Eye,
  CheckCircle,
  X,
  Play,
  Square,
  Droplets,
  Wind
} from 'lucide-react';
import { MigraineRecord, MedicationEntry } from '../types/migraine';
import { soundSynth } from '../utils/audioSynthesizer';
import { COMMON_MEDICATIONS } from '../data/initialData';

interface CrisisSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeCrisis: MigraineRecord | null;
  onStartCrisis: (intensity: number) => void;
  onEndCrisis: (updatedRecord: MigraineRecord) => void;
  onUpdateCrisis: (record: MigraineRecord) => void;
}

export const CrisisSOSModal: React.FC<CrisisSOSModalProps> = ({
  isOpen,
  onClose,
  activeCrisis,
  onStartCrisis,
  onEndCrisis,
  onUpdateCrisis,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundPlaying, setSoundPlaying] = useState(false);
  const [soundType, setSoundType] = useState<'brown' | 'pink' | 'binaural' | 'water'>('brown');
  const [soundVolume, setSoundVolume] = useState(0.35);
  const [screenDimmer, setScreenDimmer] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inspiration (4s)' | 'Rétention (7s)' | 'Expiration (8s)'>('Inspiration (4s)');
  const [selectedQuickMed, setSelectedQuickMed] = useState('');
  const [customMed, setCustomMed] = useState('');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    dark_room: true,
    cold_compress: false,
    water: false,
    medication: false,
    jaw_relax: false,
  });

  // Calculate elapsed time from activeCrisis start date
  useEffect(() => {
    if (!activeCrisis || !activeCrisis.inProgress) {
      setElapsedSeconds(0);
      return;
    }

    const startTimestamp = new Date(activeCrisis.startDate).getTime();

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((now - startTimestamp) / 1000));
      setElapsedSeconds(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeCrisis]);

  // Breathing 4-7-8 cycle
  useEffect(() => {
    if (!isOpen) return;
    let timer: NodeJS.Timeout;

    const cycle = () => {
      setBreathingPhase('Inspiration (4s)');
      timer = setTimeout(() => {
        setBreathingPhase('Rétention (7s)');
        timer = setTimeout(() => {
          setBreathingPhase('Expiration (8s)');
          timer = setTimeout(cycle, 8000);
        }, 7000);
      }, 4000);
    };

    cycle();
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Clean audio on unmount or close
  useEffect(() => {
    return () => {
      soundSynth.stop();
    };
  }, []);

  const toggleSound = (type: 'brown' | 'pink' | 'binaural' | 'water') => {
    if (soundPlaying && soundType === type) {
      soundSynth.stop();
      setSoundPlaying(false);
    } else {
      setSoundType(type);
      soundSynth.play(type, soundVolume);
      setSoundPlaying(true);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    soundSynth.setVolume(vol);
  };

  const formatElapsed = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleStartNow = (intensity = 7) => {
    onStartCrisis(intensity);
  };

  const handleQuickMedTake = () => {
    const medName = customMed.trim() || selectedQuickMed;
    if (!medName || !activeCrisis) return;

    const newMed: MedicationEntry = {
      id: 'med-' + Date.now(),
      name: medName,
      dose: '1 dose',
      takenAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      relief: 'pending',
    };

    const updated = {
      ...activeCrisis,
      medications: [...activeCrisis.medications, newMed],
    };

    onUpdateCrisis(updated);
    setSelectedQuickMed('');
    setCustomMed('');
    setChecklist((prev) => ({ ...prev, medication: true }));
  };

  const handleFinishCrisis = () => {
    if (!activeCrisis) return;
    const nowIso = new Date().toISOString().slice(0, 16);
    const updated: MigraineRecord = {
      ...activeCrisis,
      endDate: nowIso,
      inProgress: false,
    };
    soundSynth.stop();
    setSoundPlaying(false);
    onEndCrisis(updated);
  };

  const handleIntensityChange = (val: number) => {
    if (!activeCrisis) return;
    const peak = Math.max(activeCrisis.peakIntensity || activeCrisis.intensity, val);
    onUpdateCrisis({
      ...activeCrisis,
      intensity: val,
      peakIntensity: peak,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
      {/* Photophobia Dimmer overlay */}
      {screenDimmer && (
        <div className="fixed inset-0 z-60 bg-black/75 pointer-events-none transition-opacity duration-300" />
      )}

      <div className="w-full max-w-xl bg-slate-950 border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Top Header bar with SOS Badge & Controls */}
        <div className="sticky top-0 z-20 px-5 py-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Mode SOS Crise</h2>
              <p className="text-xs text-rose-300/80">Espace d'apaisement & protocole d'urgence</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Screen Dimmer button for photophobia */}
            <button
              type="button"
              onClick={() => setScreenDimmer(!screenDimmer)}
              title="Tamiser l'écran (anti-photophobie)"
              className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center text-xs transition-colors border ${
                screenDimmer
                  ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                soundSynth.stop();
                setSoundPlaying(false);
                onClose();
              }}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable SOS Body */}
        <div className="p-5 overflow-y-auto space-y-6">
          {/* Active Timer or Start Card */}
          {activeCrisis && activeCrisis.inProgress ? (
            <div className="p-5 rounded-2xl bg-gradient-to-b from-rose-950/40 to-slate-900/60 border border-rose-900/40 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Crise en cours d'enregistrement
                </span>
                <span className="text-xs text-slate-400">
                  Début : {new Date(activeCrisis.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="text-center py-2">
                <div className="text-4xl sm:text-5xl font-mono font-bold text-rose-100 tabular-nums tracking-tight">
                  {formatElapsed(elapsedSeconds)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Durée écoulée depuis la première alerte</p>
              </div>

              {/* Intensity Slider in real-time */}
              <div className="space-y-2 pt-2 border-t border-rose-900/30">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300">Intensité actuelle (EVA) :</span>
                  <span className="text-sm font-bold text-rose-400 tabular-nums">
                    {activeCrisis.intensity} / 10
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={activeCrisis.intensity}
                  onChange={(e) => handleIntensityChange(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>1 (Gêne)</span>
                  <span>5 (Modérée)</span>
                  <span>8 (Sévère)</span>
                  <span>10 (Intolérable)</span>
                </div>
              </div>

              {/* End Crisis Action */}
              <button
                type="button"
                onClick={handleFinishCrisis}
                className="w-full min-h-[48px] px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-rose-800/40 text-rose-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                Marquer la fin de la crise & archiver
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-900/50 text-center space-y-4">
              <div>
                <h3 className="text-lg font-bold text-white">Une crise commence ?</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Déclenchez le chronomètre maintenant pour capturer la durée exacte et l'heure de prise du traitement.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => handleStartNow(6)}
                  className="min-h-[48px] px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Démarrer le suivi de crise maintenant
                </button>
              </div>
            </div>
          )}

          {/* Quick Medication Intake logger */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5 text-rose-400" />
                Prise de médicament immédiate
              </h3>
              {activeCrisis && (
                <span className="text-[11px] text-slate-400">
                  {activeCrisis.medications.length} pris{activeCrisis.medications.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Notez immédiatement l'heure précise pour évaluer le délai de soulagement (règle des 2 heures).
            </p>

            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDICATIONS.slice(0, 4).map((med) => (
                <button
                  key={med.name}
                  type="button"
                  onClick={() => setSelectedQuickMed(med.name)}
                  className={`min-h-[36px] px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                    selectedQuickMed === med.name
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  {med.name}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ou saisir un traitement..."
                value={customMed || selectedQuickMed}
                onChange={(e) => {
                  setCustomMed(e.target.value);
                  setSelectedQuickMed('');
                }}
                className="flex-1 min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
              <button
                type="button"
                onClick={handleQuickMedTake}
                disabled={!customMed && !selectedQuickMed}
                className="min-h-[44px] px-4 rounded-xl bg-rose-600 disabled:opacity-40 disabled:hover:bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition-colors shrink-0"
              >
                Enregistrer la prise
              </button>
            </div>

            {/* List of medications already taken in this active session */}
            {activeCrisis && activeCrisis.medications.length > 0 && (
              <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
                {activeCrisis.medications.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-medium text-white">{m.name}</span>
                    <span className="text-slate-400 tabular-nums">Pris à {m.takenAt}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guided 4-7-8 Breathing Circle */}
          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center text-center space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              Respiration guidée 4-7-8 (Calmant vagal)
            </div>

            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div
                className={`absolute inset-0 rounded-full border-2 transition-all duration-1000 ${
                  breathingPhase.startsWith('Inspiration')
                    ? 'border-sky-400/50 scale-110 bg-sky-500/10'
                    : breathingPhase.startsWith('Rétention')
                    ? 'border-indigo-400/70 scale-110 bg-indigo-500/15'
                    : 'border-emerald-400/40 scale-90 bg-emerald-500/5'
                }`}
              />
              {/* Center Circle with Text */}
              <div className="z-10 flex flex-col items-center justify-center p-4">
                <span className="text-sm font-bold text-white tracking-tight">{breathingPhase}</span>
                <span className="text-[11px] text-slate-400 mt-1">
                  {breathingPhase.startsWith('Inspiration') && 'Inspirez par le nez'}
                  {breathingPhase.startsWith('Rétention') && 'Gardez l’air poumons pleins'}
                  {breathingPhase.startsWith('Expiration') && 'Expirez lentement par la bouche'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 max-w-sm">
              Ralentit le rythme cardiaque et diminue l'hyper-excitabilité neuronale pendant la phase d'attaque.
            </p>
          </div>

          {/* Soothing Sound Synthesizer */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Sons apaisants neurologiques (hors-ligne)
              </h3>
              {soundPlaying && (
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Actif
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Le bruit brun atténue les acouphènes et la phonophobie par masquage doux des fréquences aiguës.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => toggleSound('brown')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors ${
                  soundPlaying && soundType === 'brown'
                    ? 'bg-amber-600/30 border-amber-500 text-amber-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <span>Bruit Brun</span>
                {soundPlaying && soundType === 'brown' ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => toggleSound('pink')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors ${
                  soundPlaying && soundType === 'pink'
                    ? 'bg-rose-600/30 border-rose-500 text-rose-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <span>Bruit Rose</span>
                {soundPlaying && soundType === 'pink' ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => toggleSound('binaural')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors ${
                  soundPlaying && soundType === 'binaural'
                    ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <span>Delta 432Hz</span>
                {soundPlaying && soundType === 'binaural' ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              </button>

              <button
                type="button"
                onClick={() => toggleSound('water')}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-medium border flex items-center justify-between transition-colors ${
                  soundPlaying && soundType === 'water'
                    ? 'bg-teal-600/30 border-teal-500 text-teal-200'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:text-white'
                }`}
              >
                <span>Pluie douce</span>
                {soundPlaying && soundType === 'water' ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
              </button>
            </div>

            {soundPlaying && (
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleVolumeChange(soundVolume === 0 ? 0.3 : 0)}
                  className="text-slate-400 hover:text-white"
                >
                  {soundVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={soundVolume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full accent-indigo-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => {
                    soundSynth.stop();
                    setSoundPlaying(false);
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 whitespace-nowrap"
                >
                  Couper
                </button>
              </div>
            )}
          </div>

          {/* Quick Relief Checklist for Crisis */}
          <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-2.5">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Gestes réflexes recommandés
            </h3>
            <div className="space-y-2">
              {[
                { key: 'dark_room', text: 'S’allonger dans une pièce plongée dans le noir absolu' },
                { key: 'cold_compress', text: 'Appliquer un masque ou une compresse froide sur le front/nuque' },
                { key: 'water', text: 'Boire un grand verre d’eau fraîche à petites gorgées' },
                { key: 'jaw_relax', text: 'Déserrer les dents et baisser les épaules pour libérer le cou' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key] || false}
                    onChange={(e) => setChecklist({ ...checklist, [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded text-rose-500 focus:ring-rose-500/20 bg-slate-800 border-slate-700"
                  />
                  <span className={`text-xs ${checklist[item.key] ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                    {item.text}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
