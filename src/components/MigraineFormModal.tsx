import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Pill,
  Sparkles,
  Info
} from 'lucide-react';
import {
  MigraineRecord,
  HeadLocation,
  PainType,
  AuraType,
  SymptomType,
  TriggerType,
  NonPharmaRemedy,
  ImpactLevel,
  MedicationEntry
} from '../types/migraine';
import {
  PAIN_TYPES,
  AURAS,
  SYMPTOMS,
  TRIGGERS,
  NON_PHARMA_REMEDIES,
  COMMON_MEDICATIONS
} from '../data/initialData';
import { HeadMapSelector } from './HeadMapSelector';

interface MigraineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: MigraineRecord) => void;
  onDelete?: (id: string) => void;
  initialRecord?: MigraineRecord | null;
  defaultDate?: string;
}

export const MigraineFormModal: React.FC<MigraineFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialRecord,
  defaultDate,
}) => {
  const isEditing = !!initialRecord;

  // Initialize form state
  const [startDate, setStartDate] = useState(
    initialRecord?.startDate || (defaultDate ? `${defaultDate}T09:00` : new Date().toISOString().slice(0, 16))
  );
  const [inProgress, setInProgress] = useState(initialRecord?.inProgress ?? false);
  const [endDate, setEndDate] = useState(initialRecord?.endDate || '');
  const [intensity, setIntensity] = useState<number>(initialRecord?.intensity ?? 6);
  const [locations, setLocations] = useState<HeadLocation[]>(initialRecord?.locations || ['temporal_right']);
  const [painTypes, setPainTypes] = useState<PainType[]>(initialRecord?.painTypes || ['pulsatile']);
  const [auras, setAuras] = useState<AuraType[]>(initialRecord?.auras || ['none']);
  const [symptoms, setSymptoms] = useState<SymptomType[]>(
    initialRecord?.symptoms || ['photophobia', 'phonophobia']
  );
  const [triggers, setTriggers] = useState<TriggerType[]>(initialRecord?.triggers || ['stress']);
  const [medications, setMedications] = useState<MedicationEntry[]>(initialRecord?.medications || []);
  const [nonPharmaRemedies, setNonPharmaRemedies] = useState<NonPharmaRemedy[]>(
    initialRecord?.nonPharmaRemedies || ['dark_room']
  );
  const [impactOnDay, setImpactOnDay] = useState<ImpactLevel>(initialRecord?.impactOnDay || 'moderate');
  const [notes, setNotes] = useState(initialRecord?.notes || '');

  // Medication add sub-form
  const [newMedName, setNewMedName] = useState('');
  const [newMedDose, setNewMedDose] = useState('');
  const [newMedTime, setNewMedTime] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
  const [newMedRelief, setNewMedRelief] = useState<'complete' | 'partial' | 'none' | 'pending'>('complete');

  if (!isOpen) return null;

  const handleAddMedication = () => {
    if (!newMedName.trim()) return;
    const med: MedicationEntry = {
      id: 'med-' + Date.now(),
      name: newMedName.trim(),
      dose: newMedDose.trim() || '1 comprimé',
      takenAt: newMedTime || '12:00',
      relief: newMedRelief,
    };
    setMedications([...medications, med]);
    setNewMedName('');
    setNewMedDose('');
  };

  const handleRemoveMedication = (id: string) => {
    setMedications(medications.filter((m) => m.id !== id));
  };

  const togglePainType = (type: PainType) => {
    setPainTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleAura = (aura: AuraType) => {
    if (aura === 'none') {
      setAuras(['none']);
      return;
    }
    const filtered = auras.filter((a) => a !== 'none');
    if (filtered.includes(aura)) {
      const remaining = filtered.filter((a) => a !== aura);
      setAuras(remaining.length === 0 ? ['none'] : remaining);
    } else {
      setAuras([...filtered, aura]);
    }
  };

  const toggleSymptom = (sym: SymptomType) => {
    setSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  const toggleTrigger = (trig: TriggerType) => {
    setTriggers((prev) =>
      prev.includes(trig) ? prev.filter((t) => t !== trig) : [...prev, trig]
    );
  };

  const toggleRemedy = (rem: NonPharmaRemedy) => {
    setNonPharmaRemedies((prev) =>
      prev.includes(rem) ? prev.filter((r) => r !== rem) : [...prev, rem]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const record: MigraineRecord = {
      id: initialRecord?.id || 'mig-' + Date.now(),
      startDate,
      endDate: inProgress ? undefined : endDate || undefined,
      inProgress,
      intensity,
      locations,
      painTypes,
      auras,
      symptoms,
      triggers,
      medications,
      nonPharmaRemedies,
      impactOnDay,
      notes: notes.trim(),
      peakIntensity: Math.max(initialRecord?.peakIntensity || intensity, intensity),
    };

    onSave(record);
    onClose();
  };

  const getIntensityColor = (score: number) => {
    if (score <= 3) return 'text-emerald-400';
    if (score <= 6) return 'text-amber-400';
    if (score <= 8) return 'text-rose-400';
    return 'text-red-500';
  };

  const getIntensityLabel = (score: number) => {
    if (score <= 2) return 'Douleur très légère - gêne minime';
    if (score <= 4) return 'Douleur modérée - activités ralenties';
    if (score <= 6) return 'Douleur pénible - concentration difficile';
    if (score <= 8) return 'Douleur sévère - arrêt des activités indispensable';
    return 'Douleur intolérable - alitement complet dans le noir';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="sticky top-0 z-20 px-5 py-4 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              {isEditing ? 'Modifier la crise' : 'Enregistrer une crise'}
            </h2>
            <p className="text-xs text-slate-400">Journal médical détaillé pour suivi clinique</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Scroll Area */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-6">
          {/* Section 1: Dates & Durée */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-rose-400" />
              Temporalité & Durée
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Début de la crise
                </label>
                <input
                  type="datetime-local"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Fin de la crise
                  </label>
                  <label className="text-[11px] text-rose-300 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inProgress}
                      onChange={(e) => setInProgress(e.target.checked)}
                      className="rounded text-rose-500 bg-slate-800 border-slate-700"
                    />
                    En cours
                  </label>
                </div>
                <input
                  type="datetime-local"
                  disabled={inProgress}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full min-h-[44px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white disabled:opacity-40 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Intensité EVA (1 à 10) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Intensité maximale de la douleur (Échelle EVA)
              </h3>
              <span className={`text-base font-bold tabular-nums ${getIntensityColor(intensity)}`}>
                {intensity} / 10
              </span>
            </div>

            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={intensity}
              onChange={(e) => setIntensity(parseInt(e.target.value, 10))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex justify-between text-[11px] font-medium text-slate-400">
              <span>1 - Minime</span>
              <span>4 - Modérée</span>
              <span>7 - Forte</span>
              <span>10 - Intolérable</span>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
              <span className="font-medium text-white">Diagnostic :</span> {getIntensityLabel(intensity)}
            </p>
          </div>

          {/* Section 3: Anatomical Head Map Selector */}
          <HeadMapSelector selectedLocations={locations} onChange={setLocations} />

          {/* Section 4: Type de Douleur */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Type de sensation douloureuse
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PAIN_TYPES.map((pt) => {
                const active = painTypes.includes(pt.id);
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => togglePainType(pt.id)}
                    className={`min-h-[44px] p-2.5 text-left rounded-xl border text-xs transition-colors ${
                      active
                        ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{pt.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{pt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 5: Auras neurologiques */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Symptômes d'Aura (Prodromes avant la douleur)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {AURAS.map((a) => {
                const active = auras.includes(a.id);
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => toggleAura(a.id)}
                    className={`min-h-[44px] p-2.5 text-left rounded-xl border text-xs transition-colors ${
                      active
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="font-medium">{a.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{a.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Symptômes associés */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              Symptômes associés pendant la crise
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SYMPTOMS.map((sym) => {
                const active = symptoms.includes(sym.id);
                return (
                  <button
                    key={sym.id}
                    type="button"
                    onClick={() => toggleSymptom(sym.id)}
                    className={`min-h-[44px] px-3 py-2 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{sym.label}</span>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        active ? 'border-rose-400 bg-rose-500' : 'border-slate-700 bg-slate-800'
                      }`}
                    >
                      {active && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 7: Facteurs Déclencheurs (Triggers) */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Facteurs déclencheurs identifiés
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TRIGGERS.map((trig) => {
                const active = triggers.includes(trig.id);
                return (
                  <button
                    key={trig.id}
                    type="button"
                    onClick={() => toggleTrigger(trig.id)}
                    className={`min-h-[44px] px-3 py-2 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div>
                      <span>{trig.label}</span>
                      <div className="text-[10px] text-slate-400 font-normal">{trig.category}</div>
                    </div>
                    <span
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                        active ? 'border-indigo-400 bg-indigo-500' : 'border-slate-700 bg-slate-800'
                      }`}
                    >
                      {active && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 8: Médicaments de crise & Efficacité */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Pill className="w-3.5 h-3.5 text-emerald-400" />
              Traitements de crise & soulagement
            </h3>

            {/* List of medications taken */}
            {medications.length > 0 ? (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div
                    key={med.id}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{med.name}</div>
                      <div className="text-slate-400">
                        {med.dose} · Pris à {med.takenAt} · Soulagement :{' '}
                        <span className="text-emerald-400 font-medium">
                          {med.relief === 'complete' && 'Complet'}
                          {med.relief === 'partial' && 'Partiel'}
                          {med.relief === 'none' && 'Inopérant'}
                          {med.relief === 'pending' && 'En cours d’évaluation'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedication(med.id)}
                      className="text-slate-400 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Aucun médicament encore enregistré pour cette crise.</p>
            )}

            {/* Add medication input box */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Médicament</label>
                  <input
                    type="text"
                    placeholder="ex. Zolmitriptan, Ibuprofène..."
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    list="med-suggestions"
                    className="w-full min-h-[40px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                  <datalist id="med-suggestions">
                    {COMMON_MEDICATIONS.map((c) => (
                      <option key={c.name} value={c.name} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Dosage</label>
                  <input
                    type="text"
                    placeholder="ex. 2.5 mg, 400 mg..."
                    value={newMedDose}
                    onChange={(e) => setNewMedDose(e.target.value)}
                    className="w-full min-h-[40px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Heure de prise</label>
                  <input
                    type="text"
                    value={newMedTime}
                    onChange={(e) => setNewMedTime(e.target.value)}
                    placeholder="14:30"
                    className="w-full min-h-[40px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Soulagement obtenu à 2h</label>
                  <select
                    value={newMedRelief}
                    onChange={(e) => setNewMedRelief(e.target.value as 'complete' | 'partial' | 'none' | 'pending')}
                    className="w-full min-h-[40px] px-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="complete">Soulagement complet</option>
                    <option value="partial">Soulagement partiel</option>
                    <option value="none">Aucun soulagement</option>
                    <option value="pending">En attente / Récent</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddMedication}
                className="w-full min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Ajouter ce médicament à la crise
              </button>
            </div>
          </div>

          {/* Section 9: Remèdes non médicamenteux */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Mesures non médicamenteuses adoptées
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {NON_PHARMA_REMEDIES.map((rem) => {
                const active = nonPharmaRemedies.includes(rem.id);
                return (
                  <button
                    key={rem.id}
                    type="button"
                    onClick={() => toggleRemedy(rem.id)}
                    className={`min-h-[40px] px-3 py-2 text-left rounded-xl border text-xs font-medium transition-colors flex items-center justify-between ${
                      active
                        ? 'bg-teal-500/20 border-teal-500 text-teal-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{rem.label}</span>
                    {active && <span className="text-teal-400 font-bold">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 10: Retentissement & Handicap journalier */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-400" />
              Retentissement fonctionnel (Évaluation MIDAS)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'mild', label: 'Minime', desc: 'Activité normale maintenue' },
                { id: 'moderate', label: 'Modéré', desc: 'Efficacité réduite de moitié' },
                { id: 'severe', label: 'Sévère', desc: 'Arrêt de travail / sortie impossible' },
                { id: 'bedridden', label: 'Alitement', desc: 'Incapacité totale / lit dans le noir' },
              ].map((imp) => (
                <button
                  key={imp.id}
                  type="button"
                  onClick={() => setImpactOnDay(imp.id as ImpactLevel)}
                  className={`min-h-[52px] p-2 text-left rounded-xl border text-xs transition-colors ${
                    impactOnDay === imp.id
                      ? 'bg-rose-500/20 border-rose-500 text-rose-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-semibold">{imp.label}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{imp.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 11: Notes libres */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Notes cliniques & Contexte particulier
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Événement stressant la veille, sensation inhabituelle de froid, nausées persistantes après le repas..."
              className="w-full p-3 text-xs bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          {/* Sticky-like Bottom Actions */}
          <div className="pt-2 flex items-center gap-3">
            {isEditing && onDelete && initialRecord && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Voulez-vous supprimer définitivement cette crise du journal ?')) {
                    onDelete(initialRecord.id);
                    onClose();
                  }
                }}
                className="min-h-[48px] px-4 rounded-xl bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 text-xs font-semibold flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Supprimer
              </button>
            )}

            <button
              type="submit"
              className="flex-1 min-h-[48px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-lg shadow-rose-600/30 transition-transform active:scale-[0.99] flex items-center justify-center"
            >
              {isEditing ? 'Enregistrer les modifications' : 'Enregistrer cette crise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
