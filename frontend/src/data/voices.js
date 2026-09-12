export const AVAILABLE_VOICES = [
  { id: 'en-US-1', name: 'Alloy', languageCode: 'en', languageName: 'English', gender: 'Female', accent: 'American', style: 'Conversational' },
  { id: 'en-US-2', name: 'Echo', languageCode: 'en', languageName: 'English', gender: 'Male', accent: 'American', style: 'Narrative' },
  { id: 'en-GB-1', name: 'Onyx', languageCode: 'en', languageName: 'English', gender: 'Male', accent: 'British', style: 'News' },
  { id: 'es-ES-1', name: 'Carmen', languageCode: 'es', languageName: 'Spanish', gender: 'Female', accent: 'Spain', style: 'Standard' },
  { id: 'es-ES-2', name: 'Jorge', languageCode: 'es', languageName: 'Spanish', gender: 'Male', accent: 'Spain', style: 'Standard' },
  { id: 'fr-FR-1', name: 'Juliette', languageCode: 'fr', languageName: 'French', gender: 'Female', accent: 'France', style: 'Standard' },
  { id: 'fr-FR-2', name: 'Pierre', languageCode: 'fr', languageName: 'French', gender: 'Male', accent: 'France', style: 'Standard' },
  { id: 'de-DE-1', name: 'Katja', languageCode: 'de', languageName: 'German', gender: 'Female', accent: 'Germany', style: 'Standard' },
  { id: 'de-DE-2', name: 'Conrad', languageCode: 'de', languageName: 'German', gender: 'Male', accent: 'Germany', style: 'Standard' },
  { id: 'hi-IN-1', name: 'Aditi', languageCode: 'hi', languageName: 'Hindi', gender: 'Female', accent: 'India', style: 'Standard' },
  { id: 'hi-IN-2', name: 'Ravi', languageCode: 'hi', languageName: 'Hindi', gender: 'Male', accent: 'India', style: 'Standard' },
  { id: 'gu-IN-1', name: 'Dhwani', languageCode: 'gu', languageName: 'Gujarati', gender: 'Female', accent: 'India', style: 'Standard' },
  { id: 'gu-IN-2', name: 'Niranjan', languageCode: 'gu', languageName: 'Gujarati', gender: 'Male', accent: 'India', style: 'Standard' },
  { id: 'mr-IN-1', name: 'Aarohi', languageCode: 'mr', languageName: 'Marathi', gender: 'Female', accent: 'India', style: 'Standard' },
  { id: 'mr-IN-2', name: 'Manohar', languageCode: 'mr', languageName: 'Marathi', gender: 'Male', accent: 'India', style: 'Standard' }
];

export const getLanguages = () => {
  const langMap = new Map();
  AVAILABLE_VOICES.forEach(voice => {
    if (!langMap.has(voice.languageCode)) {
      langMap.set(voice.languageCode, { code: voice.languageCode, name: voice.languageName });
    }
  });
  return Array.from(langMap.values());
};

export const getVoicesForLanguage = (languageCode) => {
  if (!languageCode) return [];
  return AVAILABLE_VOICES.filter(voice => voice.languageCode === languageCode);
};
