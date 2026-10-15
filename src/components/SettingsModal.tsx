import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  Upload,
  RotateCcw,
  User,
  Shield,
  Info,
  Sunset,
  Sunrise,
  Moon,
  Sun,
  FileJson,
  Copy,
  Check,
  CheckCircle,
  AlertCircle,
  Database,
  Layers
} from 'lucide-react';
import { MigraineRecord, PreventiveMedication, UserPreferences } from '../types/migraine';
import { getSunScheduleStatus } from '../utils/sunSchedule';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MigraineRecord[];
  preventives: PreventiveMedication[];
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onRestoreData: (records: MigraineRecord[], preventives: PreventiveMedication[]) => void;
  onResetToDemo: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  records,
  preventives,
  preferences,
  onUpdatePreferences,
  onRestoreData,
  onResetToDemo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [importNotice, setImportNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');

  if (!isOpen) return null;

  // Build the rich, standardized clinical JSON dataset
  const generateExportPayload = () => {
    // Basic date boundaries
    const sortedDates = [...records].map((r) => r.startDate).sort();
    const earliestDate = sortedDates[0] || null;
    const latestDate = sortedDates[sortedDates.length - 1] || null;

    // Trigger distribution analytics snapshot for external analysis
    const triggerStats: Record<string, number> = {};
    records.forEach((r) => {
      r.triggers.forEach((t) => {
        triggerStats[t] = (triggerStats[t] || 0) + 1;
      });
    });

    // Medication response snapshot
    const medicationStats: Record<string, { total: number; complete: number; partial: number }> = {};
    records.forEach((r) => {
      r.medications.forEach((m) => {
        if (!medicationStats[m.name]) {
          medicationStats[m.name] = { total: 0, complete: 0, partial: 0 };
        }
        medicationStats[m.name].total += 1;
        if (m.relief === 'complete') medicationStats[m.name].complete += 1;
        if (m.relief === 'partial') medicationStats[m.name].partial += 1;
      });
    });

    const avgIntensity = records.length > 0
      ? parseFloat((records.reduce((acc, r) => acc + r.intensity, 0) / records.length).toFixed(2))
      : 0;

    return {
      metadata: {
        application: 'Céphaleia - Suivi des Migraines',
        version: '1.2.0',
        format: 'CEPHALEIA_CLINICAL_DATA_JSON',
        exportedAt: new Date().toISOString(),
        totalCrisesCount: records.length,
        totalPreventiveMedicationsCount: preventives.length,
        dateRange: {
          from: earliestDate,
          to: latestDate,
        },
      },
      patientProfile: {
        userName: preferences.userName,
        neurologistName: preferences.neurologistName || '',
        neurologistEmail: preferences.neurologistEmail || '',
        autoPhotophobiaSunset: preferences.autoPhotophobiaSunset ?? true,
        sunsetHour: preferences.sunsetHour || '19:30',
        sunriseHour: preferences.sunriseHour || '07:00',
        reminders: preferences.reminders,
      },
      analyticsSnapshot: {
        averageIntensityEVA: avgIntensity,
        triggerFrequencyRanking: triggerStats,
        medicationEfficacySummary: medicationStats,
      },
      records: records,
      preventives: preventives,
    };
  };

  const handleExportJSON = () => {
    const payload = generateExportPayload();
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanPatient = (preferences.userName || 'patient').replace(/[^a-zA-Z0-9_-]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `cephaleia_sauvegarde_complete_${cleanPatient}_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    const payload = generateExportPayload();
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopiedJSON(true);
    setTimeout(() => setCopiedJSON(false), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        // Flexible support for direct array or wrapped metadata format
        let importedRecords: MigraineRecord[] = [];
        let importedPreventives: PreventiveMedication[] = [];

        if (Array.isArray(parsed.records)) {
          importedRecords = parsed.records;
        } else if (Array.isArray(parsed)) {
          importedRecords = parsed;
        } else {
          throw new Error('Le fichier ne contient aucun tableau de crises valide.');
        }

        if (Array.isArray(parsed.preventives)) {
          importedPreventives = parsed.preventives;
        }

        if (importMode === 'replace') {
          // Replace completely
          onRestoreData(importedRecords, importedPreventives);
          if (parsed.patientProfile) {
            onUpdatePreferences({
              ...preferences,
              ...parsed.patientProfile,
            });
          }
          setImportNotice({
            type: 'success',
            message: `Restauration complète réussie : ${importedRecords.length} crises et ${importedPreventives.length} traitements restaurés.`,
          });
        } else {
          // Merge mode (preserve existing records, avoid duplicating IDs)
          const existingIds = new Set(records.map((r) => r.id));
          const newRecords = importedRecords.filter((r) => !existingIds.has(r.id));
          const mergedRecords = [...newRecords, ...records];

          const existingPrevNames = new Set(preventives.map((p) => p.name.toLowerCase()));
          const newPreventives = importedPreventives.filter((p) => !existingPrevNames.has(p.name.toLowerCase()));
          const mergedPreventives = [...preventives, ...newPreventives];

          onRestoreData(mergedRecords, mergedPreventives);
          setImportNotice({
            type: 'success',
            message: `Fusion réussie : ${newRecords.length} nouvelle(s) crise(s) ajoutée(s) (${mergedRecords.length} au total).`,
          });
        }

        // Reset file input
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err: any) {
        console.error('Import error', err);
        setImportNotice({
          type: 'error',
          message: err?.message || 'Fichier JSON non valide ou corrompu.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 text-slate-100 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-tight">Paramètres & Données</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-indigo-400" />
            Profil Patient & Praticien
          </h3>

          <div className="space-y-2 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Votre prénom ou nom</label>
              <input
                type="text"
                value={preferences.userName}
                onChange={(e) => onUpdatePreferences({ ...preferences, userName: e.target.value })}
                className="w-full min-h-[40px] px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Nom du neurologue / médecin</label>
              <input
                type="text"
                value={preferences.neurologistName || ''}
                placeholder="Ex: Dr. Martin, Centre anti-douleur"
                onChange={(e) => onUpdatePreferences({ ...preferences, neurologistName: e.target.value })}
                className="w-full min-h-[40px] px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Email du neurologue (pour export PDF direct)</label>
              <input
                type="email"
                value={preferences.neurologistEmail || ''}
                placeholder="Ex: docteur.martin@neurologie.fr"
                onChange={(e) => onUpdatePreferences({ ...preferences, neurologistEmail: e.target.value })}
                className="w-full min-h-[40px] px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>
          </div>
        </div>

        {/* Photophobia Sun Synchronization Section */}
        {(() => {
          const sunset = preferences.sunsetHour || '19:30';
          const sunrise = preferences.sunriseHour || '07:00';
          const isAuto = preferences.autoPhotophobiaSunset ?? true;
          const status = getSunScheduleStatus(sunset, sunrise);

          return (
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sunset className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Protection Visuelle & Coucher du Soleil
                  </h3>
                </div>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAuto}
                    onChange={(e) =>
                      onUpdatePreferences({
                        ...preferences,
                        autoPhotophobiaSunset: e.target.checked,
                      })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
                </label>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Active automatiquement le filtre ambré anti-photophobie en soirée dès le crépuscule pour bloquer la lumière bleue et prévenir l’hyperexcitabilité corticale nocturne.
              </p>

              {/* Solar schedule settings */}
              <div
                className={`p-3.5 rounded-xl border transition-colors space-y-3 ${
                  isAuto ? 'bg-slate-900/90 border-amber-500/40' : 'bg-slate-900/40 border-slate-800/80 opacity-70'
                }`}
              >
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 flex items-center gap-1">
                      <Sunset className="w-3.5 h-3.5 text-amber-400" />
                      Coucher du soleil (Début)
                    </label>
                    <input
                      type="time"
                      disabled={!isAuto}
                      value={sunset}
                      onChange={(e) =>
                        onUpdatePreferences({
                          ...preferences,
                          sunsetHour: e.target.value,
                        })
                      }
                      className="w-full min-h-[38px] px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 text-[11px] mb-1 flex items-center gap-1">
                      <Sunrise className="w-3.5 h-3.5 text-amber-300" />
                      Lever du soleil (Fin)
                    </label>
                    <input
                      type="time"
                      disabled={!isAuto}
                      value={sunrise}
                      onChange={(e) =>
                        onUpdatePreferences({
                          ...preferences,
                          sunriseHour: e.target.value,
                        })
                      }
                      className="w-full min-h-[38px] px-2.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-amber-500 disabled:opacity-40"
                    />
                  </div>
                </div>

                {isAuto && (
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-amber-300 font-medium">
                      {status.isNight ? <Moon className="w-3.5 h-3.5 text-amber-400" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
                      {status.statusLabel}
                    </span>
                    <span className="text-slate-400 text-[10.5px]">
                      {status.nextTransitionText}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* FULL JSON EXPORT & IMPORT SUITE */}
        <div className="space-y-3.5 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Export & Import JSON Complet
              </h3>
            </div>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {records.length} crises · {preventives.length} molécules
            </span>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            Exportez l’intégralité de votre historique clinique (crises, médicaments, EVA, auras, observance) sous forme de fichier JSON structuré pour une sauvegarde personnelle ou une analyse externe (Python, Pandas, R, recherche).
          </p>

          {/* Import notice toast */}
          {importNotice && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2 ${
                importNotice.type === 'success'
                  ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-700/60 text-rose-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {importNotice.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <span>{importNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setImportNotice(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Export Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/50 text-xs font-semibold text-emerald-200 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              Télécharger JSON
            </button>

            <button
              type="button"
              onClick={handleCopyJSON}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 flex items-center justify-center gap-2 transition-colors"
            >
              {copiedJSON ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedJSON ? 'JSON copié !' : 'Copier JSON brut'}</span>
            </button>
          </div>

          {/* Import Configuration Panel */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                Mode d’importation :
              </span>

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setImportMode('merge')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    importMode === 'merge'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                  title="Conserve les crises actuelles et ajoute les nouvelles"
                >
                  Fusionner
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('replace')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    importMode === 'replace'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                  title="Écrase l'historique par le fichier importé"
                >
                  Remplacer tout
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/50 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <Upload className="w-3.5 h-3.5 text-indigo-400" />
              Sélectionner un fichier JSON à importer
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />

            <p className="text-[10px] text-slate-400 text-center">
              {importMode === 'merge'
                ? 'Mode Fusion : combine sans écraser vos crises existantes.'
                : 'Mode Remplacement : restaure exactement l’état du fichier importé.'}
            </p>
          </div>

          {/* Reset button */}
          <button
            type="button"
            onClick={() => {
              if (confirm('Voulez-vous réinitialiser l’application avec les données de démonstration réalistes ?')) {
                onResetToDemo();
                setImportNotice({
                  type: 'success',
                  message: 'Données de démonstration cliniques rechargées avec succès.',
                });
              }
            }}
            className="w-full min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Recharger données de démonstration cliniques
          </button>
        </div>

        {/* Medical Disclaimer */}
        <div className="p-3.5 rounded-xl bg-slate-900/40 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p>
            Cette application est un outil d'auto-mesure et de tenue de journal. Elle ne se substitue pas à une consultation médicale. En cas de céphalée inhabituelle brutale dite "en coup de tonnerre", contactez immédiatement le 15 (SAMU).
          </p>
        </div>
      </div>
    </div>
  );
};
