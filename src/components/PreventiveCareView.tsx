import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Check,
  Calendar,
  Sparkles,
  Info,
  Trash2,
  Clock,
  Heart,
  Bell,
  BellRing,
  Moon,
  Pill,
  Send,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { PreventiveMedication, DailyReminders } from '../types/migraine';

interface PreventiveCareViewProps {
  preventives: PreventiveMedication[];
  onToggleToday: (medId: string, dateStr: string) => void;
  onAddPreventive: (med: PreventiveMedication) => void;
  onRemovePreventive: (medId: string) => void;
  reminders?: DailyReminders;
  onUpdateReminders?: (reminders: DailyReminders) => void;
  onOpenNewCrisis?: () => void;
}

export const PreventiveCareView: React.FC<PreventiveCareViewProps> = ({
  preventives,
  onToggleToday,
  onAddPreventive,
  onRemovePreventive,
  reminders = {
    preventiveReminderEnabled: true,
    preventiveReminderTime: '08:30',
    eveningCheckinEnabled: true,
    eveningCheckinTime: '21:00',
  },
  onUpdateReminders,
  onOpenNewCrisis,
}) => {
  const todayStr = '2026-10-14';
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newFrequency, setNewFrequency] = useState('1 comprimé le matin');
  const [notificationToast, setNotificationToast] = useState<{
    type: 'preventive' | 'evening';
    title: string;
    message: string;
  } | null>(null);

  // Local copy of reminders
  const [currentReminders, setCurrentReminders] = useState<DailyReminders>(reminders);

  const handleUpdate = (updated: DailyReminders) => {
    setCurrentReminders(updated);
    if (onUpdateReminders) {
      onUpdateReminders(updated);
    }
  };

  // Last 7 days dates
  const past7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date('2026-10-14');
    d.setDate(d.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString('fr-FR', { weekday: 'narrow' });
    const dayNum = d.getDate();
    return { iso, dayName, dayNum };
  });

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newMed: PreventiveMedication = {
      id: 'prev-' + Date.now(),
      name: newName.trim(),
      dosage: newDosage.trim() || 'Dose usuelle',
      frequency: newFrequency.trim() || 'Quotidien',
      logs: {
        [todayStr]: false,
      },
    };

    onAddPreventive(newMed);
    setNewName('');
    setNewDosage('');
    setShowAddModal(false);
  };

  // Test Notification Handler (Supports Web Notification API + In-App Notification Toast)
  const handleTestNotification = async (type: 'preventive' | 'evening') => {
    const isPreventive = type === 'preventive';
    const title = isPreventive
      ? '💊 Céphaleia : Rappel Traitement de Fond'
      : '🌙 Céphaleia : Bilan du soir / Journal';
    const message = isPreventive
      ? 'Avez-vous pris votre traitement prophylactique aujourd’hui ? Validez votre prise pour maintenir votre observance.'
      : 'Avez-vous ressenti des maux de tête aujourd’hui ? Prenez 1 minute pour noter votre journée ou confirmer une journée sans céphalée.';

    // Try web notification if available
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
        if (Notification.permission === 'granted') {
          new Notification(title, {
            body: message,
            icon: '/favicon.ico',
          });
        }
      } catch {
        // Fallback to in-app toast
      }
    }

    // Always show visible interactive in-app toast for test feedback
    setNotificationToast({ type, title, message });
    setTimeout(() => {
      setNotificationToast((prev) => (prev?.type === type ? null : prev));
    }, 7000);
  };

  const allTakenToday = preventives.length > 0 && preventives.every((m) => m.logs[todayStr]);

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950/40 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Traitement de Fond & Prévention
              </h2>
              <p className="text-xs text-slate-400">
                Suivi de l'observance thérapeutique quotidienne
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter molécule
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          La régularité du traitement de fond est la clé pour espacer et atténuer la sévérité des crises de migraine au long cours.
        </p>
      </div>

      {/* In-App Live Notification Toast Banner when testing or triggered */}
      {notificationToast && (
        <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-700/80 text-white shadow-xl space-y-2 animate-breathe">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400 animate-bounce" />
              <span className="text-xs font-bold text-white">{notificationToast.title}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotificationToast(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Fermer
            </button>
          </div>

          <p className="text-xs text-indigo-200">{notificationToast.message}</p>

          <div className="pt-1 flex gap-2">
            {notificationToast.type === 'preventive' ? (
              <button
                type="button"
                onClick={() => {
                  preventives.forEach((m) => {
                    if (!m.logs[todayStr]) onToggleToday(m.id, todayStr);
                  });
                  setNotificationToast(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Tout marquer comme pris aujourd’hui
              </button>
            ) : (
              <>
                {onOpenNewCrisis && (
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationToast(null);
                      onOpenNewCrisis();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors"
                  >
                    Enregistrer une crise
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    alert('Bravo ! Journée saine sans céphalée enregistrée.');
                    setNotificationToast(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                >
                  Confirmer : Journée sans crise
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* RAPPELS QUOTIDIENS CONFIGURATION SECTION */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Rappels Quotidiens Automatiques
              </h3>
              <p className="text-xs text-slate-400">
                Ne manquez aucune prise de traitement ni aucun enregistrement de fin de journée
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* Rappel 1: Traitement de Fond */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              currentReminders.preventiveReminderEnabled
                ? 'bg-slate-950/80 border-indigo-500/50'
                : 'bg-slate-950/40 border-slate-800 opacity-70'
            } space-y-3`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Rappel Traitement de Fond</h4>
                  <p className="text-[11px] text-slate-400">Pour la prise quotidienne régulière</p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={currentReminders.preventiveReminderEnabled}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentReminders,
                      preventiveReminderEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600" />
              </label>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Heure de rappel :</span>
              <input
                type="time"
                disabled={!currentReminders.preventiveReminderEnabled}
                value={currentReminders.preventiveReminderTime}
                onChange={(e) =>
                  handleUpdate({
                    ...currentReminders,
                    preventiveReminderTime: e.target.value,
                  })
                }
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Statut :{' '}
                <span className={allTakenToday ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                  {allTakenToday ? '✓ Pris aujourd’hui' : 'En attente pour aujourd’hui'}
                </span>
              </span>

              <button
                type="button"
                onClick={() => handleTestNotification('preventive')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Tester l'alerte
              </button>
            </div>
          </div>

          {/* Rappel 2: Enregistrement du Soir */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              currentReminders.eveningCheckinEnabled
                ? 'bg-slate-950/80 border-rose-500/50'
                : 'bg-slate-950/40 border-slate-800 opacity-70'
            } space-y-3`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-white">Rappel Journal du Soir</h4>
                  <p className="text-[11px] text-slate-400">Ne pas oublier de noter chaque soir</p>
                </div>
              </div>

              {/* Toggle switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={currentReminders.eveningCheckinEnabled}
                  onChange={(e) =>
                    handleUpdate({
                      ...currentReminders,
                      eveningCheckinEnabled: e.target.checked,
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-600" />
              </label>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Heure de rappel :</span>
              <input
                type="time"
                disabled={!currentReminders.eveningCheckinEnabled}
                value={currentReminders.eveningCheckinTime}
                onChange={(e) =>
                  handleUpdate({
                    ...currentReminders,
                    eveningCheckinTime: e.target.value,
                  })
                }
                className="px-2.5 py-1 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white font-medium focus:outline-none focus:border-rose-500 disabled:opacity-40"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Permet d’éviter les oublis rétrospectifs
              </span>

              <button
                type="button"
                onClick={() => handleTestNotification('evening')}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                Tester l'alerte
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List of Preventive Medications */}
      <div className="space-y-3">
        {preventives.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
            Aucun traitement de fond configuré. Cliquez sur « Ajouter molécule » pour démarrer le suivi (bêta-bloquant, antiépileptique, magnésium, etc.).
          </div>
        ) : (
          preventives.map((med) => {
            const isTakenToday = !!med.logs[todayStr];
            
            // Calculate 7-day adherence
            const takenCount7d = past7Days.filter((d) => med.logs[d.iso]).length;
            const adherenceRate7d = Math.round((takenCount7d / 7) * 100);

            return (
              <div
                key={med.id}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{med.name}</h3>
                    <div className="text-xs text-slate-400">
                      {med.dosage} · {med.frequency}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleToday(med.id, todayStr)}
                      className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                        isTakenToday
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Check className={`w-4 h-4 ${isTakenToday ? 'text-white' : 'text-slate-500'}`} />
                      <span>{isTakenToday ? 'Pris aujourd’hui' : 'Marquer comme pris'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Supprimer ${med.name} de vos traitements de fond ?`)) {
                          onRemovePreventive(med.id);
                        }
                      }}
                      className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 7-Days Adherence Strip */}
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span>Observance sur 7 jours :</span>
                    <span className="font-semibold text-emerald-400 tabular-nums">
                      {adherenceRate7d}% ({takenCount7d}/7 j)
                    </span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5 text-center">
                    {past7Days.map((d) => {
                      const taken = !!med.logs[d.iso];
                      const isToday = d.iso === todayStr;
                      return (
                        <button
                          key={d.iso}
                          type="button"
                          onClick={() => onToggleToday(med.id, d.iso)}
                          className={`py-1.5 rounded-lg border text-xs flex flex-col items-center justify-center transition-colors ${
                            taken
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          } ${isToday ? 'ring-1 ring-indigo-400' : ''}`}
                        >
                          <span className="text-[10px] uppercase font-semibold">{d.dayName}</span>
                          <span className="text-xs tabular-nums mt-0.5">{d.dayNum}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Prevention Guidelines & Lifestyle Rules Card */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-rose-400" />
          Règles d'hygiène de vie antimigraineuse
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Régularité des rythmes de sommeil :</strong> Le cerveau migraineux déteste les variations. Conservez les mêmes horaires de coucher et lever, même le week-end.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Hydratation constante :</strong> Buvez au moins 1,5L d'eau par jour. La déshydratation minime est l'un des premiers déclencheurs silencieux.
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Repas à heures fixes :</strong> Évitez les jeûnes prolongés qui induisent des chutes brutales de glycémie déclenchant les céphalées.
            </div>
          </div>
        </div>
      </div>

      {/* Add Molecule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white">Nouveau traitement de fond</h3>
            <form onSubmit={handleSaveNew} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Nom du médicament ou complément
                </label>
                <input
                  type="text"
                  required
                  placeholder="ex: Propranolol, Amitriptyline, Magnésium..."
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Dosage</label>
                <input
                  type="text"
                  placeholder="ex: 40 mg, 1 gélule, 10 gouttes..."
                  value={newDosage}
                  onChange={(e) => setNewDosage(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Fréquence & Moment</label>
                <input
                  type="text"
                  placeholder="ex: 1x par jour au coucher"
                  value={newFrequency}
                  onChange={(e) => setNewFrequency(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="min-h-[44px] px-4 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="min-h-[44px] px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
