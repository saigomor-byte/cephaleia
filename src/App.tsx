/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Moon,
  Sun,
  Settings,
  Plus,
  Clock,
  Sparkles,
  HeartPulse,
  Sunset,
  Smartphone
} from 'lucide-react';
import { MigraineRecord, PreventiveMedication, UserPreferences } from './types/migraine';
import { SEED_MIGRAINES, SEED_PREVENTIVES } from './data/initialData';
import { isNightTime } from './utils/sunSchedule';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { PreventiveCareView } from './components/PreventiveCareView';
import { CrisisSOSModal } from './components/CrisisSOSModal';
import { MigraineFormModal } from './components/MigraineFormModal';
import { MedicalReportModal } from './components/MedicalReportModal';
import { SettingsModal } from './components/SettingsModal';
import { HomeScreenWidgetModal } from './components/HomeScreenWidgetModal';
import { FloatingCrisisWidget } from './components/FloatingCrisisWidget';
import { BottomNav, NavTab } from './components/BottomNav';

const STORAGE_KEY_RECORDS = 'cephaleia_migraine_records_v1';
const STORAGE_KEY_PREVENTIVES = 'cephaleia_preventives_v1';
const STORAGE_KEY_PREFS = 'cephaleia_preferences_v1';

export default function App() {
  // Initialize state with LocalStorage or seeds
  const [records, setRecords] = useState<MigraineRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECORDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_MIGRAINES;
  });

  const [preventives, setPreventives] = useState<PreventiveMedication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREVENTIVES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return SEED_PREVENTIVES;
  });

  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PREFS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      userName: 'Camille',
      neurologistName: 'Dr. V. Leroux (Neurologue)',
      photophobiaMode: false,
      soundType: 'brown',
      screenDimLevel: 0,
      reminders: {
        preventiveReminderEnabled: true,
        preventiveReminderTime: '08:30',
        eveningCheckinEnabled: true,
        eveningCheckinTime: '21:00',
      },
      autoPhotophobiaSunset: true,
      sunsetHour: '19:30',
      sunriseHour: '07:00',
    };
  });

  // Automatic solar synchronization for photophobia protection
  useEffect(() => {
    if (!preferences.autoPhotophobiaSunset) return;

    const checkSolarSchedule = () => {
      const night = isNightTime(
        preferences.sunsetHour || '19:30',
        preferences.sunriseHour || '07:00'
      );
      if (night !== preferences.photophobiaMode) {
        setPreferences((prev) => ({
          ...prev,
          photophobiaMode: night,
        }));
      }
    };

    checkSolarSchedule();
    const timer = setInterval(checkSolarSchedule, 30000); // Check every 30 seconds
    return () => clearInterval(timer);
  }, [
    preferences.autoPhotophobiaSunset,
    preferences.sunsetHour,
    preferences.sunriseHour,
    preferences.photophobiaMode,
  ]);

  // Current active navigation tab
  const [currentTab, setCurrentTab] = useState<NavTab>('calendar');

  // Modal controls
  const [isCrisisModalOpen, setIsCrisisModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MigraineRecord | null>(null);
  const [formDefaultDate, setFormDefaultDate] = useState<string | undefined>(undefined);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
  const [isFloatingWidgetActive, setIsFloatingWidgetActive] = useState(true);

  // Active crisis in progress
  const activeCrisis = records.find((r) => r.inProgress) || null;

  // Handle URL shortcut actions on launch (e.g. ?action=sos or ?action=new_crisis)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'sos') {
        setIsCrisisModalOpen(true);
      } else if (action === 'new_crisis') {
        setEditingRecord(null);
        setIsFormModalOpen(true);
      } else if (action === 'preventive') {
        setCurrentTab('preventive');
      } else if (action === 'widget') {
        setIsWidgetModalOpen(true);
      }

      if (action) {
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records));
    } catch {
      // storage full or disabled
    }
  }, [records]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREVENTIVES, JSON.stringify(preventives));
    } catch {
      // storage full or disabled
    }
  }, [preventives]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(preferences));
    } catch {
      // storage full or disabled
    }
  }, [preferences]);

  // Handle Escape key to close any active modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isWidgetModalOpen) setIsWidgetModalOpen(false);
        else if (isFormModalOpen) setIsFormModalOpen(false);
        else if (isReportModalOpen) setIsReportModalOpen(false);
        else if (isSettingsModalOpen) setIsSettingsModalOpen(false);
        else if (isCrisisModalOpen) setIsCrisisModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWidgetModalOpen, isFormModalOpen, isReportModalOpen, isSettingsModalOpen, isCrisisModalOpen]);

  // Tab change handlers
  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'sos') {
      setIsCrisisModalOpen(true);
    } else {
      setCurrentTab(tab);
    }
  };

  // Record actions
  const handleSaveRecord = (record: MigraineRecord) => {
    setRecords((prev) => {
      const index = prev.findIndex((r) => r.id === record.id);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = record;
        return updated;
      }
      return [record, ...prev];
    });
  };

  const handleDeleteRecord = (id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOpenNewCrisis = (defaultDate?: string) => {
    setEditingRecord(null);
    setFormDefaultDate(defaultDate);
    setIsFormModalOpen(true);
  };

  const handleEditCrisis = (record: MigraineRecord) => {
    setEditingRecord(record);
    setFormDefaultDate(undefined);
    setIsFormModalOpen(true);
  };

  // SOS Crisis handlers
  const handleStartCrisisNow = (intensity = 7) => {
    const newRecord: MigraineRecord = {
      id: 'mig-' + Date.now(),
      startDate: new Date().toISOString().slice(0, 16),
      inProgress: true,
      intensity,
      locations: ['temporal_right'],
      painTypes: ['pulsatile'],
      auras: ['none'],
      symptoms: ['photophobia'],
      triggers: [],
      medications: [],
      nonPharmaRemedies: ['dark_room'],
      impactOnDay: 'severe',
      notes: 'Crise déclenchée en mode direct SOS.',
    };
    handleSaveRecord(newRecord);
  };

  const handleEndCrisis = (updatedRecord: MigraineRecord) => {
    handleSaveRecord(updatedRecord);
  };

  const handleUpdateActiveCrisis = (record: MigraineRecord) => {
    handleSaveRecord(record);
  };

  // Preventive actions
  const handleToggleTodayPreventive = (medId: string, dateStr: string) => {
    setPreventives((prev) =>
      prev.map((med) => {
        if (med.id === medId) {
          const current = !!med.logs[dateStr];
          return {
            ...med,
            logs: {
              ...med.logs,
              [dateStr]: !current,
            },
          };
        }
        return med;
      })
    );
  };

  const handleAddPreventive = (newMed: PreventiveMedication) => {
    setPreventives((prev) => [...prev, newMed]);
  };

  const handleRemovePreventive = (medId: string) => {
    setPreventives((prev) => prev.filter((m) => m.id !== medId));
  };

  const handleResetToDemo = () => {
    setRecords(SEED_MIGRAINES);
    setPreventives(SEED_PREVENTIVES);
    setPreferences({
      userName: 'Camille',
      neurologistName: 'Dr. V. Leroux (Neurologue)',
      photophobiaMode: false,
      soundType: 'brown',
      screenDimLevel: 0,
    });
  };

  const togglePhotophobiaMode = () => {
    setPreferences((prev) => ({
      ...prev,
      photophobiaMode: !prev.photophobiaMode,
    }));
  };

  return (
    <div
      className={`min-h-full flex flex-col transition-colors duration-300 ${
        preferences.photophobiaMode
          ? 'bg-amber-950/90 text-amber-100 selection:bg-amber-800'
          : 'bg-slate-950 text-slate-100 selection:bg-rose-500/30'
      }`}
    >
      {/* Top Bar adhering to Top Bar Contract: Brand zone, clean navigation, single action */}
      <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <HeartPulse className="w-4 h-4" />
          </div>
          <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
            Céphaleia
          </span>
        </div>

        {/* Zone 2: Navigation Links for desktop/tablet */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => setCurrentTab('calendar')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'calendar' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Journal & Calendrier
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('preventive')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'preventive' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Traitements de fond
          </button>
          <button
            type="button"
            onClick={() => setCurrentTab('analytics')}
            className={`transition-colors whitespace-nowrap ${
              currentTab === 'analytics' ? 'text-white font-semibold' : 'hover:text-white'
            }`}
          >
            Bilan Clinique & CAM
          </button>
        </nav>

        {/* Zone 3: Primary Action & Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Photophobia Warm Dimmer Toggle */}
          <button
            type="button"
            onClick={togglePhotophobiaMode}
            title={
              preferences.photophobiaMode
                ? 'Désactiver le filtre photophobie'
                : 'Activer le filtre anti-éblouissement photophobie'
            }
            className={`min-h-[40px] px-2.5 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              preferences.photophobiaMode
                ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {preferences.photophobiaMode ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  Anti-éblouissement {preferences.autoPhotophobiaSunset && '(Auto 🌙)'}
                </span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">
                  Mode Tamisé {preferences.autoPhotophobiaSunset && '(Auto)'}
                </span>
              </>
            )}
          </button>

          {/* Home Screen Widget Guide & Preview Trigger */}
          <button
            type="button"
            onClick={() => setIsWidgetModalOpen(true)}
            title="Widget écran d’accueil & accès 1-tap"
            className="min-h-[40px] px-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Widget 1-Tap</span>
          </button>

          {/* Quick SOS Trigger Button in Header */}
          <button
            type="button"
            onClick={() => setIsCrisisModalOpen(true)}
            className="min-h-[40px] px-3.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>SOS Crise</span>
          </button>

          {/* Settings Trigger */}
          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="min-h-[40px] min-w-[40px] rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            title="Paramètres et sauvegarde"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Persistent In-Progress Attack Banner */}
      {activeCrisis && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2.5 flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="font-semibold text-white">Crise en cours :</span>
            <span>
              Début {new Date(activeCrisis.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · EVA {activeCrisis.intensity}/10
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsCrisisModalOpen(true)}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-sm transition-colors"
          >
            Gérer la crise
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 pb-24 sm:pb-28">
        {currentTab === 'calendar' && (
          <CalendarView
            records={records}
            onOpenNewCrisis={handleOpenNewCrisis}
            onEditCrisis={handleEditCrisis}
          />
        )}

        {currentTab === 'preventive' && (
          <PreventiveCareView
            preventives={preventives}
            onToggleToday={handleToggleTodayPreventive}
            onAddPreventive={handleAddPreventive}
            onRemovePreventive={handleRemovePreventive}
            reminders={preferences.reminders}
            onUpdateReminders={(updatedReminders) => {
              setPreferences((prev) => ({ ...prev, reminders: updatedReminders }));
            }}
            onOpenNewCrisis={() => handleOpenNewCrisis()}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            records={records}
            onOpenReportModal={() => setIsReportModalOpen(true)}
            onNavigateToCalendar={() => setCurrentTab('calendar')}
          />
        )}
      </main>

      {/* Floating Quick Crisis Widget (1-tap start and live tracker) */}
      {isFloatingWidgetActive && (
        <FloatingCrisisWidget
          activeCrisis={activeCrisis}
          onStartCrisisNow={handleStartCrisisNow}
          onOpenSOSModal={() => setIsCrisisModalOpen(true)}
          onFinishCrisis={() => {
            if (activeCrisis) {
              handleEndCrisis({
                ...activeCrisis,
                endDate: new Date().toISOString().slice(0, 16),
                inProgress: false,
              });
            }
          }}
          onOpenWidgetModal={() => setIsWidgetModalOpen(true)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        onOpenNewCrisis={() => handleOpenNewCrisis()}
        activeCrisisInProgress={!!activeCrisis}
      />

      {/* Modals */}
      <CrisisSOSModal
        isOpen={isCrisisModalOpen}
        onClose={() => setIsCrisisModalOpen(false)}
        activeCrisis={activeCrisis}
        onStartCrisis={handleStartCrisisNow}
        onEndCrisis={handleEndCrisis}
        onUpdateCrisis={handleUpdateActiveCrisis}
      />

      <MigraineFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveRecord}
        onDelete={handleDeleteRecord}
        initialRecord={editingRecord}
        defaultDate={formDefaultDate}
      />

      <MedicalReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        records={records}
        defaultPatientName={preferences.userName}
        defaultDoctorName={preferences.neurologistName || 'Dr. V. Leroux (Neurologue)'}
        defaultDoctorEmail={preferences.neurologistEmail || ''}
      />

      <HomeScreenWidgetModal
        isOpen={isWidgetModalOpen}
        onClose={() => setIsWidgetModalOpen(false)}
        activeCrisis={activeCrisis}
        onStartCrisisNow={handleStartCrisisNow}
        onOpenSOSModal={() => setIsCrisisModalOpen(true)}
        onFinishCrisis={() => {
          if (activeCrisis) {
            handleEndCrisis({
              ...activeCrisis,
              endDate: new Date().toISOString().slice(0, 16),
              inProgress: false,
            });
          }
        }}
        isFloatingWidgetActive={isFloatingWidgetActive}
        onToggleFloatingWidget={setIsFloatingWidgetActive}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        records={records}
        preventives={preventives}
        preferences={preferences}
        onUpdatePreferences={setPreferences}
        onRestoreData={(recs, prevs) => {
          setRecords(recs);
          setPreventives(prevs);
        }}
        onResetToDemo={handleResetToDemo}
      />
    </div>
  );
}
