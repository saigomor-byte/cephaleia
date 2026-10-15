import React from 'react';
import {
  Calendar,
  ShieldAlert,
  Activity,
  ShieldCheck,
  Plus
} from 'lucide-react';

export type NavTab = 'calendar' | 'preventive' | 'analytics' | 'sos';

interface BottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenNewCrisis: () => void;
  activeCrisisInProgress: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewCrisis,
  activeCrisisInProgress,
}) => {
  return (
    <nav
      aria-label="Navigation principale"
      className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 pb-safe"
    >
      <div className="max-w-md mx-auto px-2 grid grid-cols-5 items-center h-16">
        {/* Tab 1: Calendrier / Journal */}
        <button
          type="button"
          onClick={() => onSelectTab('calendar')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'calendar' ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Journal
          </span>
        </button>

        {/* Tab 2: Traitement de Fond */}
        <button
          type="button"
          onClick={() => onSelectTab('preventive')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'preventive' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Fond
          </span>
        </button>

        {/* Tab 3: Center Quick Add Button */}
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onOpenNewCrisis}
            aria-label="Enregistrer une crise"
            className="w-12 h-12 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 flex items-center justify-center transition-transform active:scale-95 -mt-3 ring-4 ring-slate-950"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Tab 4: SOS Crise Mode */}
        <button
          type="button"
          onClick={() => onSelectTab('sos')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors relative ${
            currentTab === 'sos' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShieldAlert className="w-5 h-5" />
            {activeCrisisInProgress && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            )}
          </div>
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            SOS Crise
          </span>
        </button>

        {/* Tab 5: Statistiques & Bilan */}
        <button
          type="button"
          onClick={() => onSelectTab('analytics')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors ${
            currentTab === 'analytics' ? 'text-rose-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px] font-medium tracking-tight mt-1 whitespace-nowrap">
            Bilan
          </span>
        </button>
      </div>
    </nav>
  );
};
