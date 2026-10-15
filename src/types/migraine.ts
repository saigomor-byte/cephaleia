export type HeadLocation =
  | 'frontal'
  | 'temporal_left'
  | 'temporal_right'
  | 'periocular_left'
  | 'periocular_right'
  | 'vertex'
  | 'occipital'
  | 'cervical';

export type PainType =
  | 'pulsatile' // Battements pulsatiles
  | 'tension' // Pression / étau
  | 'crushing' // Broiement
  | 'burning' // Brûlure
  | 'throbbing' // Élancement
  | 'stabbing'; // Coup de poignard

export type AuraType =
  | 'visual_scintillating' // Scotome scintillant / éclairs
  | 'visual_blur' // Vision floue ou amputée
  | 'sensory_numbness' // Paresthésies / engourdissements
  | 'aphasia_speech' // Troubles du langage / aphasie
  | 'vertigo' // Vertiges / instabilité
  | 'none';

export type SymptomType =
  | 'photophobia' // Sensibilité à la lumière
  | 'phonophobia' // Sensibilité au bruit
  | 'osmophobia' // Sensibilité aux odeurs
  | 'nausea' // Nausées
  | 'vomiting' // Vomissements
  | 'extreme_fatigue' // Épuisement intense
  | 'neck_stiffness' // Raideur de la nuque
  | 'allodynia' // Cuir chevelu douloureux au toucher
  | 'brain_fog'; // Brouillard cérébral / concentration

export type TriggerType =
  | 'stress' // Stress ou chute brutale de tension (décompression)
  | 'lack_of_sleep' // Manque de sommeil / insomnie
  | 'excess_sleep' // Grasse matinée
  | 'weather_pressure' // Changement météo / pression barométrique
  | 'blue_light_screens' // Écrans prolongés / lumière vive
  | 'skipped_meal' // Repas sauté / hypoglycémie
  | 'coffee_caffeine' // Café ou sevrage caféiné
  | 'chocolate_food' // Chocolat, fromage affiné, glutamate
  | 'alcohol' // Alcool (vin blanc, bière...)
  | 'hormones_cycle' // Période menstruelle / ovulation
  | 'noise' // Environnement bruyant
  | 'exercise' // Effort physique inhabituel
  | 'travel'; // Voyage / décalage horaire

export interface MedicationEntry {
  id: string;
  name: string;
  dose: string;
  takenAt: string; // HH:mm or ISO
  relief: 'complete' | 'partial' | 'none' | 'pending';
}

export type NonPharmaRemedy =
  | 'cold_compress' // Poche de glace / compresse froide
  | 'dark_room' // Repos en pièce noire
  | 'hydration' // Grand verre d'eau
  | 'sleep' // Sieste / sommeil
  | 'acupressure' // Point d'acupression (LI4 / He Gu)
  | 'quiet_breathing'; // Respiration guidée / cohérence cardiaque

export type ImpactLevel = 'mild' | 'moderate' | 'severe' | 'bedridden';

export interface MigraineRecord {
  id: string;
  startDate: string; // ISO string: YYYY-MM-DDTHH:mm
  endDate?: string; // ISO string: YYYY-MM-DDTHH:mm
  inProgress: boolean;
  intensity: number; // 1 to 10
  locations: HeadLocation[];
  painTypes: PainType[];
  auras: AuraType[];
  symptoms: SymptomType[];
  triggers: TriggerType[];
  medications: MedicationEntry[];
  nonPharmaRemedies: NonPharmaRemedy[];
  impactOnDay: ImpactLevel;
  notes: string;
  peakIntensity?: number;
}

export interface PreventiveMedication {
  id: string;
  name: string;
  dosage: string;
  frequency: string; // ex: '1x par jour au coucher'
  targetDaysCount?: number;
  logs: Record<string, boolean>; // key: YYYY-MM-DD -> boolean
}

export interface DailyReminders {
  preventiveReminderEnabled: boolean;
  preventiveReminderTime: string; // e.g. '08:30'
  eveningCheckinEnabled: boolean;
  eveningCheckinTime: string; // e.g. '21:00'
}

export interface UserPreferences {
  userName: string;
  neurologistEmail?: string;
  neurologistName?: string;
  photophobiaMode: boolean; // Ultra-dimmed / amber warm dark palette
  soundType: 'brown' | 'pink' | 'binaural' | 'water';
  screenDimLevel: number; // 0 to 80% opacity overlay
  reminders?: DailyReminders;
  autoPhotophobiaSunset?: boolean; // Synchronisation automatique coucher/lever du soleil
  sunsetHour?: string; // e.g. '19:30'
  sunriseHour?: string; // e.g. '07:00'
}
