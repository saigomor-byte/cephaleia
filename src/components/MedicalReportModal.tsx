import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  FileText,
  Calendar,
  AlertCircle,
  Download,
  Mail,
  Send,
  User,
  Stethoscope,
  Info
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { MigraineRecord } from '../types/migraine';
import { HEAD_LOCATIONS, TRIGGERS } from '../data/initialData';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: MigraineRecord[];
  defaultPatientName?: string;
  defaultDoctorName?: string;
  defaultDoctorEmail?: string;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  records,
  defaultPatientName = 'Camille Dupont',
  defaultDoctorName = 'Dr. V. Leroux (Neurologue)',
  defaultDoctorEmail = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [patientName, setPatientName] = useState(defaultPatientName);
  const [doctorName, setDoctorName] = useState(defaultDoctorName);
  const [doctorEmail, setDoctorEmail] = useState(defaultDoctorEmail);
  const [filterPeriod, setFilterPeriod] = useState<'month' | 'quarter' | 'all'>('month');
  const [showEmailGuide, setShowEmailGuide] = useState(false);

  if (!isOpen) return null;

  // Filter records
  const now = new Date('2026-10-14');
  const currentMonthStr = '2026-10';

  const filteredRecords = records.filter((r) => {
    if (filterPeriod === 'month') {
      return r.startDate.startsWith(currentMonthStr);
    }
    if (filterPeriod === 'quarter') {
      const rDate = new Date(r.startDate);
      const diffMonths = (now.getFullYear() - rDate.getFullYear()) * 12 + (now.getMonth() - rDate.getMonth());
      return diffMonths >= 0 && diffMonths <= 2;
    }
    return true;
  });

  const totalCrises = filteredRecords.length;
  const avgIntensity = totalCrises > 0
    ? (filteredRecords.reduce((acc, r) => acc + r.intensity, 0) / totalCrises).toFixed(1)
    : '0';

  // Count acute medications
  let triptanDaysSet = new Set<string>();
  let otherAnalgesicDaysSet = new Set<string>();
  let triptanTakesCount = 0;
  let otherAnalgesicTakesCount = 0;

  filteredRecords.forEach((r) => {
    const dayStr = r.startDate.slice(0, 10);
    r.medications.forEach((m) => {
      const lower = m.name.toLowerCase();
      if (lower.includes('triptan') || lower.includes('zomig') || lower.includes('imigrane') || lower.includes('relpax') || lower.includes('maxalt')) {
        triptanDaysSet.add(dayStr);
        triptanTakesCount++;
      } else {
        otherAnalgesicDaysSet.add(dayStr);
        otherAnalgesicTakesCount++;
      }
    });
  });

  const periodLabel = filterPeriod === 'month' ? 'Octobre 2026' : filterPeriod === 'quarter' ? 'Dernier trimestre (Août - Octobre 2026)' : 'Historique complet';

  const formatDuration = (startIso: string, endIso?: string, inProgress?: boolean) => {
    if (inProgress) return 'En cours';
    if (!endIso) return 'N.R.';
    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();
    const diffMins = Math.max(0, Math.round((end - start) / 60000));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h === 0) return `${m}m`;
    return `${h}h${m > 0 ? `${m}m` : ''}`;
  };

  // Generate vector PDF with jsPDF
  const generateAndDownloadPDF = () => {
    setPdfGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 18;

      // Header Banner (Navy / Slate aesthetic)
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 28, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text('CÉPHALEIA - BILAN MÉDICAL DES CÉPHALÉES & MIGRAINES', 14, 12);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240); // slate-200
      doc.text('Relevé clinique standardisé pour consultation de neurologie (Critères ICHD-3)', 14, 18);
      doc.text(`Date d'édition : 14/10/2026 | Document confidentiel`, 14, 23);

      y = 35;

      // Metadata card
      doc.setFillColor(248, 250, 252); // slate-50
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, 'FD');

      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`Patient : ${patientName}`, 18, y + 7);
      doc.text(`Médecin / Neurologue : ${doctorName}`, 18, y + 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(`Période analysée : ${periodLabel}`, pageWidth - 90, y + 7);
      if (doctorEmail) {
        doc.text(`Email médecin : ${doctorEmail}`, pageWidth - 90, y + 14);
      }

      y += 26;

      // KPI Boxes Strip
      const boxWidth = (pageWidth - 28 - 9) / 4;
      const boxHeight = 18;

      const kpiData = [
        { label: 'Nombre de crises', val: `${totalCrises}`, color: [225, 29, 72] }, // rose-600
        { label: 'Intensité moy. EVA', val: `${avgIntensity} / 10`, color: [217, 119, 6] }, // amber-600
        { label: 'Jours sous Triptans', val: `${triptanDaysSet.size} jours`, color: triptanDaysSet.size >= 10 ? [220, 38, 38] : [16, 185, 129] },
        { label: 'Prises Antalgiques', val: `${otherAnalgesicTakesCount}`, color: [79, 70, 229] }, // indigo-600
      ];

      kpiData.forEach((kpi, idx) => {
        const bx = 14 + idx * (boxWidth + 3);
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(bx, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

        doc.setTextColor(kpi.color[0], kpi.color[1], kpi.color[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(kpi.val, bx + boxWidth / 2, y + 8, { align: 'center' });

        doc.setTextColor(100, 116, 139);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.text(kpi.label, bx + boxWidth / 2, y + 14, { align: 'center' });
      });

      y += boxHeight + 6;

      // Medication Overuse Alert banner in PDF if >= 8 days
      if (triptanDaysSet.size >= 8) {
        doc.setFillColor(254, 242, 242); // red-50
        doc.setDrawColor(248, 113, 113); // red-400
        doc.roundedRect(14, y, pageWidth - 28, 12, 1.5, 1.5, 'FD');

        doc.setTextColor(185, 28, 28); // red-700
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.text('ALERTE SURVEILLANCE ABUS MÉDICAMENTEUX (CAM) :', 18, y + 5);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(
          `${triptanDaysSet.size} jours avec prise de triptans observés. Seuil de vigilance IHS fixé à 10 jours/mois pour prévenir la céphalée rebond.`,
          18,
          y + 9.5
        );
        y += 16;
      }

      // Table of Crises Header
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text('TABLEAU CHRONOLOGIQUE DES CRISES DE LA PÉRIODE', 14, y);
      y += 5;

      // Table Column headers
      const cols = [
        { title: 'Date & Heure', width: 34 },
        { title: 'Durée', width: 16 },
        { title: 'EVA', width: 14 },
        { title: 'Localisation', width: 34 },
        { title: 'Aura', width: 22 },
        { title: 'Traitements pris', width: 40 },
        { title: 'Soulagement à 2h', width: 22 },
      ];

      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(14, y, pageWidth - 28, 7, 'F');
      doc.setDrawColor(203, 213, 225);
      doc.line(14, y + 7, pageWidth - 14, y + 7);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);

      let curX = 16;
      cols.forEach((c) => {
        doc.text(c.title, curX, y + 4.8);
        curX += c.width;
      });

      y += 7;

      // Table rows
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      if (filteredRecords.length === 0) {
        doc.setTextColor(100, 116, 139);
        doc.text('Aucune crise répertoriée pour cette période.', 16, y + 6);
        y += 10;
      } else {
        filteredRecords.forEach((record, index) => {
          // Check for page overflow
          if (y > pageHeight - 35) {
            doc.addPage();
            y = 20;
          }

          const isEven = index % 2 === 0;
          if (isEven) {
            doc.setFillColor(250, 250, 250);
            doc.rect(14, y, pageWidth - 28, 7.5, 'F');
          }
          doc.setDrawColor(241, 245, 249);
          doc.line(14, y + 7.5, pageWidth - 14, y + 7.5);

          curX = 16;
          doc.setTextColor(15, 23, 42);

          // 1. Date & Heure
          const dateStr = `${record.startDate.slice(8, 10)}/${record.startDate.slice(5, 7)}/${record.startDate.slice(0, 4)} ${record.startDate.slice(11, 16)}`;
          doc.text(dateStr, curX, y + 5);
          curX += cols[0].width;

          // 2. Durée
          doc.text(formatDuration(record.startDate, record.endDate, record.inProgress), curX, y + 5);
          curX += cols[1].width;

          // 3. EVA
          doc.setFont('helvetica', 'bold');
          if (record.intensity >= 7) doc.setTextColor(225, 29, 72);
          else if (record.intensity >= 5) doc.setTextColor(217, 119, 6);
          else doc.setTextColor(16, 185, 129);
          doc.text(`${record.intensity} / 10`, curX, y + 5);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(15, 23, 42);
          curX += cols[2].width;

          // 4. Localisation
          const locStr = record.locations
            .map((loc) => HEAD_LOCATIONS.find((h) => h.id === loc)?.short || loc)
            .slice(0, 2)
            .join(', ');
          doc.text(locStr || 'Diffuse', curX, y + 5);
          curX += cols[3].width;

          // 5. Aura
          const auraStr = record.auras.includes('none')
            ? 'Sans'
            : record.auras.includes('visual_scintillating')
            ? 'Scotome'
            : 'Aura neuro';
          doc.text(auraStr, curX, y + 5);
          curX += cols[4].width;

          // 6. Traitements
          const medStr = record.medications.length > 0
            ? record.medications.map((m) => `${m.name}`).slice(0, 2).join(', ')
            : 'Aucun';
          const truncatedMed = medStr.length > 25 ? medStr.slice(0, 24) + '...' : medStr;
          doc.text(truncatedMed, curX, y + 5);
          curX += cols[5].width;

          // 7. Soulagement
          const reliefStr = record.medications.length > 0
            ? record.medications[0].relief === 'complete'
              ? 'Complet'
              : record.medications[0].relief === 'partial'
              ? 'Partiel'
              : 'Nul'
            : '-';
          doc.text(reliefStr, curX, y + 5);

          y += 7.5;
        });
      }

      y += 6;

      // Doctor Observations & Signatures Footer box
      if (y > pageHeight - 45) {
        doc.addPage();
        y = 20;
      }

      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, y, pageWidth - 28, 24, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text('Observations du patient :', 18, y + 5);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Régularité des prises médicamenteuses. Recherche d’optimisation du traitement de fond.',
        18,
        y + 10
      );

      doc.setFont('helvetica', 'bold');
      doc.text('Avis et conduite à tenir du praticien (Neurologue / Médecin traitant) :', 18, y + 16);
      doc.text('Signature & Cachet :', pageWidth - 60, y + 16);

      // Save PDF file to user device
      const cleanPatient = patientName.replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Bilan_Migraines_${cleanPatient}_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      alert('Une erreur est survenue lors de la création du fichier PDF.');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Prepare email with mailto: link
  const handleSendEmailToDoctor = () => {
    // Also trigger PDF download so the patient has the file ready to attach
    generateAndDownloadPDF();

    const subject = encodeURIComponent(`Bilan des crises de migraine - ${patientName} - ${periodLabel}`);
    const emailBody = encodeURIComponent(
      `Bonjour ${doctorName},

Je vous transmets ci-joint mon bilan de suivi des céphalées et migraines pour la période : ${periodLabel}.
Le fichier PDF récapitulatif détaillé a été généré via mon carnet d'auto-mesure Céphaleia.

RÉSUMÉ CLINIQUE DE LA PÉRIODE :
- Nombre total de crises enregistrées : ${totalCrises}
- Intensité moyenne de la douleur : ${avgIntensity} / 10 (EVA)
- Nombre de jours avec prise de Triptans : ${triptanDaysSet.size} jours (Seuil d'alerte CAM : 10 j/mois)
- Prises d'antalgiques / AINS : ${otherAnalgesicTakesCount}

DÉTAIL CHRONOLOGIQUE :
${filteredRecords
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.startDate.slice(0, 10)} (${r.startDate.slice(11, 16)}) - EVA ${r.intensity}/10 - ${
        r.locations.map((l) => HEAD_LOCATIONS.find((h) => h.id === l)?.short || l).join(', ')
      } - Traitement : ${r.medications.map((m) => `${m.name} (${m.relief})`).join(', ') || 'Aucun'}`
  )
  .join('\n')}

Veuillez trouver le relevé PDF ci-joint pour analyse lors de notre prochaine consultation ou pour ajustement éventuel de mon traitement.

Bien cordialement,
${patientName}`
    );

    const mailtoUrl = `mailto:${encodeURIComponent(doctorEmail.trim())}?subject=${subject}&body=${emailBody}`;
    window.location.href = mailtoUrl;
    setShowEmailGuide(true);
  };

  const handleCopySummary = () => {
    const text = `RAPPORT DE CONSULTATION CÉPHALÉES & MIGRAINES
Patient : ${patientName} | Médecin traitant / Neurologue : ${doctorName}
Période : ${periodLabel}
Date d'édition : 14/10/2026

RÉSUMÉ CLINIQUE :
- Nombre de crises : ${totalCrises}
- Intensité moyenne (EVA) : ${avgIntensity}/10
- Jours avec Triptans : ${triptanDaysSet.size} jours
- Prises d'AINS/Antalgiques : ${otherAnalgesicTakesCount}

DÉTAIL DES CRISES :
${filteredRecords
  .map(
    (r, idx) =>
      `${idx + 1}. ${r.startDate.slice(0, 10)} (${r.startDate.slice(11, 16)}) - EVA ${r.intensity}/10 - ${
        r.locations.map((l) => HEAD_LOCATIONS.find((h) => h.id === l)?.short || l).join(', ')
      } - Traitement : ${r.medications.map((m) => `${m.name} (${m.relief})`).join(', ') || 'Aucun'}`
  )
  .join('\n')}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header Toolbar */}
        <div className="px-5 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-rose-400" />
            <h2 className="text-sm font-bold text-white tracking-tight">
              Fiche de Synthèse Médicale & Export PDF
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF Button */}
            <button
              type="button"
              onClick={generateAndDownloadPDF}
              disabled={pdfGenerating}
              className="min-h-[38px] px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{pdfGenerating ? 'Génération...' : 'Télécharger PDF'}</span>
            </button>

            {/* Direct Send Email to Doctor */}
            <button
              type="button"
              onClick={handleSendEmailToDoctor}
              className="min-h-[38px] px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-md shadow-indigo-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Envoyer par Email</span>
            </button>

            {/* Copy Text Summary */}
            <button
              type="button"
              onClick={handleCopySummary}
              className="min-h-[38px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Copier le texte du bilan"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
              title="Imprimer directement"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="min-h-[38px] min-w-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Email Practitioner Banner & Destination Settings */}
        <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800/80 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span className="font-semibold text-white">Email du neurologue / cabinet :</span>
            </div>

            <div className="flex items-center gap-2 flex-1 sm:max-w-md">
              <input
                type="email"
                placeholder="ex: docteur.leroux@neurologie.fr"
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                className="w-full min-h-[36px] px-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleSendEmailToDoctor}
                className="min-h-[36px] px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs whitespace-nowrap transition-colors"
              >
                Ouvrir email
              </button>
            </div>
          </div>

          {showEmailGuide && (
            <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 text-[11px] text-indigo-200 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  Votre client de messagerie a été ouvert avec le résumé rédigé. Le fichier PDF <strong>Bilan_Migraines_{patientName.replace(/\s+/g, '_')}.pdf</strong> a été téléchargé dans vos Téléchargements : il vous suffit de le glisser en pièce jointe !
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailGuide(false)}
                className="text-indigo-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Period Selector Tabs */}
        <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Période du relevé :</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setFilterPeriod('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterPeriod === 'month' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mois en cours (Oct 2026)
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod('quarter')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterPeriod === 'quarter' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dernier trimestre
            </button>
            <button
              type="button"
              onClick={() => setFilterPeriod('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                filterPeriod === 'all' ? 'bg-rose-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Historique complet
            </button>
          </div>
        </div>

        {/* Document Content Sheet */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-900 bg-white" id="printable-report">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 uppercase">
                Relevé Médical des Crises de Migraine
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                Standard diagnostique conforme à la classification internationale des céphalées (ICHD-3)
              </p>
            </div>
            <div className="text-right text-xs text-slate-600 sm:shrink-0">
              <div>Date d'édition : 14 octobre 2026</div>
              <div>Généré via Céphaleia</div>
            </div>
          </div>

          {/* Patient / Practitioner Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-500 font-medium">Patient(e) :</span>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="ml-2 font-semibold text-slate-900 border-b border-slate-300 focus:outline-none focus:border-rose-600 bg-transparent"
              />
            </div>
            <div>
              <span className="text-slate-500 font-medium">Médecin / Neurologue :</span>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="ml-2 font-semibold text-slate-900 border-b border-slate-300 focus:outline-none focus:border-rose-600 bg-transparent"
              />
            </div>
          </div>

          {/* Clinical Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xl font-bold text-rose-700 tabular-nums">{totalCrises}</span>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Crises sur la période</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xl font-bold text-amber-700 tabular-nums">{avgIntensity} / 10</span>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Intensité moyenne (EVA)</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className={`text-2xl font-bold tabular-nums ${triptanDaysSet.size >= 10 ? 'text-red-700' : 'text-emerald-700'}`}>
                {triptanDaysSet.size} jours
              </span>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Jours sous Triptans</div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-2xl font-bold text-indigo-700 tabular-nums">{otherAnalgesicTakesCount}</span>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">Prises AINS/Antalgiques</div>
            </div>
          </div>

          {/* Medication Abuse Warning */}
          {triptanDaysSet.size >= 8 && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong>Alerte Céphalée par Abus Médicamenteux (CAM) :</strong> {triptanDaysSet.size} jours avec prise de triptans sur la période. Le seuil de sécurité défini par l'IHS est de 10 jours/mois. Discussion d'une mise en route ou d'une intensification du traitement de fond recommandée.
              </div>
            </div>
          )}

          {/* Table of Crises */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Détail chronologique des épisodes
            </h2>

            <div className="border border-slate-300 rounded-xl overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 border-b border-slate-300 font-semibold text-slate-700">
                  <tr>
                    <th className="p-2.5">Date & Début</th>
                    <th className="p-2.5">Durée</th>
                    <th className="p-2.5">EVA</th>
                    <th className="p-2.5">Localisation</th>
                    <th className="p-2.5">Aura</th>
                    <th className="p-2.5">Médicaments</th>
                    <th className="p-2.5">Soulagement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-800">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500">
                        Aucune crise enregistrée pour cette période.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-2.5 whitespace-nowrap">
                          <div className="font-bold text-slate-900">
                            {new Date(r.startDate).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </div>
                          <div className="text-[11px] text-slate-500">{r.startDate.slice(11, 16)}</div>
                        </td>

                        <td className="p-2.5 whitespace-nowrap text-slate-600">
                          {formatDuration(r.startDate, r.endDate, r.inProgress)}
                        </td>

                        <td className="p-2.5 font-bold tabular-nums">
                          <span
                            className={
                              r.intensity >= 7 ? 'text-rose-700 font-bold' : r.intensity >= 5 ? 'text-amber-700' : 'text-emerald-700'
                            }
                          >
                            {r.intensity} / 10
                          </span>
                        </td>

                        <td className="p-2.5">
                          {r.locations
                            .map((loc) => HEAD_LOCATIONS.find((h) => h.id === loc)?.short || loc)
                            .join(', ')}
                        </td>

                        <td className="p-2.5">
                          {r.auras.includes('none')
                            ? 'Sans'
                            : r.auras.map((a) => (a === 'visual_scintillating' ? 'Scotome' : a)).join(', ')}
                        </td>

                        <td className="p-2.5">
                          {r.medications.length > 0
                            ? r.medications.map((m) => `${m.name} (${m.dose})`).join(', ')
                            : 'Aucun'}
                        </td>

                        <td className="p-2.5 font-semibold">
                          {r.medications.length > 0 ? (
                            r.medications.map((m, idx) => (
                              <span
                                key={idx}
                                className={
                                  m.relief === 'complete'
                                    ? 'text-emerald-700'
                                    : m.relief === 'partial'
                                    ? 'text-amber-700'
                                    : 'text-rose-700'
                                }
                              >
                                {m.relief === 'complete' ? 'Complet' : m.relief === 'partial' ? 'Partiel' : 'Nul'}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Observations and Signatures */}
          <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600">
            <div>
              <strong>Commentaires du patient :</strong>
              <div className="mt-1 p-2.5 rounded-lg border border-slate-200 bg-slate-50 min-h-[44px]">
                Tolérance au traitement de crise et de fond notée au quotidien. Demande d’avis sur les céphalées cataméniales / matinales.
              </div>
            </div>
            <div>
              <strong>Décision et signature du neurologue :</strong>
              <div className="mt-1 p-2.5 rounded-lg border border-dashed border-slate-300 min-h-[44px] text-slate-400">
                Cachet du praticien :
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
