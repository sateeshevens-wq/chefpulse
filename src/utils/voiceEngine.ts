/**
 * Multilingual Voice & Localization Engine for ChefPulse Dispatch
 * Supports Pan-India gig worker accessibility across 7 Indian languages:
 * - English ('en')
 * - Hindi ('hi' - हिन्दी)
 * - Kannada ('kn' - ಕನ್ನಡ)
 * - Tamil ('ta' - தமிழ்)
 * - Telugu ('te' - తెలుగు)
 * - Marathi ('mr' - मराठी)
 * - Bengali ('bn' - বাংলা)
 * 
 * Uses Web Speech API (window.speechSynthesis) with graceful speech synthesis fallbacks.
 */

export type SupportedLanguage = 'en' | 'kn' | 'hi' | 'ta' | 'te' | 'mr' | 'bn';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
  voiceLang: string;
  speechTag: string;
  stateFocus: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', flag: '🇬🇧', voiceLang: 'en-IN', speechTag: 'English (India)', stateFocus: 'Pan-India' },
  { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी', flag: '🇮🇳', voiceLang: 'hi-IN', speechTag: 'हिन्दी (उत्तर भारत)', stateFocus: 'Delhi, UP, MP, Rajasthan' },
  { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ', flag: '🇮🇳', voiceLang: 'kn-IN', speechTag: 'ಕನ್ನಡ (ಕರ್ನಾಟಕ)', stateFocus: 'Karnataka (Bengaluru)' },
  { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்', flag: '🇮🇳', voiceLang: 'ta-IN', speechTag: 'தமிழ் (தமிழ்நாடு)', stateFocus: 'Tamil Nadu (Chennai)' },
  { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు', flag: '🇮🇳', voiceLang: 'te-IN', speechTag: 'తెలుగు (ఆంధ్ర / తెలంగాణ)', stateFocus: 'Telangana & AP (Hyderabad)' },
  { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी', flag: '🇮🇳', voiceLang: 'mr-IN', speechTag: 'मराठी (महाराष्ट्र)', stateFocus: 'Maharashtra (Mumbai & Pune)' },
  { code: 'bn', label: 'Bengali', nativeLabel: 'বাংলা', flag: '🇮🇳', voiceLang: 'bn-IN', speechTag: 'বাংলা (পশ্চিমবঙ্গ)', stateFocus: 'West Bengal (Kolkata)' },
];

export interface IncomingOrderVoicePayload {
  customerName: string;
  area: string;
  distanceKm: number;
  payout: number;
  dishes: string;
}

/**
 * Generate human-friendly localized readout text in the chosen language
 */
export function getLocalizedOrderSpeech(
  lang: SupportedLanguage,
  payload: IncomingOrderVoicePayload
): { speechText: string; title: string; subtitle: string } {
  switch (lang) {
    case 'kn':
      return {
        speechText: `ಹೊಸ ಆರ್ಡರ್ ಬಂದಿದೆ! ಗ್ರಾಹಕರು ${payload.customerName}, ಸ್ಥಳ ${payload.area}, ದೂರ ${payload.distanceKm} ಕಿಲೋಮೀಟರ್. ಪಾವತಿ ${payload.payout} ರೂಪಾಯಿಗಳು. ಅಡುಗೆ: ${payload.dishes}. ಸ್ವೀಕರಿಸಲು ಮೂವತ್ತು ಸೆಕೆಂಡುಗಳು.`,
        title: 'ಹೊಸ ತುರ್ತು ಅಡುಗೆ ಆರ್ಡರ್!',
        subtitle: `${payload.area} • ₹${payload.payout} ಸಂಭಾವನೆ • ${payload.distanceKm} ಕಿ.ಮೀ`,
      };
    case 'hi':
      return {
        speechText: `नया शेफ बुकिंग अलर्ट! ग्राहक ${payload.customerName}, स्थान ${payload.area}, दूरी ${payload.distanceKm} किलोमीटर. कुल भुगतान ${payload.payout} रुपये. व्यंजन: ${payload.dishes}. स्वीकार करने के लिए तीस सेकंड शेष.`,
        title: 'नया शेफ बुकिंग अलर्ट!',
        subtitle: `${payload.area} • ₹${payload.payout} कुल भुगतान • ${payload.distanceKm} किमी`,
      };
    case 'ta':
      return {
        speechText: `புதிய சமையல் முன்பதிவு! வாடிக்கையாளர் ${payload.customerName}, இடம் ${payload.area}, தூரம் ${payload.distanceKm} கிலோமீட்டர். வருமானம் ${payload.payout} ரூபாய். மெனு: ${payload.dishes}. ஏற்க முப்பது வினாடிகள் உள்ளன.`,
        title: 'புதிய சமையல் முன்பதிவு!',
        subtitle: `${payload.area} • ₹${payload.payout} வருமானம் • ${payload.distanceKm} கி.மீ`,
      };
    case 'te':
      return {
        speechText: `కొత్త చెఫ్ బుకింగ్ అలర్ట్! కస్టమర్ ${payload.customerName}, ప్రాంతం ${payload.area}, దూరం ${payload.distanceKm} కిలోమీటర్లు. చెల్లింపు ${payload.payout} రూపాయలు. వంటకాలు: ${payload.dishes}. అంగీకరించడానికి ముప్పై సెకన్లు మిగిలి ఉన్నాయి.`,
        title: 'కొత్త ఆర్డర్ వచ్చింది!',
        subtitle: `${payload.area} • ₹${payload.payout} సంపాదన • ${payload.distanceKm} కి.మీ`,
      };
    case 'mr':
      return {
        speechText: `नवीन शेफ बुकिंग अलर्ट! ग्राहक ${payload.customerName}, ठिकाण ${payload.area}, अंतर ${payload.distanceKm} किलोमीटर. निव्वळ मोबदला ${payload.payout} रुपये. मेनू: ${payload.dishes}. स्वीकारण्यासाठी तीस सेकंद शिल्लक.`,
        title: 'नवीन शेफ बुकिंग अलर्ट!',
        subtitle: `${payload.area} • ₹${payload.payout} निव्वळ कमाई • ${payload.distanceKm} किमी`,
      };
    case 'bn':
      return {
        speechText: `নতুন শেফ বুকিং অ্যালার্ট! গ্রাহক ${payload.customerName}, এলাকা ${payload.area}, দূরত্ব ${payload.distanceKm} কিলোমিটার। মোট উপার্জন ${payload.payout} টাকা। মেনু: ${payload.dishes}। গ্রহণ করার জন্য ৩০ সেকেন্ড বাকি।`,
        title: 'নতুন শেফ বুকিং এসেছে!',
        subtitle: `${payload.area} • ₹${payload.payout} মোট উপার্জন • ${payload.distanceKm} কিমি`,
      };
    case 'en':
    default:
      return {
        speechText: `New SOS Chef Order! Customer ${payload.customerName} in ${payload.area}, ${payload.distanceKm} kilometers away. Net payout rupees ${payload.payout}. Requested dishes: ${payload.dishes}. Thirty seconds to accept.`,
        title: 'New SOS Chef Booking Alert!',
        subtitle: `${payload.area} • ₹${payload.payout} Net Payout • ${payload.distanceKm} km away`,
      };
  }
}

/**
 * UI Translation Dictionaries for the Chef App across all 7 languages
 */
export const CHEF_UI_TRANSLATIONS: Record<SupportedLanguage, {
  onlineStatus: string;
  offlineStatus: string;
  radarHeading: string;
  radarSubheading: string;
  activeGig: string;
  schedule: string;
  b2bJobs: string;
  earnings: string;
  incomingPingTitle: string;
  acceptGig: string;
  passGig: string;
  distance: string;
  payout: string;
  dishes: string;
  navigation: string;
  callCustomer: string;
  enterOtp: string;
  verifyArrival: string;
  slideToComplete: string;
  safetyCheck: string;
  voiceReadout: string;
  testSpeech: string;
  zeroTouchKyc: string;
}> = {
  en: {
    onlineStatus: 'ONLINE (GPS Broadcasting)',
    offlineStatus: 'OFFLINE (Tap to Go Online)',
    radarHeading: 'Dispatch Radar & Live Pings',
    radarSubheading: 'Broadcasting your real-time GPS location within 5 km radius',
    activeGig: 'Active Gig',
    schedule: 'Schedule',
    b2bJobs: 'B2B Job Board',
    earnings: 'Earnings & Wallet',
    incomingPingTitle: 'Incoming Booking Request!',
    acceptGig: 'ACCEPT GIG',
    passGig: 'PASS / ROUTE NEXT',
    distance: 'Distance',
    payout: 'Net Payout',
    dishes: 'Requested Dishes',
    navigation: 'Google Maps Navigation',
    callCustomer: 'Call Customer',
    enterOtp: 'Enter 4-Digit Arrival OTP',
    verifyArrival: 'Verify Arrival',
    slideToComplete: 'Slide to Complete Job',
    safetyCheck: 'SOS Emergency Alert',
    voiceReadout: 'Voice Readout Alerts',
    testSpeech: 'Test Voice Readout',
    zeroTouchKyc: 'Zero-Touch AI Verification',
  },
  hi: {
    onlineStatus: 'ऑनलाइन (जीपीएस चालू)',
    offlineStatus: 'ऑफलाइन (शुरू करने के लिए टैप करें)',
    radarHeading: 'डिस्पैच रडार और लाइव ऑर्डर',
    radarSubheading: '५ किमी दायरे में आपका रीयल-टाइम जीपीएस प्रसारित हो रहा है',
    activeGig: 'चालू बुकिंग',
    schedule: 'शेड्यूल',
    b2bJobs: 'हॉस्पिटैलिटी जॉब बोर्ड',
    earnings: 'कमाई और वॉलेट',
    incomingPingTitle: 'नया बुकिंग अनुरोध!',
    acceptGig: 'स्वीकार करें (ACCEPT)',
    passGig: 'छोड़ें (PASS)',
    distance: 'दूरी',
    payout: 'शुद्ध कमाई',
    dishes: 'मांगे गए व्यंजन',
    navigation: 'गूगल मैप्स नेविगेशन',
    callCustomer: 'ग्राहक को कॉल करें',
    enterOtp: '४-अंकों का आगमन ओटीपी दर्ज करें',
    verifyArrival: 'आगमन सत्यापित करें',
    slideToComplete: 'काम पूरा करने के लिए स्लाइड करें',
    safetyCheck: 'एसओएस सुरक्षा अलार्म',
    voiceReadout: 'वॉइस रीडआउट अलर्ट',
    testSpeech: 'आवाज टेस्ट करें',
    zeroTouchKyc: 'जीरो-टच एआई सत्यापन',
  },
  kn: {
    onlineStatus: 'ಆನ್‌ಲೈನ್ (ಜಿಪಿಎಸ್ ಸಕ್ರಿಯ)',
    offlineStatus: 'ಆಫ್‌ಲೈನ್ (ಆನ್‌ಲೈನ್ ಆಗಲು ಟ್ಯಾಪ್ ಮಾಡಿ)',
    radarHeading: 'ಡಿಸ್ಪ್ಯಾಚ್ ರೇಡಾರ್ & ಲೈವ್ ಆರ್ಡರ್‌ಗಳು',
    radarSubheading: '೫ ಕಿ.ಮೀ ವ್ಯಾಪ್ತಿಯಲ್ಲಿ ನಿಮ್ಮ ಲೈವ್ ಜಿಪಿಎಸ್ ಪ್ರಸಾರವಾಗುತ್ತಿದೆ',
    activeGig: 'ಚಾಲ್ತಿ ಆರ್ಡರ್',
    schedule: 'ವೇಳಾಪಟ್ಟಿ',
    b2bJobs: 'ಉದ್ಯೋಗ ಮಂಡಳಿ',
    earnings: 'ಗಳಿಕೆ ಮತ್ತು ವಾಲೆಟ್',
    incomingPingTitle: 'ಹೊಸ ಬುಕಿಂಗ್ ವಿನಂತಿ ಬಂದಿದೆ!',
    acceptGig: 'ಸ್ವೀಕರಿಸಿ (ACCEPT)',
    passGig: 'ಮುಂದಕ್ಕೆ ಕಳುಹಿಸಿ (PASS)',
    distance: 'ದೂರ',
    payout: 'ಸಂಭಾವನೆ',
    dishes: 'ಮೆನು / ಅಡುಗೆ',
    navigation: 'ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ನ್ಯಾವಿಗೇಷನ್',
    callCustomer: 'ಗ್ರಾಹಕರಿಗೆ ಕರೆ ಮಾಡಿ',
    enterOtp: '೪-ಅಂಕಿಯ ಆಗಮನ ಒಟಿಪಿ ನಮೂದಿಸಿ',
    verifyArrival: 'ಆಗಮನ ದೃಢೀಕರಿಸಿ',
    slideToComplete: 'ಕೆಲಸ ಪೂರ್ಣಗೊಳಿಸಲು ಸ್ಲೈಡ್ ಮಾಡಿ',
    safetyCheck: 'ತುರ್ತು ಸುರಕ್ಷತೆ ಎಸ್‌ಒಎಸ್',
    voiceReadout: 'ಧ್ವನಿ ಓದುವಿಕೆ ಎಚ್ಚರಿಕೆ',
    testSpeech: 'ಧ್ವನಿ ಪರೀಕ್ಷೆ',
    zeroTouchKyc: 'ಶೂನ್ಯ-ಸ್ಪರ್ಶ ಎಐ ಪರಿಶೀಲನೆ',
  },
  ta: {
    onlineStatus: 'ஆன்லைன் (ஜிபிஎஸ் நேரலை)',
    offlineStatus: 'ஆஃப்லைன் (ஆன்லைன் செல்ல தட்டவும்)',
    radarHeading: 'ரேடார் & நேரலை முன்பதிவுகள்',
    radarSubheading: '5 கி.மீ சுற்றளவில் உங்கள் இருப்பிடம் பகிரப்படுகிறது',
    activeGig: 'செயலில் உள்ள வேலை',
    schedule: 'அட்டவணை',
    b2bJobs: 'வேலை வாய்ப்புகள்',
    earnings: 'வருமானம் & பணப்பை',
    incomingPingTitle: 'புதிய சமையல் கோரிக்கை!',
    acceptGig: 'ஏற்றுக்கொள் (ACCEPT)',
    passGig: 'நிராகரி (PASS)',
    distance: 'தூரம்',
    payout: 'நிகர வருமானம்',
    dishes: 'கோரப்பட்ட உணவுகள்',
    navigation: 'கூகுள் வரைபடம் வழிசெலுத்தல்',
    callCustomer: 'வாடிக்கையாளரை அழைக்கவும்',
    enterOtp: '4-இலக்க வருகை OTP உள்ளிடவும்',
    verifyArrival: 'வருகையை சரிபார்க்கவும்',
    slideToComplete: 'முடிக்க ஸ்லைடு செய்யவும்',
    safetyCheck: 'அவசர பாதுகாப்பு SOS',
    voiceReadout: 'குரல் வாசிப்பு அறிவிப்பு',
    testSpeech: 'குரலை சோதிக்கவும்',
    zeroTouchKyc: 'தானியங்கி AI சரிபார்ப்பு',
  },
  te: {
    onlineStatus: 'ఆన్‌లైన్ (జీపీఎస్ ప్రసారం అవుతోంది)',
    offlineStatus: 'ఆఫ్‌లైన్ (ఆన్‌లైన్ కావడానికి తాకండి)',
    radarHeading: 'డిస్పాచ్ రాడార్ & ఆర్డర్లు',
    radarSubheading: '5 కి.మీ పరిధిలో మీ లైవ్ జీపీఎస్ లొకేషన్ అందుబాటులో ఉంది',
    activeGig: 'ప్రస్తుత ఆర్డర్',
    schedule: 'షెడ్యూల్',
    b2bJobs: 'జాబ్ బోర్డు',
    earnings: 'ఆదాయం & వాలెట్',
    incomingPingTitle: 'కొత్త బుకింగ్ అభ్యర్థన వచ్చింది!',
    acceptGig: 'అంగీకరించు (ACCEPT)',
    passGig: 'వదిలేయి (PASS)',
    distance: 'దూరం',
    payout: 'నికర ఆదాయం',
    dishes: 'కోరిన వంటకాలు',
    navigation: 'గూగుల్ మ్యాప్స్ నావిగేషన్',
    callCustomer: 'కస్టమర్‌కు కాల్ చేయండి',
    enterOtp: '4-అంకెల ఆగమన OTP నమోదు చేయండి',
    verifyArrival: 'రాకను ధృవీకరించండి',
    slideToComplete: 'పూర్తి చేయడానికి స్లైడ్ చేయండి',
    safetyCheck: 'ఎమర్జెన్సీ SOS అలర్ట్',
    voiceReadout: 'వాయిస్ రీడౌట్ అలర్ట్స్',
    testSpeech: 'వాయిస్ పరీక్షించండి',
    zeroTouchKyc: 'జీరో-టచ్ AI ధృవీకరణ',
  },
  mr: {
    onlineStatus: 'ऑनलाईन (जीपीएस थेट चालू)',
    offlineStatus: 'ऑफलाईन (सुरू करण्यासाठी टॅप करा)',
    radarHeading: 'डिस्पॅच रडार आणि लाईव्ह ऑर्डर्स',
    radarSubheading: '५ किमी परिसरात तुमचे जीपीएस स्थान ब्रॉडकास्ट होत आहे',
    activeGig: 'सक्रिय ऑर्डर',
    schedule: 'वेळापत्रक',
    b2bJobs: 'हॉस्पिटॅलिटी नोकऱ्या',
    earnings: 'कमाई आणि पाकीट',
    incomingPingTitle: 'नवीन बुकिंग विनंती!',
    acceptGig: 'स्वीकारा (ACCEPT)',
    passGig: 'पुढील शेफकडे पाठवा (PASS)',
    distance: 'अंतर',
    payout: 'निव्वळ मोबदला',
    dishes: 'मागवलेले पदार्थ',
    navigation: 'गुगल मॅप्स नेव्हिगेशन',
    callCustomer: 'ग्राहकाला कॉल करा',
    enterOtp: '४-अंकी आगमन OTP टाका',
    verifyArrival: 'आगमन सत्यापित करा',
    slideToComplete: 'काम पूर्ण करण्यासाठी स्वाइप करा',
    safetyCheck: 'एसओएस सुरक्षा इशारा',
    voiceReadout: 'व्हॉइस रीडआउट सूचना',
    testSpeech: 'आवाज तपासा',
    zeroTouchKyc: 'झिरो-टच एआय पडताळणी',
  },
  bn: {
    onlineStatus: 'অনলাইন (লাইভ জিপিএস সক্রিয়)',
    offlineStatus: 'অফলাইন (অনলাইন হতে ট্যাপ করুন)',
    radarHeading: 'ডিসপ্যাচ রাডার ও লাইভ বুকিং',
    radarSubheading: '৫ কিমি পরিধিতে আপনার লাইভ অবস্থান সম্প্রচারিত হচ্ছে',
    activeGig: 'চলমান বুকিং',
    schedule: 'সময়সূচী',
    b2bJobs: 'চাকরির বোর্ড',
    earnings: 'মোট আয় ও ওয়ালেট',
    incomingPingTitle: 'নতুন বুকিং অনুরোধ এসেছে!',
    acceptGig: 'গ্রহণ করুন (ACCEPT)',
    passGig: 'পরবর্তী শেফে পাঠান (PASS)',
    distance: 'দূরত্ব',
    payout: 'মোট উপার্জন',
    dishes: 'অনুরোধকৃত পদসমূহ',
    navigation: 'গুগল ম্যাপস নেভিগেশন',
    callCustomer: 'গ্রাহককে কল করুন',
    enterOtp: '৪-সংখ্যার আগমন OTP লিখুন',
    verifyArrival: 'আগমন নিশ্চিত করুন',
    slideToComplete: 'সম্পন্ন করতে স্লাইড করুন',
    safetyCheck: 'জরুরি এসওএস নিরাপত্তা',
    voiceReadout: 'ভয়েস রিডআউট অ্যালার্ট',
    testSpeech: 'ভয়েস পরীক্ষা করুন',
    zeroTouchKyc: 'জিরো-টাচ এআই যাচাইকরণ',
  },
};

/**
 * Speak the text using Web Speech API with regional speech synthesis
 */
export function speakOrderAnnouncement(
  lang: SupportedLanguage,
  payload: IncomingOrderVoicePayload,
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  try {
    window.speechSynthesis.cancel(); // cancel any ongoing speech

    const { speechText } = getLocalizedOrderSpeech(lang, payload);
    const utterance = new SpeechSynthesisUtterance(speechText);
    
    // Choose appropriate locale
    const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === lang);
    utterance.lang = langConfig?.voiceLang || 'en-IN';
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Pick a matching voice if available
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const match = voices.find(
        (v) => v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()) || 
               v.lang.toLowerCase().includes(lang) ||
               v.name.toLowerCase().includes(lang)
      );
      if (match) {
        utterance.voice = match;
      }
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Voice synthesis error:', err);
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Cancel any ongoing speech
 */
export function stopVoiceSpeech(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}
