import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Pill,
  Zap,
  Calendar as CalendarIcon,
  List,
  Edit2,
  CheckCircle
} from 'lucide-react';
import { MigraineRecord } from '../types/migraine';
import { HEAD_LOCATIONS } from '../data/initialData';

interface CalendarViewProps {
  records: MigraineRecord[];
  onOpenNewCrisis: (defaultDate?: string) => void;
  onEditCrisis: (record: MigraineRecord) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  records,
  onOpenNewCrisis,
  onEditCrisis,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date('2026-10-14'));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-10-12');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [listFilter, setListFilter] = useState<'all' | 'severe' | 'moderate' | 'mild'>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar calculations
  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Starting day index in Monday-first format (0 = Monday, 6 = Sunday)
  let startingDay = firstDayOfMonth.getDay() - 1;
  if (startingDay < 0) startingDay = 6;

  // Filter records for this month
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const thisMonthRecords = records.filter((r) => r.startDate.startsWith(monthPrefix));

  // Map by YYYY-MM-DD
  const recordsByDay = records.reduce<Record<string, MigraineRecord[]>>((acc, rec) => {
    const dayStr = rec.startDate.slice(0, 10);
    if (!acc[dayStr]) acc[dayStr] = [];
    acc[dayStr].push(rec);
    return acc;
  }, {});

  const selectedDayRecords = selectedDateStr ? recordsByDay[selectedDateStr] || [] : [];

  const getIntensityBadgeClass = (score: number) => {
    if (score <= 3) return 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    if (score <= 6) return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
    if (score <= 8) return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    return 'bg-red-600/30 text-red-200 border border-red-500/60 font-bold';
  };

  const formatDuration = (startIso: string, endIso?: string, inProgress?: boolean) => {
    if (inProgress) return 'En cours...';
    if (!endIso) return 'Durée non précisée';
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const diffMins = Math.max(0, Math.round((end - start) / 60000));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h === 0) return `${m} min`;
    return `${h}h${m > 0 ? ` ${m}m` : ''}`;
  };

  return (
    <div className="space-y-4">
      {/* View Switcher & Month Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-white capitalize tabular-nums">
              {monthNames[month]} {year}
            </h2>
            <button
              type="button"
              onClick={handleNextMonth}
              className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('calendar')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'calendar'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Grille</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`min-h-[36px] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'list'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Liste</span>
            </button>
          </div>
        </div>

        {/* Quick Month Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center">
          <div className="p-2 rounded-xl bg-slate-950/60">
            <span className="text-lg font-bold text-rose-400 tabular-nums">
              {thisMonthRecords.length}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Crises ce mois</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60">
            <span className="text-lg font-bold text-emerald-400 tabular-nums">
              {Math.max(0, daysInMonth - thisMonthRecords.length)}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Jours sans douleur</p>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60">
            <span className="text-lg font-bold text-amber-400 tabular-nums">
              {thisMonthRecords.length > 0
                ? (
                    thisMonthRecords.reduce((acc, r) => acc + r.intensity, 0) /
                    thisMonthRecords.length
                  ).toFixed(1)
                : '0'}
              /10
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Intensité moy.</p>
          </div>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <>
          {/* Calendar Table Grid */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            {/* Day of Week headers */}
            <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400 py-1">
              <span>Lun</span>
              <span>Mar</span>
              <span>Mer</span>
              <span>Jeu</span>
              <span>Ven</span>
              <span>Sam</span>
              <span>Dim</span>
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1.5">
              {/* Empty offset slots */}
              {Array.from({ length: startingDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-14 sm:h-16 rounded-xl bg-slate-950/20" />
              ))}

              {/* Real month days */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                const dayRecords = recordsByDay[dayStr] || [];
                const isSelected = selectedDateStr === dayStr;
                const isToday = dayStr === '2026-10-14';

                // Highest intensity on this day
                const maxIntensity = dayRecords.length > 0
                  ? Math.max(...dayRecords.map((r) => r.intensity))
                  : 0;

                return (
                  <button
                    key={dayStr}
                    type="button"
                    onClick={() => setSelectedDateStr(dayStr)}
                    className={`h-14 sm:h-16 p-1.5 rounded-xl border flex flex-col justify-between items-center transition-all relative ${
                      isSelected
                        ? 'border-rose-500 bg-rose-500/10 shadow-sm ring-1 ring-rose-500/50'
                        : isToday
                        ? 'border-slate-600 bg-slate-800/80'
                        : 'border-slate-800/80 bg-slate-950/70 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <span
                      className={`text-xs font-semibold tabular-nums ${
                        isToday ? 'text-rose-400 font-bold' : isSelected ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {/* Indicator markers */}
                    {dayRecords.length > 0 ? (
                      <div className="w-full flex justify-center items-center gap-0.5">
                        {dayRecords.map((r) => (
                          <span
                            key={r.id}
                            className={`w-2.5 h-2.5 rounded-full ${
                              r.inProgress
                                ? 'bg-rose-500 animate-ping'
                                : r.intensity >= 7
                                ? 'bg-rose-500'
                                : r.intensity >= 5
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            title={`Intensité ${r.intensity}/10`}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="w-1 h-1 rounded-full bg-slate-800" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Intensity Legend */}
            <div className="pt-2 flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Légère (1-4)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Modérée (5-6)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Sévère (7-10)
              </span>
            </div>
          </div>

          {/* Selected Day Details Panel */}
          {selectedDateStr && (
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white capitalize">
                    {new Date(selectedDateStr + 'T12:00:00').toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedDayRecords.length === 0
                      ? 'Aucune crise enregistrée (Jour sain)'
                      : `${selectedDayRecords.length} crise${selectedDayRecords.length > 1 ? 's' : ''} ce jour`}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenNewCrisis(selectedDateStr)}
                  className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ajouter crise
                </button>
              </div>

              {selectedDayRecords.length > 0 ? (
                <div className="space-y-3 pt-1">
                  {selectedDayRecords.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${getIntensityBadgeClass(
                              record.intensity
                            )}`}
                          >
                            EVA {record.intensity}/10
                          </span>
                          <span className="text-xs font-medium text-slate-200">
                            {record.inProgress ? (
                              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                Crise en cours
                              </span>
                            ) : (
                              `${formatDuration(record.startDate, record.endDate)} de crise`
                            )}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => onEditCrisis(record)}
                          className="min-h-[36px] min-w-[36px] rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                          title="Modifier cette crise"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Time and Locations */}
                      <div className="text-xs text-slate-300 space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-rose-400" />
                          <span>
                            {new Date(record.startDate).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {record.endDate &&
                              ` à ${new Date(record.endDate).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}`}
                          </span>
                        </div>

                        {record.locations.length > 0 && (
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {record.locations
                                .map((locId) => HEAD_LOCATIONS.find((h) => h.id === locId)?.short || locId)
                                .join(' · ')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Medications list */}
                      {record.medications.length > 0 && (
                        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                            <Pill className="w-3 h-3 text-emerald-400" />
                            Traitements pris :
                          </span>
                          {record.medications.map((m) => (
                            <div key={m.id} className="text-slate-300 flex justify-between">
                              <span>
                                {m.name} ({m.dose}) à {m.takenAt}
                              </span>
                              <span className="text-emerald-400 text-[11px]">
                                {m.relief === 'complete' && '✓ Soulagement'}
                                {m.relief === 'partial' && '≈ Partiel'}
                                {m.relief === 'none' && '✗ Inefficace'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Notes snippet */}
                      {record.notes && (
                        <p className="text-xs text-slate-400 italic bg-slate-900/30 p-2 rounded-lg">
                          « {record.notes} »
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center space-y-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-white">Journée saine sans céphalée</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Aucune douleur ni prise médicamenteuse enregistrée pour cette date.
                    </p>
                  </div>
                  <div className="pt-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => onOpenNewCrisis(selectedDateStr)}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors border border-slate-700"
                    >
                      Consigner une crise rétrospectivement
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Chronological List View with Severity Filter */
        <div className="space-y-3">
          {/* Severity Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800 overflow-x-auto text-xs">
            <button
              type="button"
              onClick={() => setListFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                listFilter === 'all' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Toutes ({records.length})
            </button>
            <button
              type="button"
              onClick={() => setListFilter('severe')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                listFilter === 'severe' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sévères ≥7 ({records.filter((r) => r.intensity >= 7).length})
            </button>
            <button
              type="button"
              onClick={() => setListFilter('moderate')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                listFilter === 'moderate' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Modérées 4-6 ({records.filter((r) => r.intensity >= 4 && r.intensity < 7).length})
            </button>
            <button
              type="button"
              onClick={() => setListFilter('mild')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                listFilter === 'mild' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Légères ≤3 ({records.filter((r) => r.intensity <= 3).length})
            </button>
          </div>

          {records.filter((r) => {
            if (listFilter === 'severe') return r.intensity >= 7;
            if (listFilter === 'moderate') return r.intensity >= 4 && r.intensity < 7;
            if (listFilter === 'mild') return r.intensity <= 3;
            return true;
          }).length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 rounded-2xl bg-slate-900/50 border border-slate-800">
              Aucune crise correspondant au filtre sélectionné.
            </div>
          ) : (
            records
              .filter((r) => {
                if (listFilter === 'severe') return r.intensity >= 7;
                if (listFilter === 'moderate') return r.intensity >= 4 && r.intensity < 7;
                if (listFilter === 'mild') return r.intensity <= 3;
                return true;
              })
              .map((record) => (
                <div
                  key={record.id}
                  onClick={() => onEditCrisis(record)}
                  className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${getIntensityBadgeClass(
                        record.intensity
                      )}`}
                    >
                      EVA {record.intensity}/10
                    </span>

                    <span className="text-xs text-slate-400 tabular-nums">
                      {new Date(record.startDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="text-slate-200 font-medium">
                      {record.locations
                        .map((locId) => HEAD_LOCATIONS.find((h) => h.id === locId)?.label || locId)
                        .slice(0, 2)
                        .join(' · ')}
                    </div>
                    <div className="text-slate-400">
                      {formatDuration(record.startDate, record.endDate, record.inProgress)}
                    </div>
                  </div>

                  {record.medications.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Pill className="w-3 h-3 text-emerald-400" />
                      <span>
                        {record.medications.map((m) => m.name).join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
};
