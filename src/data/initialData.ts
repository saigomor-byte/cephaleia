import {
  MigraineRecord,
  PreventiveMedication,
  HeadLocation,
  PainType,
  AuraType,
  SymptomType,
  TriggerType,
  NonPharmaRemedy,
} from '../types/migraine';

export const HEAD_LOCATIONS: { id: HeadLocation; label: string; short: string; position: string }[] = [
  { id: 'frontal', label: 'Front (Frontal)', short: 'Front', position: 'Zone frontale, front entier' },
  { id: 'temporal_left', label: 'Tempe gauche', short: 'Tempe G', position: 'Hémicrâne gauche au niveau temporal' },
  { id: 'temporal_right', label: 'Tempe droite', short: 'Tempe D', position: 'Hémicrâne droit au niveau temporal' },
  { id: 'periocular_left', label: 'Derrière l’œil gauche', short: 'Œil G', position: 'Douleur rétro-orbitaire gauche' },
  { id: 'periocular_right', label: 'Derrière l’œil droit', short: 'Œil D', position: 'Douleur rétro-orbitaire droite' },
  { id: 'vertex', label: 'Sommet du crâne (Vertex)', short: 'Sommet', position: 'Calotte crânienne supérieure' },
  { id: 'occipital', label: 'Arrière du crâne (Occiput)', short: 'Occiput', position: 'Base postérieure du crâne' },
  { id: 'cervical', label: 'Nuque & cervicales', short: 'Nuque', position: 'Haut du cou et trapèzes' },
];

export const PAIN_TYPES: { id: PainType; label: string; desc: string }[] = [
  { id: 'pulsatile', label: 'Pulsatile', desc: 'Battements au rythme du cœur' },
  { id: 'tension', label: 'Étau / Pression', desc: 'Sensation de compression serrée' },
  { id: 'throbbing', label: 'Élancements', desc: 'Décharges et coups lancinants' },
  { id: 'stabbing', label: 'Poignard / Éclair', desc: 'Douleur aiguë et transfixiante' },
  { id: 'burning', label: 'Brûlure', desc: 'Échauffement douloureux intense' },
  { id: 'crushing', label: 'Broiement', desc: 'Pression sourde et écrasante' },
];

export const AURAS: { id: AuraType; label: string; desc: string }[] = [
  { id: 'none', label: 'Sans aura', desc: 'Crise migraineuse classique sans prodrome visuel' },
  { id: 'visual_scintillating', label: 'Scotome scintillant', desc: 'Éclairs, zigzags lumineux ou points brillants' },
  { id: 'visual_blur', label: 'Vision trouble / Tache', desc: 'Baisse visuelle temporaire ou perte partielle de champ' },
  { id: 'sensory_numbness', label: 'Paresthésies / Fourmillements', desc: 'Engourdissement visage, bouche ou main' },
  { id: 'aphasia_speech', label: 'Troubles du langage', desc: 'Difficultés à articuler ou à trouver ses mots' },
  { id: 'vertigo', label: 'Vertiges / Étourdissements', desc: 'Instabilité ou sensation de flottement' },
];

export const SYMPTOMS: { id: SymptomType; label: string; icon: string }[] = [
  { id: 'photophobia', label: 'Sensibilité lumière (Photophobie)', icon: 'Sun' },
  { id: 'phonophobia', label: 'Sensibilité bruit (Phonophobie)', icon: 'Volume2' },
  { id: 'osmophobia', label: 'Sensibilité odeurs (Osmophobie)', icon: 'Wind' },
  { id: 'nausea', label: 'Nausées', icon: 'AlertCircle' },
  { id: 'vomiting', label: 'Vomissements', icon: 'RotateCcw' },
  { id: 'extreme_fatigue', label: 'Fatigue intense / Léthargie', icon: 'BatteryLow' },
  { id: 'neck_stiffness', label: 'Raideur cervicale', icon: 'Activity' },
  { id: 'brain_fog', label: 'Brouillard mental (Brain fog)', icon: 'Cloud' },
  { id: 'allodynia', label: 'Hypersensibilité cuir chevelu', icon: 'Feather' },
];

export const TRIGGERS: { id: TriggerType; label: string; category: string }[] = [
  { id: 'stress', label: 'Stress ou décompression', category: 'Émotionnel' },
  { id: 'lack_of_sleep', label: 'Manque de sommeil / Nuit courte', category: 'Sommeil' },
  { id: 'excess_sleep', label: 'Grasse matinée inhabituelle', category: 'Sommeil' },
  { id: 'blue_light_screens', label: 'Écrans prolongés / Lumière crue', category: 'Environnement' },
  { id: 'weather_pressure', label: 'Météo / Baisse barométrique', category: 'Environnement' },
  { id: 'noise', label: 'Environnement bruyant', category: 'Environnement' },
  { id: 'skipped_meal', label: 'Repas sauté / Hypoglycémie', category: 'Alimentation' },
  { id: 'coffee_caffeine', label: 'Excès ou sevrage de caféine', category: 'Alimentation' },
  { id: 'chocolate_food', label: 'Chocolat / Fromage affiné / Vin', category: 'Alimentation' },
  { id: 'alcohol', label: 'Alcool', category: 'Alimentation' },
  { id: 'hormones_cycle', label: 'Période menstruelle / Hormones', category: 'Physiologique' },
  { id: 'exercise', label: 'Effort physique inhabituel', category: 'Physiologique' },
  { id: 'travel', label: 'Voyage / Transport / Décalage', category: 'Rythme de vie' },
];

export const NON_PHARMA_REMEDIES: { id: NonPharmaRemedy; label: string }[] = [
  { id: 'cold_compress', label: 'Glace / Compresse fraîche sur le front' },
  { id: 'dark_room', label: 'Isolement en chambre obscure' },
  { id: 'hydration', label: 'Grand verre d’eau fraîche' },
  { id: 'sleep', label: 'Tentative d’endormissement' },
  { id: 'acupressure', label: 'Pression point Hégou (LI4)' },
  { id: 'quiet_breathing', label: 'Respiration 4-7-8 / Cohérence' },
];

export const COMMON_MEDICATIONS = [
  { name: 'Zolmitriptan (Zomig)', dose: '2.5 mg' },
  { name: 'Sumatriptan (Imigrane)', dose: '50 mg' },
  { name: 'Élétriptan (Relpax)', dose: '40 mg' },
  { name: 'Rizatriptan (Maxalt)', dose: '10 mg' },
  { name: 'Ibuprofène', dose: '400 mg' },
  { name: 'Kétoprofène (Toprec)', dose: '25 mg' },
  { name: 'Paracétamol', dose: '1000 mg' },
  { name: 'Dompéridone / Métoclopramide', dose: '10 mg' },
  { name: 'Aspirine', dose: '1000 mg' },
];

export const SEED_MIGRAINES: MigraineRecord[] = [
  {
    id: 'mig-seed-1',
    startDate: '2026-10-12T14:30',
    endDate: '2026-10-12T19:00',
    inProgress: false,
    intensity: 7,
    locations: ['temporal_right', 'periocular_right'],
    painTypes: ['pulsatile', 'throbbing'],
    auras: ['visual_scintillating'],
    symptoms: ['photophobia', 'phonophobia', 'nausea'],
    triggers: ['stress', 'blue_light_screens'],
    medications: [
      { id: 'med-1', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '15:00', relief: 'complete' }
    ],
    nonPharmaRemedies: ['cold_compress', 'dark_room'],
    impactOnDay: 'severe',
    notes: 'Survenue en fin de réunion après 4 heures sur écran. Scotome scintillant à droite pendant 25 min avant céphalée.'
  },
  {
    id: 'mig-seed-2',
    startDate: '2026-10-06T07:15',
    endDate: '2026-10-06T15:45',
    inProgress: false,
    intensity: 8,
    locations: ['temporal_left', 'periocular_left', 'cervical'],
    painTypes: ['pulsatile', 'stabbing'],
    auras: ['none'],
    symptoms: ['photophobia', 'phonophobia', 'vomiting', 'neck_stiffness'],
    triggers: ['lack_of_sleep', 'weather_pressure'],
    medications: [
      { id: 'med-2', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '07:45', relief: 'partial' },
      { id: 'med-3', name: 'Ibuprofène', dose: '400 mg', takenAt: '10:00', relief: 'complete' }
    ],
    nonPharmaRemedies: ['dark_room', 'sleep'],
    impactOnDay: 'bedridden',
    notes: 'Réveil avec céphalée pulsatile violente. Alitement nécessaire toute la matinée.'
  },
  {
    id: 'mig-seed-3',
    startDate: '2026-09-28T16:00',
    endDate: '2026-09-28T21:30',
    inProgress: false,
    intensity: 5,
    locations: ['frontal', 'vertex'],
    painTypes: ['tension', 'throbbing'],
    auras: ['none'],
    symptoms: ['photophobia', 'brain_fog'],
    triggers: ['skipped_meal', 'stress'],
    medications: [
      { id: 'med-4', name: 'Ibuprofène', dose: '400 mg', takenAt: '16:30', relief: 'complete' }
    ],
    nonPharmaRemedies: ['hydration', 'cold_compress'],
    impactOnDay: 'moderate',
    notes: 'Déjeuner sauté au bureau. Soulagé en 1h30 après prise médicamenteuse et grand repos.'
  },
  {
    id: 'mig-seed-4',
    startDate: '2026-09-17T09:00',
    endDate: '2026-09-17T18:00',
    inProgress: false,
    intensity: 8,
    locations: ['temporal_right', 'periocular_right', 'occipital'],
    painTypes: ['pulsatile'],
    auras: ['visual_scintillating', 'aphasia_speech'],
    symptoms: ['photophobia', 'phonophobia', 'nausea', 'allodynia'],
    triggers: ['hormones_cycle', 'lack_of_sleep'],
    medications: [
      { id: 'med-5', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '09:30', relief: 'complete' }
    ],
    nonPharmaRemedies: ['dark_room', 'quiet_breathing'],
    impactOnDay: 'severe',
    notes: 'Migraine cataméniale (début de cycle). Aura visuelle et difficulté d’élocution passagère.'
  },
  {
    id: 'mig-seed-5',
    startDate: '2026-09-04T18:20',
    endDate: '2026-09-04T22:00',
    inProgress: false,
    intensity: 4,
    locations: ['temporal_left'],
    painTypes: ['throbbing'],
    auras: ['none'],
    symptoms: ['photophobia', 'extreme_fatigue'],
    triggers: ['coffee_caffeine'],
    medications: [
      { id: 'med-6', name: 'Paracétamol', dose: '1000 mg', takenAt: '18:40', relief: 'partial' }
    ],
    nonPharmaRemedies: ['hydration'],
    impactOnDay: 'mild',
    notes: 'Sevrage caféine en fin de semaine. Céphalée d’intensité modérée.'
  },
  {
    id: 'mig-seed-6',
    startDate: '2026-08-22T11:00',
    endDate: '2026-08-22T19:30',
    inProgress: false,
    intensity: 7,
    locations: ['temporal_right', 'periocular_right'],
    painTypes: ['pulsatile'],
    auras: ['visual_scintillating'],
    symptoms: ['photophobia', 'nausea'],
    triggers: ['weather_pressure', 'stress'],
    medications: [
      { id: 'med-7', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '11:30', relief: 'complete' }
    ],
    nonPharmaRemedies: ['dark_room'],
    impactOnDay: 'severe',
    notes: 'Orage violent l’après-midi. Forte chute barométrique.'
  },
  {
    id: 'mig-seed-7',
    startDate: '2026-08-10T15:00',
    endDate: '2026-08-10T21:00',
    inProgress: false,
    intensity: 6,
    locations: ['frontal', 'temporal_left'],
    painTypes: ['tension', 'throbbing'],
    auras: ['none'],
    symptoms: ['phonophobia', 'photophobia'],
    triggers: ['blue_light_screens'],
    medications: [
      { id: 'med-8', name: 'Ibuprofène', dose: '400 mg', takenAt: '15:20', relief: 'complete' }
    ],
    nonPharmaRemedies: ['cold_compress'],
    impactOnDay: 'moderate',
    notes: 'Journée continue devant double écran sans pause visuelle.'
  },
  {
    id: 'mig-seed-8',
    startDate: '2026-07-29T08:30',
    endDate: '2026-07-29T17:00',
    inProgress: false,
    intensity: 8,
    locations: ['temporal_left', 'periocular_left', 'occipital'],
    painTypes: ['pulsatile', 'stabbing'],
    auras: ['visual_blur', 'sensory_numbness'],
    symptoms: ['photophobia', 'vomiting', 'neck_stiffness'],
    triggers: ['lack_of_sleep', 'travel'],
    medications: [
      { id: 'med-9', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '09:00', relief: 'complete' }
    ],
    nonPharmaRemedies: ['dark_room', 'sleep'],
    impactOnDay: 'bedridden',
    notes: 'Retour de voyage en train, nuit courte de 4 heures.'
  },
  {
    id: 'mig-seed-9',
    startDate: '2026-07-14T17:00',
    endDate: '2026-07-14T23:00',
    inProgress: false,
    intensity: 5,
    locations: ['temporal_right'],
    painTypes: ['throbbing'],
    auras: ['none'],
    symptoms: ['photophobia', 'brain_fog'],
    triggers: ['alcohol', 'noise'],
    medications: [
      { id: 'med-10', name: 'Ibuprofène', dose: '400 mg', takenAt: '17:30', relief: 'complete' }
    ],
    nonPharmaRemedies: ['hydration'],
    impactOnDay: 'moderate',
    notes: 'Verre de vin blanc en terrasse bruyante.'
  },
  {
    id: 'mig-seed-10',
    startDate: '2026-06-25T14:00',
    endDate: '2026-06-25T20:30',
    inProgress: false,
    intensity: 7,
    locations: ['temporal_right', 'periocular_right'],
    painTypes: ['pulsatile'],
    auras: ['visual_scintillating'],
    symptoms: ['photophobia', 'phonophobia', 'nausea'],
    triggers: ['stress', 'skipped_meal'],
    medications: [
      { id: 'med-11', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '14:20', relief: 'complete' }
    ],
    nonPharmaRemedies: ['dark_room'],
    impactOnDay: 'severe',
    notes: 'Période d’évaluation annuelle, repas sauté à midi.'
  },
  {
    id: 'mig-seed-11',
    startDate: '2026-06-11T09:30',
    endDate: '2026-06-11T16:00',
    inProgress: false,
    intensity: 6,
    locations: ['frontal', 'vertex'],
    painTypes: ['tension'],
    auras: ['none'],
    symptoms: ['photophobia', 'extreme_fatigue'],
    triggers: ['weather_pressure'],
    medications: [
      { id: 'med-12', name: 'Paracétamol', dose: '1000 mg', takenAt: '10:00', relief: 'partial' }
    ],
    nonPharmaRemedies: ['cold_compress'],
    impactOnDay: 'moderate',
    notes: 'Chaleur orageuse et moiteur étouffante.'
  },
  {
    id: 'mig-seed-12',
    startDate: '2026-05-18T10:00',
    endDate: '2026-05-18T18:00',
    inProgress: false,
    intensity: 8,
    locations: ['temporal_left', 'periocular_left'],
    painTypes: ['pulsatile'],
    auras: ['visual_scintillating'],
    symptoms: ['photophobia', 'nausea'],
    triggers: ['hormones_cycle', 'stress'],
    medications: [
      { id: 'med-13', name: 'Zolmitriptan (Zomig)', dose: '2.5 mg', takenAt: '10:30', relief: 'complete' }
    ],
    nonPharmaRemedies: ['dark_room', 'sleep'],
    impactOnDay: 'severe',
    notes: 'Début de cycle et surmenage professionnel.'
  }
];

export const SEED_PREVENTIVES: PreventiveMedication[] = [
  {
    id: 'prev-1',
    name: 'Propranolol',
    dosage: '40 mg',
    frequency: '1 comprimé le matin',
    logs: {
      '2026-10-14': true,
      '2026-10-13': true,
      '2026-10-12': true,
      '2026-10-11': true,
      '2026-10-10': false,
      '2026-10-09': true,
      '2026-10-08': true,
      '2026-10-07': true,
    }
  },
  {
    id: 'prev-2',
    name: 'Magnésium Marin + Vitamine B2',
    dosage: '300 mg / 400 mg',
    frequency: '1 gélule le soir',
    logs: {
      '2026-10-14': true,
      '2026-10-13': true,
      '2026-10-12': true,
      '2026-10-11': true,
      '2026-10-10': true,
      '2026-10-09': true,
      '2026-10-08': true,
    }
  }
];
