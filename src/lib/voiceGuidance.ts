/**
 * Web Speech API Voice Guidance & Google Maps Helper
 */

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function stopSpeaking() {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
}

export function speakText(text: string, onEnd?: () => void) {
  if (!isSpeechSupported()) {
    console.warn('Web Speech API is not supported in this browser.');
    return;
  }

  stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;
  utterance.lang = 'en-US';

  if (onEnd) {
    utterance.onend = onEnd;
  }

  window.speechSynthesis.speak(utterance);
}

export function speakNavigationRoute(locationName: string, distanceKm: number, steps: string[], onEnd?: () => void) {
  const intro = `Starting voice navigation to ${locationName}. Total distance is ${distanceKm} kilometers. `;
  const stepsText = steps.map((s, idx) => `Step ${idx + 1}: ${s}`).join('. ');
  const fullScript = `${intro} ${stepsText}. You will arrive at your destination on the right.`;

  speakText(fullScript, onEnd);
}

export function getGoogleMapsSearchUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

export function getGoogleMapsDirectionsUrl(destinationLat: number, destinationLng: number, originLat?: number, originLng?: number): string {
  if (originLat && originLng) {
    return `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${destinationLat},${destinationLng}&travelmode=driving`;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${destinationLat},${destinationLng}&travelmode=driving`;
}

export function generateTurnByTurnSteps(locationName: string, lat: number, lng: number): { distanceKm: number; estTimeMinutes: number; steps: string[] } {
  // Generate realistic route steps based on target coordinates
  const distanceKm = parseFloat((1.2 + Math.abs(lat % 0.05) * 100).toFixed(1));
  const estTimeMinutes = Math.max(3, Math.round(distanceKm * 2.5));

  const steps = [
    `Head East towards the main arterial road.`,
    `In 400 meters, turn left onto Main Panchayat Road.`,
    `Continue straight past the landmark junction for ${Math.max(0.3, distanceKm - 0.5).toFixed(1)} km.`,
    `Turn right towards ${locationName}.`,
    `Arrive at waste collection location ${locationName}.`
  ];

  return { distanceKm, estTimeMinutes, steps };
}
