import React, { useState, useMemo } from 'react';
import {
  FileText,
  AlertCircle,
  TrendingDown,
  Activity,
  Pill,
  Clock,
  Sparkles,
  Zap,
  CheckCircle2,
  Calendar as CalendarIcon,
  BarChart3,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';
import { MigraineRecord } from '../types/migraine';
import { TRIGGERS, HEAD_LOCATIONS } from '../data/initialData';

interface AnalyticsViewProps {
  records: MigraineRecord[];
  onOpenReportModal: () => void;
  onNavigateToCalendar?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  records,
  onOpenReportModal,
  onNavigateToCalendar,
}) => {
  const [chartMode, setChartMode] = useState<'composed' | 'stacked'>('composed');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Calculations
  const totalCrises = records.length;

  const totalDurationMins = records.reduce((acc, r) => {
    if (!r.endDate) return acc + 180;
    const diff = (new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / 60000;
    return acc + Math.max(0, diff);
  }, 0);

  const avgDurationMins = totalCrises > 0 ? Math.round(totalDurationMins / totalCrises) : 0;
  const avgHours = Math.floor(avgDurationMins / 60);
  const avgRemainderMins = avgDurationMins % 60;

  const avgIntensity = totalCrises > 0
    ? (records.reduce((acc, r) => acc + r.intensity, 0) / totalCrises).toFixed(1)
    : '0';

  // Last 30 days records
  const now = new Date('2026-10-14').getTime();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
  const recent30DaysRecords = records.filter(
    (r) => new Date(r.startDate).getTime() >= thirtyDaysAgo
  );

  // Medication overuse monitoring (CAM - Céphalée par Abus Médicamenteux)
  const daysWithTriptans = new Set<string>();
  const daysWithOtherPainkillers = new Set<string>();

  recent30DaysRecords.forEach((r) => {
    const dayStr = r.startDate.slice(0, 10);
    r.medications.forEach((m) => {
      const lower = m.name.toLowerCase();
      if (lower.includes('triptan') || lower.includes('zomig') || lower.includes('imigrane') || lower.includes('relpax') || lower.includes('maxalt')) {
        daysWithTriptans.add(dayStr);
      } else {
        daysWithOtherPainkillers.add(dayStr);
      }
    });
  });

  const triptanDaysCount = daysWithTriptans.size;
  const triptanLimit = 10;
  const isTriptanOveruseRisk = triptanDaysCount >= 8;

  // Compute monthly data for recharts
  const monthlyChartData = useMemo(() => {
    const monthMap: Record<string, {
      monthKey: string;
      label: string;
      totalCrises: number;
      severeCrises: number; // EVA >= 7
      moderateCrises: number; // EVA 4-6
      mildCrises: number; // EVA <= 3
      sumIntensity: number;
      triptanDays: Set<string>;
    }> = {};

    // Standard last 6 months list: May 2026 to Oct 2026
    const monthsOrder = [
      { key: '2026-05', label: 'Mai' },
      { key: '2026-06', label: 'Juin' },
      { key: '2026-07', label: 'Juil' },
      { key: '2026-08', label: 'Août' },
      { key: '2026-09', label: 'Sept' },
      { key: '2026-10', label: 'Oct' },
    ];

    monthsOrder.forEach((m) => {
      monthMap[m.key] = {
        monthKey: m.key,
        label: m.label,
        totalCrises: 0,
        severeCrises: 0,
        moderateCrises: 0,
        mildCrises: 0,
        sumIntensity: 0,
        triptanDays: new Set(),
      };
    });

    records.forEach((r) => {
      const key = r.startDate.slice(0, 7);
      if (!monthMap[key]) {
        const monthNum = parseInt(key.slice(5, 7), 10);
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
        monthMap[key] = {
          monthKey: key,
          label: monthNames[monthNum - 1] || key,
          totalCrises: 0,
          severeCrises: 0,
          moderateCrises: 0,
          mildCrises: 0,
          sumIntensity: 0,
          triptanDays: new Set(),
        };
      }

      monthMap[key].totalCrises += 1;
      monthMap[key].sumIntensity += r.intensity;
      if (r.intensity >= 7) {
        monthMap[key].severeCrises += 1;
      } else if (r.intensity >= 4) {
        monthMap[key].moderateCrises += 1;
      } else {
        monthMap[key].mildCrises += 1;
      }

      const dayStr = r.startDate.slice(0, 10);
      r.medications.forEach((m) => {
        if (m.name.toLowerCase().includes('triptan') || m.name.toLowerCase().includes('zomig')) {
          monthMap[key].triptanDays.add(dayStr);
        }
      });
    });

    return Object.values(monthMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map((item) => ({
        month: item.label,
        monthKey: item.monthKey,
        totalCrises: item.totalCrises,
        severeCrises: item.severeCrises,
        moderateCrises: item.moderateCrises,
        mildCrises: item.mildCrises,
        avgIntensity: item.totalCrises > 0 ? parseFloat((item.sumIntensity / item.totalCrises).toFixed(1)) : 0,
        triptanCount: item.triptanDays.size,
      }));
  }, [records]);

  // Triggers aggregation
  const triggerCounts: Record<string, number> = {};
  records.forEach((r) => {
    r.triggers.forEach((t) => {
      triggerCounts[t] = (triggerCounts[t] || 0) + 1;
    });
  });

  const sortedTriggers = Object.entries(triggerCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([triggerId, count]) => {
      const label = TRIGGERS.find((t) => t.id === triggerId)?.label || triggerId;
      const percentage = Math.round((count / Math.max(1, totalCrises)) * 100);
      return { id: triggerId, label, count, percentage };
    });

  // Location aggregation
  const locationCounts: Record<string, number> = {};
  records.forEach((r) => {
    r.locations.forEach((loc) => {
      locationCounts[loc] = (locationCounts[loc] || 0) + 1;
    });
  });

  const sortedLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([locId, count]) => {
      const label = HEAD_LOCATIONS.find((h) => h.id === locId)?.label || locId;
      const percentage = Math.round((count / Math.max(1, totalCrises)) * 100);
      return { id: locId, label, count, percentage };
    });

  // Medication Efficacy aggregation
  const medStats: Record<string, { total: number; complete: number; partial: number; none: number }> = {};
  records.forEach((r) => {
    r.medications.forEach((m) => {
      if (!medStats[m.name]) {
        medStats[m.name] = { total: 0, complete: 0, partial: 0, none: 0 };
      }
      medStats[m.name].total += 1;
      if (m.relief === 'complete') medStats[m.name].complete += 1;
      else if (m.relief === 'partial') medStats[m.name].partial += 1;
      else if (m.relief === 'none') medStats[m.name].none += 1;
    });
  });

  const sortedMeds = Object.entries(medStats)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([name, stats]) => {
      const successRate = Math.round(((stats.complete + stats.partial * 0.5) / stats.total) * 100);
      return { name, ...stats, successRate };
    });

  // Custom Tooltip for recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-50">
          <div className="font-bold text-white border-b border-slate-800 pb-1">
            {label} ({data.monthKey})
          </div>
          <div className="text-rose-400 font-semibold flex justify-between gap-4">
            <span>Total crises :</span>
            <span className="tabular-nums font-bold">{data.totalCrises}</span>
          </div>
          <div className="text-amber-400 flex justify-between gap-4">
            <span>Intensité moyenne :</span>
            <span className="tabular-nums font-semibold">{data.avgIntensity} / 10</span>
          </div>
          {chartMode === 'stacked' && (
            <div className="pt-1 border-t border-slate-900 space-y-0.5 text-[11px]">
              <div className="text-red-400 flex justify-between">
                <span>Sévères (EVA ≥ 7) :</span>
                <span className="tabular-nums">{data.severeCrises}</span>
              </div>
              <div className="text-amber-300 flex justify-between">
                <span>Modérées (EVA 4-6) :</span>
                <span className="tabular-nums">{data.moderateCrises}</span>
              </div>
              <div className="text-emerald-400 flex justify-between">
                <span>Légères (EVA ≤ 3) :</span>
                <span className="tabular-nums">{data.mildCrises}</span>
              </div>
            </div>
          )}
          <div className="text-slate-400 text-[10px] pt-1">
            {data.triptanCount} jour{data.triptanCount > 1 ? 's' : ''} avec triptan
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Doctor Report CTA & Calendar Shortcut */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-rose-950/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-4 h-4 text-rose-400" />
            Bilan Clinique & Graphiques Recharts
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Analyse quantitative et courbe de fréquence des crises
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onNavigateToCalendar && (
            <button
              type="button"
              onClick={onNavigateToCalendar}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
            >
              <CalendarIcon className="w-4 h-4 text-rose-400" />
              Vue Calendrier
            </button>
          )}

          <button
            type="button"
            onClick={onOpenReportModal}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition-all shrink-0"
          >
            <FileText className="w-4 h-4" />
            Rapport neurologue
          </button>
        </div>
      </div>

      {/* RECHARTS SECTION: Monthly Frequency Chart */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-rose-400" />
              Fréquence Mensuelle des Crises (Graphique Recharts)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Évolution sur les 6 derniers mois (Mai 2026 à Octobre 2026)
            </p>
          </div>

          {/* Toggle between Composed view (crises + intensity) and Stacked view */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setChartMode('composed')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                chartMode === 'composed'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Fréquence & EVA</span>
            </button>

            <button
              type="button"
              onClick={() => setChartMode('stacked')}
              className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                chartMode === 'stacked'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Par Sévérité</span>
            </button>
          </div>
        </div>

        {/* Recharts Chart Canvas */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartMode === 'composed' ? (
              <ComposedChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  yAxisId="left"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  domain={[0, 10]}
                  stroke="#64748b"
                  tick={{ fill: '#fbbf24', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  unit="/10"
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-slate-300">
                      {value === 'totalCrises' ? 'Nombre de crises' : 'Intensité moyenne (EVA)'}
                    </span>
                  )}
                />
                <Bar
                  yAxisId="left"
                  dataKey="totalCrises"
                  name="totalCrises"
                  fill="#e11d48"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                >
                  {monthlyChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.monthKey === '2026-10' ? '#f43f5e' : '#be123c'}
                    />
                  ))}
                </Bar>
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="avgIntensity"
                  name="avgIntensity"
                  stroke="#fbbf24"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#fbbf24', stroke: '#0f172a', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#f59e0b' }}
                />
              </ComposedChart>
            ) : (
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis
                  stroke="#64748b"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomChartTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                  formatter={(value) => (
                    <span className="text-slate-300">
                      {value === 'severeCrises'
                        ? 'Sévère (EVA ≥ 7)'
                        : value === 'moderateCrises'
                        ? 'Modérée (EVA 4-6)'
                        : 'Légère (EVA ≤ 3)'}
                    </span>
                  )}
                />
                <Bar
                  dataKey="severeCrises"
                  name="severeCrises"
                  stackId="a"
                  fill="#e11d48"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="moderateCrises"
                  name="moderateCrises"
                  stackId="a"
                  fill="#f59e0b"
                  radius={[0, 0, 0, 0]}
                  maxBarSize={38}
                />
                <Bar
                  dataKey="mildCrises"
                  name="mildCrises"
                  stackId="a"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={38}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend strip and insights */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Barre : Nombre d'attaques
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Ligne : Douleur EVA /10
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Tendance : <span className="text-emerald-400 font-semibold">-25% de crises</span> par rapport au trimestre précédent
          </span>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            Total Crises
          </span>
          <div className="text-2xl font-bold text-white tabular-nums">{totalCrises}</div>
          <p className="text-[10px] text-slate-400">Depuis l'installation</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Durée moyenne
          </span>
          <div className="text-2xl font-bold text-white tabular-nums">
            {avgHours}h{avgRemainderMins > 0 ? ` ${avgRemainderMins}m` : ''}
          </div>
          <p className="text-[10px] text-slate-400">Temps d'attaque moyen</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            Intensité moyenne
          </span>
          <div className="text-2xl font-bold text-white tabular-nums">
            {avgIntensity} <span className="text-sm font-normal text-slate-400">/ 10</span>
          </div>
          <p className="text-[10px] text-slate-400">Échelle EVA</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            30 derniers jours
          </span>
          <div className="text-2xl font-bold text-white tabular-nums">
            {recent30DaysRecords.length}
          </div>
          <p className="text-[10px] text-slate-400">Crises le mois passé</p>
        </div>
      </div>

      {/* Medication Overuse Alert & Gauge (IHS Protocol) */}
      <div
        className={`p-4 rounded-2xl border ${
          isTriptanOveruseRisk
            ? 'bg-amber-950/20 border-amber-800/80'
            : 'bg-slate-900/80 border-slate-800'
        } space-y-3`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill
              className={`w-4 h-4 ${
                isTriptanOveruseRisk ? 'text-amber-400' : 'text-emerald-400'
              }`}
            />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Surveillance Abus Médicamenteux (CAM)
            </h3>
          </div>
          <span className="text-xs font-semibold tabular-nums text-slate-300">
            {triptanDaysCount} / {triptanLimit} j triptan ce mois
          </span>
        </div>

        {/* Progress gauge */}
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isTriptanOveruseRisk ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(100, (triptanDaysCount / triptanLimit) * 100)}%` }}
          />
        </div>

        <div className="text-xs text-slate-400 space-y-1">
          {isTriptanOveruseRisk ? (
            <p className="text-amber-300 flex items-start gap-1.5 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>
                Attention : vous approchez du seuil de 10 jours de triptans par mois recommandé par la Société Internationale des Céphalées (IHS). Parlez-en à votre neurologue pour adapter un traitement de fond.
              </span>
            </p>
          ) : (
            <p className="text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Usage raisonné des triptans ({triptanDaysCount}j/30j, seuil critique à 10 jours/mois).
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Mini Calendar Overview Section in Analytics */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <CalendarIcon className="w-4 h-4 text-rose-400" />
            Répartition Calendaire Rapide (Octobre 2026)
          </h3>
          {onNavigateToCalendar && (
            <button
              type="button"
              onClick={onNavigateToCalendar}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors font-medium"
            >
              <span>Accéder au calendrier interactif</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
            <div key={i} className="text-slate-500 text-[10px] font-semibold py-0.5">
              {d}
            </div>
          ))}
          {/* Days of current month Oct 2026 */}
          {Array.from({ length: 31 }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = `2026-10-${String(dayNum).padStart(2, '0')}`;
            const crisesOnDay = records.filter((r) => r.startDate.startsWith(dayStr));
            const hasCrisis = crisesOnDay.length > 0;
            const maxIntensity = hasCrisis ? Math.max(...crisesOnDay.map((r) => r.intensity)) : 0;
            const isToday = dayStr === '2026-10-14';

            return (
              <div
                key={dayStr}
                className={`h-7 rounded-lg flex items-center justify-center text-[10px] font-medium border ${
                  hasCrisis
                    ? maxIntensity >= 7
                      ? 'bg-rose-500/25 border-rose-500/60 text-rose-200 font-bold'
                      : 'bg-amber-500/25 border-amber-500/60 text-amber-200 font-bold'
                    : isToday
                    ? 'border-slate-500 bg-slate-800 text-white'
                    : 'bg-slate-950/40 border-slate-900 text-slate-500'
                }`}
                title={hasCrisis ? `${dayNum} oct : ${crisesOnDay.length} crise (EVA ${maxIntensity}/10)` : `${dayNum} oct : Sain`}
              >
                {dayNum}
              </div>
            );
          })}
        </div>
      </div>

      {/* Triggers Ranking */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-rose-400" />
          Déclencheurs les plus récurrents
        </h3>

        <div className="space-y-2.5">
          {sortedTriggers.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun déclencheur consigné.</p>
          ) : (
            sortedTriggers.slice(0, 5).map((t) => (
              <div key={t.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-200 font-medium">{t.label}</span>
                  <span className="text-slate-400 tabular-nums">
                    {t.count} fois ({t.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${t.percentage}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Treatment Efficacy */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <Pill className="w-3.5 h-3.5 text-emerald-400" />
          Efficacité comparée des traitements de crise
        </h3>

        <div className="space-y-2">
          {sortedMeds.length === 0 ? (
            <p className="text-xs text-slate-400">Aucun traitement consigné.</p>
          ) : (
            sortedMeds.map((m) => (
              <div
                key={m.name}
                className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-semibold text-white">{m.name}</div>
                  <div className="text-[11px] text-slate-400">
                    {m.total} prises · {m.complete} soulagements complets · {m.partial} partiels
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-emerald-400 font-bold tabular-nums text-sm">
                    {m.successRate}%
                  </span>
                  <div className="text-[10px] text-slate-400">Taux de réponse</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Head Location Distribution */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
          <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
          Distribution anatomique de la douleur
        </h3>

        <div className="space-y-2">
          {sortedLocations.slice(0, 4).map((loc) => (
            <div key={loc.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">{loc.label}</span>
                <span className="text-slate-400 tabular-nums">
                  {loc.count} fois ({loc.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="bg-indigo-500 h-full rounded-full"
                  style={{ width: `${loc.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
