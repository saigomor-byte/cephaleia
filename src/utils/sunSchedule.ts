// Utilitaire de calcul et synchronisation crépusculaire / coucher et lever du soleil
// Permet d'activer automatiquement le thème ambré photophobie pour protéger les yeux en soirée et la nuit

export function isNightTime(
  sunsetHour: string = '19:30',
  sunriseHour: string = '07:00',
  referenceDate: Date = new Date()
): boolean {
  const [sunsetH, sunsetM] = sunsetHour.split(':').map((v) => parseInt(v, 10) || 0);
  const [sunriseH, sunriseM] = sunriseHour.split(':').map((v) => parseInt(v, 10) || 0);

  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();
  const sunsetMinutes = sunsetH * 60 + sunsetM;
  const sunriseMinutes = sunriseH * 60 + sunriseM;

  // Case 1: Standard overnight schedule (e.g. Sunset 19:30 -> Sunrise 07:00)
  if (sunsetMinutes > sunriseMinutes) {
    return currentMinutes >= sunsetMinutes || currentMinutes < sunriseMinutes;
  }

  // Case 2: Inverted unusual schedule
  return currentMinutes >= sunsetMinutes && currentMinutes < sunriseMinutes;
}

export function getSunScheduleStatus(
  sunsetHour: string = '19:30',
  sunriseHour: string = '07:00',
  referenceDate: Date = new Date()
): {
  isNight: boolean;
  statusLabel: string;
  nextTransitionText: string;
} {
  const isNight = isNightTime(sunsetHour, sunriseHour, referenceDate);

  if (isNight) {
    return {
      isNight: true,
      statusLabel: 'Période nocturne active',
      nextTransitionText: `Filtre photophobie actif jusqu’au lever du soleil (${sunriseHour})`,
    };
  }

  return {
    isNight: false,
    statusLabel: 'Période diurne',
    nextTransitionText: `Activation automatique programmée au coucher du soleil (${sunsetHour})`,
  };
}
