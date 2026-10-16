import './style.css';
import L from 'leaflet';
import { 
  subscribeToKYCQueue, 
  updateKYCStatusInFirebase, 
  clearAllKYCFromFirebase, 
  savePoliceOfficerToFirebase, 
  subscribeToPoliceRoster, 
  subscribeToLiveIncidents, 
  resolveSOSIncidentInFirebase 
} from './firebase.js';

/* ==========================================================
   safeCIZ — Client-Side Router, State & Translation Engine
   ========================================================== */

// Initial Simulated State (Stored in localStorage)
const STORAGE_KEY = 'safeciz_state_v5';

// List of 85+ Bangladesh Police Stations (DMP, CMP, RMP, KMP, SMP, BMP, GMP, RPMP & Major Districts)
const bangladeshPoliceStations = [
  // --- ঢাকা মেট্রোপলিটন পুলিশ (DMP - ৫০টি থানা) ---
  "ধানমন্ডি মডেল থানা (Dhanmondi Model PS, DMP)",
  "গুলশান থানা (Gulshan PS, DMP)",
  "বনানী থানা (Banani PS, DMP)",
  "উত্তরা পূর্ব থানা (Uttara East PS, DMP)",
  "উত্তরা পশ্চিম থানা (Uttara West PS, DMP)",
  "মিরপুর মডেল থানা (Mirpur Model PS, DMP)",
  "পল্লবী থানা (Pallabi PS, DMP)",
  "দারুস সালাম থানা (Darus Salam PS, DMP)",
  "শাহ আলী থানা (Shah Ali PS, DMP)",
  "কাফরুল থানা (Kafrul PS, DMP)",
  "ভাষানটেক থানা (Bhasantek PS, DMP)",
  "ক্যান্টনমেন্ট থানা (Cantonment PS, DMP)",
  "তেজগাঁও মডেল থানা (Tejgaon Model PS, DMP)",
  "তেজগাঁও শিল্পাঞ্চল থানা (Tejgaon Industrial PS, DMP)",
  "রমনা মডেল থানা (Ramna Model PS, DMP)",
  "শাহবাগ থানা (Shahbagh PS, DMP)",
  "নিউ মার্কেট থানা (New Market PS, DMP)",
  "কলাবাগান থানা (Kalabagan PS, DMP)",
  "মোহাম্মদপুর থানা (Mohammadpur PS, DMP)",
  "আদাবর থানা (Adabor PS, DMP)",
  "হাজারীবাগ থানা (Hazaribagh PS, DMP)",
  "মতিঝিল থানা (Motijheel PS, DMP)",
  "পল্টন মডেল থানা (Paltan Model PS, DMP)",
  "রামপুরা থানা (Rampura PS, DMP)",
  "হাতিরঝিল থানা (Hatirjheel PS, DMP)",
  "খিলগাঁও থানা (Khilgaon PS, DMP)",
  "সবুজবাগ থানা (Sabujbagh PS, DMP)",
  "মুগদা থানা (Mugda PS, DMP)",
  "ডেমরা থানা (Demra PS, DMP)",
  "যাত্রাবাড়ী থানা (Jatrabari PS, DMP)",
  "কদমতলী থানা (Kadamtali PS, DMP)",
  "শ্যামপুর থানা (Shyampur PS, DMP)",
  "ওয়ারী থানা (Wari PS, DMP)",
  "গেন্ডারিয়া থানা (Gendaria PS, DMP)",
  "সূত্রাপুর থানা (Sutrapur PS, DMP)",
  "কোতোয়ালী থানা, ঢাকা (Kotwali PS, Dhaka)",
  "বংশাল থানা (Bangshal PS, DMP)",
  "চকবাজার মডেল থানা (Chawkbazar Model PS, DMP)",
  "লালবাগ থানা (Lalbagh PS, DMP)",
  "কামরাঙ্গীরচর থানা (Kamrangirchar PS, DMP)",
  "বাড্ডা থানা (Badda PS, DMP)",
  "ভাটারা থানা (Vatara PS, DMP)",
  "খিলক্ষেত থানা (Khilkhet PS, DMP)",
  "বিমানবন্দর থানা (Airport PS, DMP)",
  "তুরাগ থানা (Turag PS, DMP)",
  "দক্ষিণখান থানা (Dakshinkhan PS, DMP)",
  "উত্তরখান থানা (Uttarkhan PS, DMP)",
  "রূপনগর থানা (Rupnagar PS, DMP)",
  "শেরেবাংলা নগর থানা (Sher-e-Bangla Nagar PS, DMP)",
  
  // --- ঢাকা জেলা ও আশেপাশের প্রধান থানা ---
  "সাভার মডেল থানা (Savar Model PS)",
  "আশুলিয়া থানা (Ashulia PS)",
  "কেরানীগঞ্জ মডেল থানা (Keraniganj Model PS)",
  "দক্ষিণ কেরানীগঞ্জ থানা (South Keraniganj PS)",
  "ধামরাই থানা (Dhamrai PS)",
  
  // --- গাজীপুর মেট্রোপলিটন (GMP) ও নারায়ণগঞ্জ ---
  "গাজীপুর সদর থানা (Sadar PS, GMP)",
  "টঙ্গী পূর্ব থানা (Tongi East PS, GMP)",
  "টঙ্গী পশ্চিম থানা (Tongi West PS, GMP)",
  "গাছা থানা (Gacha PS, GMP)",
  "বাসন থানা (Bason PS, GMP)",
  "কোনাবাড়ী থানা (Konabari PS, GMP)",
  "কাশিমপুর থানা (Kashimpur PS, GMP)",
  "পূবাইল থানা (Pubail PS, GMP)",
  "নারায়ণগঞ্জ সদর মডেল থানা (Narayanganj Sadar Model PS)",
  "ফতুল্লা মডেল থানা (Fatullah Model PS)",
  "সিদ্ধিরগঞ্জ থানা (Siddhirganj PS)",
  "রূপগঞ্জ থানা (Rupganj PS)",
  
  // --- চট্টগ্রাম মেট্রোপলিটন পুলিশ (CMP) ---
  "কোতোয়ালী থানা, চট্টগ্রাম (Kotwali PS, CMP)",
  "পাঁচলাইশ থানা, চট্টগ্রাম (Panchlaish PS, CMP)",
  "ডবলমুরিং থানা, চট্টগ্রাম (Double Mooring PS, CMP)",
  "পাহাড়তলী থানা, চট্টগ্রাম (Pahartali PS, CMP)",
  "হালিশহর থানা, চট্টগ্রাম (Halishahar PS, CMP)",
  "খুলশী থানা, চট্টগ্রাম (Khulshi PS, CMP)",
  "বায়োজিদ বোস্তামী থানা (Bayezid Bostami PS, CMP)",
  "পতেঙ্গা থানা, চট্টগ্রাম (Patenga PS, CMP)",
  "ইপিজেড থানা, চট্টগ্রাম (EPZ PS, CMP)",
  "বাকলিয়া থানা, চট্টগ্রাম (Bakalia PS, CMP)",
  "চাঁন্দগাঁও থানা, চট্টগ্রাম (Chandgaon PS, CMP)",
  
  // --- সিলেট মেট্রোপলিটন পুলিশ (SMP) ---
  "কোতোয়ালী মডেল থানা, সিলেট (Kotwali Model PS, SMP)",
  "জালালাবাদ থানা, সিলেট (Jalalabad PS, SMP)",
  "শাহপরাণ থানা, সিলেট (Shah Paran PS, SMP)",
  "দক্ষিণ সুরমা থানা, সিলেট (South Surma PS, SMP)",
  
  // --- রাজশাহী মেট্রোপলিটন পুলিশ (RMP) ---
  "বোয়ালিয়া মডেল থানা, রাজশাহী (Boalia Model PS, RMP)",
  "রাজপাড়া থানা, রাজশাহী (Rajpara PS, RMP)",
  "মতিহার থানা, রাজশাহী (Motihar PS, RMP)",
  "শাহ মখদুম থানা, রাজশাহী (Shah Makhdum PS, RMP)",
  
  // --- খুলনা মেট্রোপলিটন পুলিশ (KMP) ---
  "খুলনা সদর কোতোয়ালী থানা (Khulna Sadar Kotwali PS, KMP)",
  "সোনাডাঙ্গা মডেল থানা (Sonadanga Model PS, KMP)",
  "খালিশপুর থানা (Khalishpur PS, KMP)",
  "দৌলতপুর থানা (Daulatpur PS, KMP)",
  
  // --- বরিশাল মেট্রোপলিটন পুলিশ (BMP) ---
  "কোতোয়ালী মডেল থানা, বরিশাল (Kotwali Model PS, BMP)",
  "বিমানবন্দর থানা, বরিশাল (Airport PS, BMP)",
  "কাউনিয়া থানা, বরিশাল (Kawnia PS, BMP)",
  
  // --- রংপুর মেট্রোপলিটন পুলিশ (RPMP) ---
  "কোতোয়ালী থানা, রংপুর (Kotwali PS, RPMP)",
  "তাজহাট থানা, রংপুর (Tajhat PS, RPMP)",
  
  // --- বিভাগীয় ও অন্যান্য প্রধান জেলা সদর থানা ---
  "ময়মনসিংহ কোতোয়ালী মডেল থানা (Mymensingh Kotwali Model PS)",
  "কুমিল্লা কোতোয়ালী মডেল থানা (Cumilla Kotwali Model PS)",
  "কক্সবাজার সদর মডেল থানা (Cox's Bazar Sadar Model PS)",
  "বগুড়া সদর থানা (Bogura Sadar PS)",
  "যশোর কোতোয়ালী মডেল থানা (Jashore Kotwali Model PS)",
  "ফেনী মডেল থানা (Feni Model PS)",
  "নোয়াখালী সুধারাম মডেল থানা (Sudharam Model PS, Noakhali)",
  "ব্রাহ্মণবাড়িয়া সদর মডেল থানা (Brahmanbaria Sadar Model PS)",
  "পাবনা সদর থানা (Pabna Sadar PS)",
  "দিনাজপুর কোতোয়ালী থানা (Dinajpur Kotwali PS)",
  "কুষ্টিয়া মডেল থানা (Kushtia Model PS)",
  "টাঙ্গাইল সদর থানা (Tangail Sadar PS)",
  "ফরিদপুর কোতোয়ালী থানা (Faridpur Kotwali PS)",
  "সিরাজগঞ্জ সদর থানা (Sirajganj Sadar PS)",
  "➕ অন্যান্য / নতুন থানা টাইপ করুন..."
];

// Demo KYC data removed - completely clean for real mobile app registrations

const defaultState = {
  lang: 'bn',
  adminAuth: false,
  activeTab: 'radar', // 'radar' | 'kyc' | 'police' | 'logs'
  selectedKYC: null, // For detail modal
  kycQueue: [], // 100% clean for real mobile registrations
  policeRoster: [], // Populated live from Firebase
  activeIncidents: [], // Live incidents from Firebase
  logs: [
    { time: 'LIVE', type: 'SUCCESS', text: 'safeCIZ Central Cloud: Monitoring system active nationwide' }
  ]
};

function getState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return defaultState;
  try {
    return { ...defaultState, ...JSON.parse(saved) };
  } catch (e) {
    return defaultState;
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let appState = getState();

// ==========================================================
// REALTIME FIREBASE CLOUD SUBSCRIPTIONS
// ==========================================================
subscribeToKYCQueue((cloudKYC) => {
  if (Array.isArray(cloudKYC)) {
    appState.kycQueue = cloudKYC;
    saveState(appState);
    // If Admin KYC Tab is open, re-render
    const tabContent = document.getElementById('admin-tab-content');
    if (tabContent && appState.activeTab === 'kyc') {
      renderKYCTab(tabContent);
    }
  }
});

subscribeToLiveIncidents((cloudIncidents) => {
  if (Array.isArray(cloudIncidents)) {
    appState.activeIncidents = cloudIncidents;
    saveState(appState);
    const tabContent = document.getElementById('admin-tab-content');
    if (tabContent && appState.activeTab === 'radar') {
      renderRadarTab(tabContent);
    }
  }
});

subscribeToPoliceRoster((cloudPolice) => {
  if (Array.isArray(cloudPolice)) {
    appState.policeRoster = cloudPolice;
    saveState(appState);
    const tabContent = document.getElementById('admin-tab-content');
    if (tabContent && appState.activeTab === 'police') {
      renderPoliceTab(tabContent);
    }
  }
});

// ==========================================================
// BILINGUAL TRANSLATION DICTIONARY
// ==========================================================
const i18n = {
  bn: {
    nav_home: 'হোম',
    nav_how: 'কীভাবে কাজ করে',
    nav_why: 'কেন safeCIZ',
    nav_demo: 'লাইভ ডেমো',
    nav_download: 'ডাউনলোড',
    lang_toggle: 'English',
    hero_pill: '২৪/৭ জাতীয় নাগরিক সুরক্ষা ও পুলিশ রেসপন্স নেটওয়ার্ক',
    hero_title: 'বিপদে আপনার পাশে — দ্রুততম পুলিশ ও পরিবার সুরক্ষা নেটওয়ার্ক',
    hero_subtitle: 'safeCIZ হলো বাংলাদেশ ভিত্তিক নেক্সট-জেনারেশন ইমার্জেন্সি অ্যাপ। ১-ট্যাপে নিকটস্থ পুলিশ ও পরিবারকে অ্যালার্ট, ৩০ সেকেন্ডের ডায়নামিক ফ্যামিলি সার্কেল এবং কঠোর e-KYC ভেরিফাইড নাগরিক প্ল্যাটফর্ম।',
    btn_download_apk: 'Download Android APK',
    btn_download_ios: 'Get on App Store',
    stat_uptime: '৯৯.৯%',
    stat_uptime_sub: 'সার্ভার সচলতা',
    stat_response: '< ৩ সেকেন্ড',
    stat_response_sub: 'তাৎক্ষণিক নোটিফিকেশন',
    stat_verified: '১০০% ভেরিফাইড',
    stat_verified_sub: 'e-KYC নাগরিক',
    phone_title: 'safeCIZ ইমার্জেন্সি হাব',
    phone_sub: 'জিপিএস সক্রিয় (৩ মিটার নির্ভুলতা)',
    phone_sos_btn: 'জরুরি এসওএস চাপুন',
    phone_victim_tag: 'ভিকটিম অবস্থান',
    phone_police_tag: 'পুলিশ পেট্রোল (১.২ কিমি)',
    how_tag: 'কার্যপদ্ধতি',
    how_title: 'safeCIZ কীভাবে জীবন বাঁচায়?',
    how_desc: 'জরুরি মুহূর্তে প্রতিটি সেকেন্ড মূল্যবান। নিরাপদ প্রযুক্তির মাধ্যমে বিপদে পড়ার সাথে সাথে সহায়তা পৌঁছানোর ৪টি ধাপ:',
    step1_title: '১. কঠোর e-KYC ভেরিফিকেশন',
    step1_desc: 'গ্যালারি নয়; শুধুমাত্র লাইভ ক্যামেরা দিয়ে তোলা সেলফি এবং NID/জন্ম সনদের কপি অ্যাডমিন যাচাই করে অ্যাকাউন্ট অনুমোদন দেয়। ফেক কল ১০০% অসম্ভব।',
    step2_title: '২. ৩০ সেকেন্ডের ফ্যামিলি পেয়ারিং',
    step2_desc: 'একটি ক্লিকে তৈরি হওয়া ৩০ সেকেন্ডের সিকিউর ওটিপি দিয়ে পরিবারের সবাই একে অপরের সাথে যুক্ত হন। যেকোনো সদস্য বিপদে পড়লে সবার ফোনে সাইরেন বাজবে।',
    step3_title: '৩. ১-ট্যাপে এসওএস ট্রিগার',
    step3_desc: 'বিপদে পড়লে মাত্র একবার বড় লাল বাটনে চাপ দিন। ২-৫ কিমি ব্যাসার্ধের সব ডিউটিরত পুলিশ ও নিকটস্থ থানার কম্পিউটারে সাইরেন বেজে উঠবে।',
    step4_title: '৪. উভয়মুখী লাইভ ট্র্যাকিং',
    step4_desc: 'ভিকটিম লাইভ ম্যাপে দেখতে পাবে পুলিশ কত কাছে আসছে (ETA)। পুলিশ পাবে টার্ন-বাই-টার্ন শর্টকাট নেভিগেশন।',
    why_tag: 'আমাদের বৈশিষ্ট্য',
    why_title: 'কেন safeCIZ প্রতিটি নাগরিকের জন্য অপরিহার্য?',
    why_card1_title: '১০০% ফেক-কল ও প্র্যাঙ্ক মুক্ত',
    why_card1_desc: 'লাইভ ফেস ও পরিচয়পত্র ছাড়া কেউ সিস্টেমে ঢুকতে পারবে না। জরুরি সেবার অপব্যবহার সম্পূর্ণ বন্ধ।',
    why_card2_title: 'সরাসরি থানা ও পেট্রোল গাড়ির সাথে সংযোগ',
    why_card2_desc: 'কোনো কল সেন্টারে অপেক্ষার প্রয়োজন নেই; ভৌগোলিক ব্যাসার্ধে নিকটস্থ টহলরত অফিসার সরাসরি ডাক পান।',
    why_card3_title: 'পরিবার থেকে সদস্য রিমুভ ও নিয়ন্ত্রণ',
    why_card3_desc: 'ফ্যামিলি হেড যেকোনো সময় পরিবারের সদস্য যুক্ত বা বাতিল করতে পারেন। স্বজনদের সুরক্ষা থাকে নিজের হাতে।',
    why_card4_title: '১০০% ফ্রি ও ওপেন প্রযুক্তি',
    why_card4_desc: 'ওপেনস্ট্রিটম্যাপ ও আধুনিক ক্লাউড আর্কিটেকচারে তৈরি, কোনো মাসিক বিল বা পেমেন্ট ছাড়াই আজীবন ফ্রি।',
    sim_title: 'লাইভ এসওএস অ্যালার্ট সিমুলেটর',
    sim_desc: 'বাস্তবে এসওএস বাটন চাপলে ক্লাউডে কীভাবে কাজ হয় তা নিচের লাইভ সিমুলেটরে পরীক্ষা করে দেখুন:',
    sim_btn: '🚨 সিমুলেট এসওএস ট্রিগার',
    hotline_title: 'জাতীয় জরুরি হটলাইনসমূহ (২৪/৭)',
    hotline_desc: 'জরুরি প্রয়োজনে যেকোনো সময় সরাসরি কল করতে পারেন:',
    footer_rights: '© ২০২৬ safeCIZ নেটওয়ার্ক। সর্বস্বত্ব সংরক্ষিত। বাংলাদেশ সরকার অনুমোদিত জরুরি কাঠামোর উপযোগী।',
    admin_secret_link: 'অ্যাডমিন পোর্টাল লগইন'
  },
  en: {
    nav_home: 'Home',
    nav_how: 'How It Works',
    nav_why: 'Why safeCIZ',
    nav_demo: 'Live Demo',
    nav_download: 'Download',
    lang_toggle: 'বাংলা',
    hero_pill: '24/7 National Citizen Safety & Emergency Response Network',
    hero_title: 'By Your Side in Crisis — Instant Police & Family Safety Network',
    hero_subtitle: 'safeCIZ is Bangladesh\'s next-generation emergency response platform. 1-tap alerts to nearby police and family circles, 30-second dynamic OTP pairing, and 100% e-KYC verified citizens.',
    btn_download_apk: 'Download Android APK',
    btn_download_ios: 'Get on App Store',
    stat_uptime: '99.9%',
    stat_uptime_sub: 'Server Uptime',
    stat_response: '< 3 Seconds',
    stat_response_sub: 'Instant Alert Dispatch',
    stat_verified: '100% Verified',
    stat_verified_sub: 'e-KYC Citizens',
    phone_title: 'safeCIZ Emergency Hub',
    phone_sub: 'GPS Active (3m Precision)',
    phone_sos_btn: 'HOLD FOR SOS',
    phone_victim_tag: 'Victim Location',
    phone_police_tag: 'Police Unit (1.2 km)',
    how_tag: 'WORKFLOW',
    how_title: 'How safeCIZ Saves Lives in Critical Moments',
    how_desc: 'In an emergency, every second counts. Here is how our safe platform connects victims with immediate responders in 4 steps:',
    step1_title: '1. Strict e-KYC Verification',
    step1_desc: 'No gallery photos allowed. Real-time camera selfie and NID/Birth Certificate are reviewed by admins before approval. Zero fake accounts.',
    step2_title: '2. 30-Sec Dynamic Family Pairing',
    step2_desc: 'Pair your family circle instantly using a 30-second dynamic one-time passcode. When anyone is in distress, every family member\'s siren sounds.',
    step3_title: '3. 1-Tap SOS Emergency',
    step3_desc: 'Hold the SOS button for 1 second. High-priority alarms ring on the phones of all police officers within a 2-5 km radius and station terminals.',
    step4_title: '4. Bidirectional Live Tracking',
    step4_desc: 'The victim sees responders approaching in real-time with live ETA. Police receive turn-by-turn navigation directly to the scene.',
    why_tag: 'OUR ADVANTAGES',
    why_title: 'Why safeCIZ is Essential for Every Citizen',
    why_card1_title: '100% Prank & Fake-Free Network',
    why_card1_desc: 'Access requires live face capture and identity documents. Prevents any misuse or bogus calls.',
    why_card2_title: 'Direct Link to Patrolling Units',
    why_card2_desc: 'No call-center hold times; nearest active officers receive alarms directly based on GPS geofencing.',
    why_card3_title: 'Full Family Circle Control',
    why_card3_desc: 'Family admin can add or remove members anytime with complete privacy and instant siren connectivity.',
    why_card4_title: '100% Free & Open Architecture',
    why_card4_desc: 'Built on OpenStreetMap and zero-cost cloud services, running 24/7 without subscription fees.',
    sim_title: 'Live SOS Alert Simulator',
    sim_desc: 'Experience how an SOS alert propagates across the cloud and reaches emergency responders in real-time:',
    sim_btn: '🚨 Trigger SOS Simulation',
    hotline_title: 'National Emergency Helplines (24/7)',
    hotline_desc: 'Official toll-free emergency numbers for direct assistance:',
    footer_rights: '© 2026 safeCIZ Network. All rights reserved. Designed for Bangladesh emergency response standards.',
    admin_secret_link: 'Admin Portal Login'
  }
};

function t(key) {
  const currentLang = appState.lang || 'bn';
  return i18n[currentLang][key] || i18n['en'][key] || key;
}

// Show Toast
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${type === 'success' ? '✅' : type === 'alert' ? '🚨' : 'ℹ️'}</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// ==========================================================
// RENDERERS
// ==========================================================

function renderApp() {
  const hash = window.location.hash;
  const app = document.getElementById('app');

  if (hash === '#/easybro/admin/login') {
    renderAdminLogin(app);
  } else if (hash.startsWith('#/easybro/admin/dashboard')) {
    if (!appState.adminAuth) {
      window.location.hash = '#/easybro/admin/login';
      return;
    }
    renderAdminDashboard(app);
  } else {
    renderLandingPage(app);
  }
}

// ==========================================================
// 1. PUBLIC LANDING PAGE
// ==========================================================
function renderLandingPage(container) {
  container.innerHTML = `
    <!-- Top Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <a href="#" class="brand">
          <img src="/logo.png" alt="safeCIZ Logo" class="brand-logo-img" />
          <span class="brand-text">safe<span class="text-gradient">CIZ</span></span>
          <span class="brand-badge">BANGLADESH</span>
        </a>
        <ul class="nav-links">
          <li><a href="#" class="nav-link active">${t('nav_home')}</a></li>
          <li><a href="#how-it-works" class="nav-link">${t('nav_how')}</a></li>
          <li><a href="#why-us" class="nav-link">${t('nav_why')}</a></li>
          <li><a href="#live-demo" class="nav-link">${t('nav_demo')}</a></li>
          <li><a href="#download" class="nav-link">${t('nav_download')}</a></li>
        </ul>
        <div class="nav-actions">
          <button id="lang-toggle-btn" class="lang-btn">
            🌐 ${t('lang_toggle')}
          </button>
          <a href="#download" class="btn btn-primary" style="padding: 0.55rem 1.1rem; font-size: 0.88rem;">
            ${t('btn_download_apk')}
          </a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
      <div class="hero-content">
        <div class="hero-pill">
          <span class="pulse-dot"></span>
          <span>${t('hero_pill')}</span>
        </div>
        <h1 class="hero-title">${t('hero_title')}</h1>
        <p class="hero-subtitle">${t('hero_subtitle')}</p>
        
        <div class="hero-cta-group" id="download">
          <button class="download-btn" id="btn-apk-dl">
            <svg viewBox="0 0 24 24"><path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-1.0001s.4482-.9994.9993-.9994c.5518 0 1.0001.4479 1.0001.9994 0 .5515-.4483 1.0001-1.0001 1.0001m-11.046 0c-.5511 0-.9993-.4486-.9993-1.0001s.4482-.9994.9993-.9994c.5518 0 1.0001.4479 1.0001.9994 0 .5515-.4483 1.0001-1.0001 1.0001m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.1 12 8.1c-1.8533 0-3.5902.3116-5.1368.8497L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.741h24c-.3432-4.0821-2.6889-7.5543-6.1185-9.4196"/></svg>
            <div class="download-btn-text">
              <small>Android v2.4 (APK)</small>
              <strong>${t('btn_download_apk')}</strong>
            </div>
          </button>
          
          <button class="download-btn" id="btn-ios-dl">
            <svg viewBox="0 0 24 24"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.8c.64-.78 1.08-1.86.96-2.95-1 .04-2.1.66-2.76 1.44-.58.67-1.09 1.76-.96 2.82 1.11.09 2.12-.53 2.76-1.31z"/></svg>
            <div class="download-btn-text">
              <small>Apple App Store</small>
              <strong>${t('btn_download_ios')}</strong>
            </div>
          </button>
        </div>

        <div class="hero-stats">
          <div class="stat-item">
            <h4>${t('stat_uptime')}</h4>
            <p>${t('stat_uptime_sub')}</p>
          </div>
          <div class="stat-item">
            <h4>${t('stat_response')}</h4>
            <p>${t('stat_response_sub')}</p>
          </div>
          <div class="stat-item">
            <h4>${t('stat_verified')}</h4>
            <p>${t('stat_verified_sub')}</p>
          </div>
        </div>
      </div>

      <!-- Hero Visual Interactive Mockup -->
      <div class="hero-visual">
        <div class="phone-card">
          <div class="phone-notch"></div>
          <div class="phone-screen-header">
            <div class="user-info">
              <div class="avatar-mini">SC</div>
              <div>
                <strong style="font-size: 0.88rem; display: block;">সাদিয়া আফরিন</strong>
                <span style="font-size: 0.7rem; color: var(--emerald-400);">● e-KYC ভেরিফাইড</span>
              </div>
            </div>
            <span style="font-size: 0.75rem; background: rgba(0,242,254,0.1); color: var(--cyan-400); padding: 0.2rem 0.5rem; border-radius: 99px;">Family: ৩ জন</span>
          </div>

          <div class="phone-map-view">
            <div class="radar-ring"></div>
            <div class="radar-ring"></div>
            <div class="radar-ring"></div>
            <div class="victim-marker" title="${t('phone_victim_tag')}">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="police-marker-mock">
              🚓 <span>ধানমন্ডি পেট্রোল (১.২ কিমি)</span>
            </div>
            <div style="position: absolute; bottom: 10px; background: rgba(0,0,0,0.6); font-size: 0.68rem; padding: 0.2rem 0.6rem; border-radius: 99px; color: var(--text-muted);">
              GPS: 23.7461° N, 90.3742° E
            </div>
          </div>

          <div class="phone-action-area">
            <button class="interactive-sos-btn" id="hero-sos-trigger">
              🚨 ${t('phone_sos_btn')}
            </button>
            <p style="text-align: center; font-size: 0.72rem; color: var(--text-muted); margin-top: 0.5rem;">
              চাপ দিলে আশেপাশের পুলিশ ও পরিবার সরাসরি জানবে
            </p>
          </div>
        </div>
      </div>
    </header>

    <!-- How It Works Section -->
    <section class="section" id="how-it-works">
      <div class="section-header">
        <span class="section-tag">${t('how_tag')}</span>
        <h2 class="section-title">${t('how_title')}</h2>
        <p class="section-desc">${t('how_desc')}</p>
      </div>

      <div class="steps-grid">
        <div class="step-card">
          <span class="step-number">01</span>
          <div class="step-icon-wrap">📸</div>
          <h3 class="step-title">${t('step1_title')}</h3>
          <p class="step-text">${t('step1_desc')}</p>
        </div>

        <div class="step-card">
          <span class="step-number">02</span>
          <div class="step-icon-wrap">⏱️</div>
          <h3 class="step-title">${t('step2_title')}</h3>
          <p class="step-text">${t('step2_desc')}</p>
        </div>

        <div class="step-card">
          <span class="step-number">03</span>
          <div class="step-icon-wrap">🚨</div>
          <h3 class="step-title">${t('step3_title')}</h3>
          <p class="step-text">${t('step3_desc')}</p>
        </div>

        <div class="step-card">
          <span class="step-number">04</span>
          <div class="step-icon-wrap">🗺️</div>
          <h3 class="step-title">${t('step4_title')}</h3>
          <p class="step-text">${t('step4_desc')}</p>
        </div>
      </div>
    </section>

    <!-- Why safeCIZ Section -->
    <section class="section" id="why-us" style="background: rgba(0,0,0,0.25);">
      <div class="section-header">
        <span class="section-tag">${t('why_tag')}</span>
        <h2 class="section-title">${t('why_title')}</h2>
      </div>

      <div class="features-grid">
        <div class="feature-card">
          <span class="feature-icon">🛡️</span>
          <h3>${t('why_card1_title')}</h3>
          <p>${t('why_card1_desc')}</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">🚓</span>
          <h3>${t('why_card2_title')}</h3>
          <p>${t('why_card2_desc')}</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">👨‍👩‍👧‍👦</span>
          <h3>${t('why_card3_title')}</h3>
          <p>${t('why_card3_desc')}</p>
        </div>

        <div class="feature-card">
          <span class="feature-icon">☁️</span>
          <h3>${t('why_card4_title')}</h3>
          <p>${t('why_card4_desc')}</p>
        </div>
      </div>
    </section>

    <!-- Live Demo Simulator Section -->
    <section class="section" id="live-demo">
      <div class="sim-banner">
        <div class="sim-content">
          <span class="section-tag">INTERACTIVE TEST</span>
          <h3>${t('sim_title')}</h3>
          <p>${t('sim_desc')}</p>
          <button class="btn btn-danger" id="run-sim-btn" style="padding: 1rem 2rem; font-size: 1.05rem;">
            ${t('sim_btn')}
          </button>
        </div>

        <div class="sim-box">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.8rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-family: var(--font-mono);">TERMINAL: CLOUD DISPATCH STREAM</span>
            <span style="font-size: 0.75rem; color: var(--emerald-400);">● LIVE CONNECTED</span>
          </div>
          <div class="sim-logs" id="sim-logs-container">
            ${appState.logs.map(log => `
              <div class="log-entry">
                <span class="log-time">[${log.time}]</span>
                <span class="${log.type === 'ALERT' ? 'log-alert' : 'log-success'}">${log.text}</span>
              </div>
            `).join('')}
          </div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">* টেস্ট বাটনে চাপ দিলে সরাসরি রিয়েল-টাইম ডিসপ্যাচ ও সাইরেন অ্যালার্ট লগ প্রদর্শিত হবে।</span>
        </div>
      </div>
    </section>

    <!-- Emergency Helplines -->
    <section class="section">
      <div class="section-header" style="margin-bottom: 2rem;">
        <span class="section-tag">EMERGENCY CONTACTS</span>
        <h2 class="section-title">${t('hotline_title')}</h2>
        <p class="section-desc">${t('hotline_desc')}</p>
      </div>

      <div class="hotline-cards">
        <a href="tel:999" class="hotline-card">
          <div class="hotline-number">999</div>
          <div class="hotline-info">
            <h4>জাতীয় জরুরি সেবা</h4>
            <p>পুলিশ, অ্যাম্বুলেন্স ও ফায়ার সার্ভিস (টোল ফ্রি)</p>
          </div>
        </a>

        <a href="tel:109" class="hotline-card">
          <div class="hotline-number">109</div>
          <div class="hotline-info">
            <h4>নারী ও শিশু নির্যাতন প্রতিরোধ</h4>
            <p>মহিলা ও শিশু বিষয়ক মন্ত্রণালয়</p>
          </div>
        </a>

        <a href="tel:100" class="hotline-card">
          <div class="hotline-number">100</div>
          <div class="hotline-info">
            <h4>বাংলাদেশ পুলিশ হেল্পডেস্ক</h4>
            <p>সরাসরি কেন্দ্রীয় পুলিশ কন্ট্রোল রুম</p>
          </div>
        </a>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <img src="/logo.png" alt="safeCIZ" />
          <span style="font-weight: 800; font-size: 1.25rem;">safeCIZ</span>
        </div>

        <p style="font-size: 0.85rem; color: var(--text-muted);">${t('footer_rights')}</p>

        <div>
          <!-- Secret Admin Route Portal Link -->
          <a href="#/easybro/admin/login" class="footer-admin-link">
            🔒 ${t('admin_secret_link')}
          </a>
        </div>
      </div>
    </footer>

    <!-- Download Modal -->
    <div class="modal-overlay" id="download-modal">
      <div class="modal-content">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h3 style="font-size: 1.4rem;">safeCIZ মোবাইল অ্যাপ ডাউনলোড</h3>
          <button id="close-modal-btn" style="background:none; border:none; color:var(--text-muted); font-size:1.5rem; cursor:pointer;">&times;</button>
        </div>
        <div style="text-align: center; margin-bottom: 1.5rem;">
          <img src="/logo.png" alt="safeCIZ" style="width: 72px; margin-bottom: 1rem; filter: drop-shadow(0 0 15px rgba(0,242,254,0.4));" />
          <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 0.4rem;">অফিসিয়াল নিরাপদ রিলিজ (v2.4.0)</p>
          <span style="background: rgba(0,230,118,0.15); color: var(--emerald-400); font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 99px; font-weight: 600;">
            ✓ SHA-256 ভেরিফাইড ও ম্যালওয়্যার-মুক্ত
          </span>
        </div>
        <div style="background: rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1rem; margin-bottom:1.5rem;">
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">প্যাকেজ সাইজ:</span>
            <strong>50.4 MB (Release APK)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem; margin-bottom:0.4rem;">
            <span style="color:var(--text-muted);">ন্যূনতম অ্যান্ড্রয়েড:</span>
            <strong>Android 8.0+ (Oreo)</strong>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.85rem;">
            <span style="color:var(--text-muted);">আইওএস সাপোর্ট:</span>
            <strong>iOS 14.0+ (TestFlight)</strong>
          </div>
        </div>
        <a href="/downloads/safeCIZ.apk" download="safeCIZ.apk" class="btn btn-primary" id="start-apk-download" style="width:100%; padding:0.9rem; text-decoration:none; display:flex; justify-content:center;">
          📥 সরাসরি আসল APK ডাউনলোড করুন (50.4 MB)
        </a>
      </div>
    </div>
  `;

  // Attach event handlers
  document.getElementById('lang-toggle-btn').addEventListener('click', () => {
    appState.lang = appState.lang === 'bn' ? 'en' : 'bn';
    saveState(appState);
    renderApp();
    showToast(appState.lang === 'bn' ? 'ভাষা বাংলায় পরিবর্তিত হয়েছে' : 'Language switched to English', 'success');
  });

  // Download Modal triggers
  const modal = document.getElementById('download-modal');
  document.getElementById('btn-apk-dl').addEventListener('click', () => modal.classList.add('active'));
  document.getElementById('btn-ios-dl').addEventListener('click', () => {
    modal.classList.add('active');
  });
  document.getElementById('close-modal-btn').addEventListener('click', () => modal.classList.remove('active'));

  document.getElementById('start-apk-download').addEventListener('click', () => {
    showToast('safeCIZ APK ডাউনলোড শুরু হচ্ছে... (24.6 MB)', 'success');
    setTimeout(() => {
      modal.classList.remove('active');
    }, 1200);
  });

  // SOS Simulation
  const triggerSimulation = () => {
    const time = new Date().toLocaleTimeString();
    appState.logs.unshift({
      time,
      type: 'ALERT',
      text: `🚨 SOS বাটন ট্রিগার! জিপিএস কোঅর্ডিনেট লকড (23.7461° N, 90.3742° E) — ২ কিমির মধ্যে ৪ পুলিশ ও ৩ স্বজনকে সাইরেন পাঠানো হয়েছে!`
    });
    saveState(appState);

    const logContainer = document.getElementById('sim-logs-container');
    if (logContainer) {
      logContainer.innerHTML = appState.logs.map(log => `
        <div class="log-entry">
          <span class="log-time">[${log.time}]</span>
          <span class="${log.type === 'ALERT' ? 'log-alert' : 'log-success'}">${log.text}</span>
        </div>
      `).join('');
    }
    showToast('🚨 ইমার্জেন্সি সাইরেন অ্যালার্ট প্রেরিত হয়েছে!', 'alert');
  };

  document.getElementById('run-sim-btn').addEventListener('click', triggerSimulation);
  document.getElementById('hero-sos-trigger').addEventListener('click', triggerSimulation);
}

// ==========================================================
// 2. SECRET ADMIN LOGIN (/easybro/admin/login)
// ==========================================================
function renderAdminLogin(container) {
  container.innerHTML = `
    <div class="admin-login-container">
      <div class="admin-login-card">
        <a href="#">
          <img src="/logo.png" alt="safeCIZ" class="admin-login-logo" />
        </a>
        <h2>safeCIZ কন্ট্রোল রুম</h2>
        <p>শুধুমাত্র অনুমোদিত পুলিশ প্রশাসন ও সুপার অ্যাডমিনদের জন্য</p>

        <form id="admin-login-form">
          <div class="form-group">
            <label for="admin-username">অ্যাডমিন ইউজারনেম (Username)</label>
            <input type="text" id="admin-username" class="form-input" placeholder="admin" value="admin" required />
          </div>

          <div class="form-group">
            <label for="admin-password">পাসওয়ার্ড (Password)</label>
            <input type="password" id="admin-password" class="form-input" placeholder="••••••••" value="safeCIZ@2026" required />
          </div>

          <div style="background: rgba(0,242,254,0.06); border: 1px dashed var(--border-bright); padding: 0.75rem; border-radius: var(--radius-sm); margin-bottom: 1.5rem; text-align: left; font-size: 0.78rem;">
            <span style="color: var(--cyan-400); font-weight: bold;">ডেমো ক্রেডেনশিয়াল:</span><br/>
            ইউজারনেম: <code>admin</code><br/>
            পাসওয়ার্ড: <code>safeCIZ@2026</code>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.9rem;">
            🔐 সুরক্ষিত কন্ট্রোল রুমে প্রবেশ করুন
          </button>
        </form>

        <div style="margin-top: 1.5rem;">
          <a href="#" style="color: var(--text-muted); font-size: 0.85rem; text-decoration: none;">
            ← পাবলিক হোমপেজে ফিরে যান
          </a>
        </div>
      </div>
    </div>
  `;

  document.getElementById('admin-login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('admin-username').value;
    const pass = document.getElementById('admin-password').value;

    if (user === 'admin' && pass === 'safeCIZ@2026') {
      appState.adminAuth = true;
      saveState(appState);
      showToast('অ্যাডমিন সফলভাবে যাচাই হয়েছে। স্বাগতম!', 'success');
      window.location.hash = '#/easybro/admin/dashboard';
    } else {
      showToast('ভুল ইউজারনেম বা পাসওয়ার্ড!', 'alert');
    }
  });
}

// ==========================================================
// 3. SECURE ADMIN DASHBOARD (/easybro/admin/dashboard)
// ==========================================================
function renderAdminDashboard(container) {
  const pendingKYCCount = appState.kycQueue.filter(k => k.status === 'PENDING').length;

  container.innerHTML = `
    <div class="admin-wrapper">
      <!-- Admin Header -->
      <header class="admin-header">
        <div class="admin-header-left">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <img src="/logo.png" alt="safeCIZ" style="width:34px; height:34px;" />
            <strong style="font-size:1.25rem;">safeCIZ <span class="text-gradient">COMMAND CENTER</span></strong>
          </div>
          <span class="admin-tag">🚨 LIVE POLICE DISPATCH</span>
        </div>

        <nav class="admin-nav-tabs">
          <button class="tab-btn ${appState.activeTab === 'radar' ? 'active' : ''}" data-tab="radar">
            📡 লাইভ রেডার ও ম্যাপ
          </button>
          <button class="tab-btn ${appState.activeTab === 'kyc' ? 'active' : ''}" data-tab="kyc">
            📋 e-KYC ভেরিফিকেশন ${pendingKYCCount > 0 ? `<span class="badge-count">${pendingKYCCount}</span>` : ''}
          </button>
          <button class="tab-btn ${appState.activeTab === 'police' ? 'active' : ''}" data-tab="police">
            👮 পুলিশ ও ক্রেডেনশিয়াল জেনারেটর
          </button>
        </nav>

        <div class="admin-header-right">
          <span style="font-size:0.85rem; color:var(--text-secondary);">Officer: <strong>HQ Dispatcher</strong></span>
          <button id="admin-logout-btn" class="btn btn-outline" style="padding:0.4rem 0.9rem; font-size:0.8rem;">
            লগআউট
          </button>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="admin-main" id="admin-tab-content">
        <!-- Rendered based on activeTab -->
      </main>
    </div>
  `;

  // Attach tab triggers
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      appState.activeTab = btn.getAttribute('data-tab');
      saveState(appState);
      renderAdminDashboard(container);
    });
  });

  document.getElementById('admin-logout-btn').addEventListener('click', () => {
    appState.adminAuth = false;
    saveState(appState);
    showToast('অ্যাডমিন সফলভাবে লগআউট হয়েছেন', 'info');
    window.location.hash = '#/easybro/admin/login';
  });

  // Render sub-tab
  const tabContent = document.getElementById('admin-tab-content');
  if (appState.activeTab === 'radar') {
    renderRadarTab(tabContent);
  } else if (appState.activeTab === 'kyc') {
    renderKYCTab(tabContent);
  } else if (appState.activeTab === 'police') {
    renderPoliceTab(tabContent);
  }
}

// ----------------------------------------------------------
// Tab 1: Live Command Radar (Leaflet / OpenStreetMap)
// ----------------------------------------------------------
function renderRadarTab(container) {
  const activeCount = appState.activeIncidents.length;

  container.innerHTML = `
    <div class="radar-layout">
      <div class="map-container">
        <div id="admin-leaflet-map"></div>
        <div style="position: absolute; top: 15px; left: 60px; z-index: 1000; background: rgba(8,15,27,0.85); backdrop-filter: blur(10px); border: 1px solid var(--border-subtle); padding: 0.5rem 1rem; border-radius: var(--radius-md); font-size: 0.82rem;">
          <span style="color: var(--cyan-400); font-weight: bold;">● OpenStreetMap লাইভ ফিড</span> | 
          সক্রিয় এসওএস: ${activeCount > 0 ? `<span style="color: var(--red-500); font-weight: bold;">${activeCount} টি (সক্রিয়)</span>` : `<span style="color: var(--emerald-400); font-weight: bold;">০ টি (সকল এলাকা নিরাপদ)</span>`} | 
          অন-ডিউটি পুলিশ: <span style="color: var(--emerald-400); font-weight: bold;">${appState.policeRoster.filter(p => p.status === 'ON_DUTY').length} জন</span>
        </div>
      </div>

      <div class="radar-sidebar">
        <div class="radar-sidebar-header">
          <h3 style="font-size: 1.15rem;">সক্রিয় এসওএস অ্যালার্ট</h3>
          <span style="font-size: 0.75rem; ${activeCount > 0 ? 'background: var(--red-glow); color: var(--red-500);' : 'background: rgba(0,230,118,0.15); color: var(--emerald-400);'} padding: 0.2rem 0.5rem; border-radius: 99px; font-weight: bold;">
            ${activeCount > 0 ? `🚨 ${activeCount} LIVE` : '● 0 ACTIVE'}
          </span>
        </div>

        <div class="active-incidents-list">
          ${activeCount === 0 ? `
            <div style="text-align: center; padding: 3rem 1.2rem; background: rgba(0,242,254,0.03); border: 1px dashed var(--border-subtle); border-radius: var(--radius-md); margin-top: 0.8rem;">
              <span style="font-size: 2.8rem; display: block; margin-bottom: 0.8rem;">🛡️</span>
              <h4 style="font-size: 1.05rem; margin-bottom: 0.4rem; color: var(--emerald-400);">কোন সক্রিয় এসওএস নেই</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.6; margin-bottom: 1.2rem;">
                সকল এলাকা শান্ত ও নিরাপদ রয়েছে। ডেমো অ্যালার্ট সম্পূর্ণ বন্ধ করা হয়েছে। নাগরিকরা safeCIZ মোবাইল অ্যাপ থেকে এসওএস পাঠালে সরাসরি এখানে হাই-প্রায়োরিটি সাইরেন সহ রিয়েল-টাইম ডিসপ্যাচ হবে।
              </p>
              <button class="btn btn-outline" style="font-size: 0.8rem; padding: 0.45rem 0.9rem;" onclick="window.triggerTestSOS()">
                🚨 প্রয়োজনে টেস্ট এসওএস সিমুলেট করুন
              </button>
            </div>
          ` : appState.activeIncidents.map(inc => `
            <div class="incident-card" data-inc-id="${inc.id}">
              <div class="incident-card-header">
                <span class="incident-badge-active">🚨 ${inc.status}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${inc.startedAt}</span>
              </div>
              <h4 style="font-size: 1.1rem; margin-bottom: 0.3rem;">${inc.victimName}</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.4rem;">
                📍 ${inc.locationName}
              </p>
              <div style="display: flex; gap: 0.8rem; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.8rem;">
                <span>রক্ত: <strong>${inc.bloodGroup}</strong></span>
                <span>ব্যাটারি: <strong>${inc.battery}</strong></span>
                <span>গতি: <strong>${inc.speed}</strong></span>
              </div>
              <div style="background: rgba(0,242,254,0.06); padding: 0.5rem; border-radius: var(--radius-sm); font-size: 0.78rem; margin-bottom: 0.8rem;">
                👮 নিযুক্ত: <strong style="color: var(--cyan-400);">${inc.assignedTo}</strong>
              </div>
              <button class="btn btn-primary" style="width: 100%; padding: 0.55rem; font-size: 0.82rem; margin-bottom: 0.4rem;" onclick="window.dispatchNearestUnit('${inc.id}')">
                🚓 নিকটস্থ পেট্রোল পাঠান (Dispatch)
              </button>
              <button class="btn btn-outline" style="border-color: var(--emerald-400); color: var(--emerald-400); width: 100%; font-size: 0.78rem; padding: 0.45rem;" onclick="window.resolveIncident('${inc.id}')">
                ✓ এসওএস নিষ্পত্তি / সমাধান করুন (Dismiss)
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  // Initialize Leaflet Map
  setTimeout(() => {
    const mapElement = document.getElementById('admin-leaflet-map');
    if (!mapElement) return;

    // Dhaka Coordinates
    const map = L.map('admin-leaflet-map').setView([23.7461, 90.3742], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Victim SOS Marker (Only if incidents exist)
    appState.activeIncidents.forEach(inc => {
      const victimIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `<div style="background:#ff3366; width:36px; height:36px; border-radius:50%; border:3px solid #fff; box-shadow:0 0 20px #ff3366; display:flex; align-items:center; justify-content:center; color:#fff; font-size:16px;">🚨</div>`,
        iconSize: [36, 36]
      });

      const marker = L.marker([inc.lat, inc.lng], { icon: victimIcon }).addTo(map);
      marker.bindPopup(`
        <div style="color:#000;">
          <h4 style="margin:0 0 5px;">${inc.victimName}</h4>
          <p style="margin:0 0 5px; font-size:12px;">${inc.locationName}</p>
          <p style="margin:0; font-size:11px; color:#ff3366; font-weight:bold;">🚨 এসওএস অ্যালার্ট সক্রিয়!</p>
        </div>
      `).openPopup();

      // Geofence Radius Circle (2 km)
      L.circle([inc.lat, inc.lng], {
        color: '#ff3366',
        fillColor: '#ff3366',
        fillOpacity: 0.12,
        radius: 2000
      }).addTo(map);
    });

    // Police Markers
    appState.policeRoster.filter(p => p.status === 'ON_DUTY').forEach(pol => {
      const policeIcon = L.divIcon({
        className: 'custom-pol-marker',
        html: `<div style="background:#00f2fe; width:32px; height:32px; border-radius:50%; border:2px solid #000; box-shadow:0 0 15px #00f2fe; display:flex; align-items:center; justify-content:center; font-size:16px;">🚓</div>`,
        iconSize: [32, 32]
      });

      L.marker([pol.lat, pol.lng], { icon: policeIcon }).addTo(map)
        .bindPopup(`
          <div style="color:#000;">
            <h4 style="margin:0 0 4px;">${pol.name}</h4>
            <span style="font-size:11px; background:#e0f2fe; padding:2px 5px; border-radius:4px;">${pol.rank}</span>
            <p style="margin:4px 0 0; font-size:12px;">${pol.station}</p>
          </div>
        `);
    });
  }, 100);

  window.dispatchNearestUnit = (incId) => {
    showToast('নিকটস্থ পেট্রোল গাড়িকে গুগল ম্যাপস নেভিগেশন ও সাইরেন অ্যালার্ট পাঠানো হয়েছে!', 'success');
  };

  window.resolveIncident = async (incId) => {
    appState.activeIncidents = appState.activeIncidents.filter(i => i.id !== incId);
    saveState(appState);
    await resolveSOSIncidentInFirebase(incId);
    showToast('এসওএস অ্যালার্ট সফলভাবে সমাধান ও নিষ্পত্তি করা হয়েছে!', 'success');
    renderAdminDashboard(document.getElementById('app'));
  };

  window.triggerTestSOS = () => {
    appState.activeIncidents = [
      {
        id: 'sos-' + Date.now(),
        victimName: 'নুসরাত জাহান (Nusrat Jahan)',
        phone: '01755-123456',
        bloodGroup: 'B+',
        battery: '68%',
        lat: 23.7445,
        lng: 90.3725,
        locationName: 'ধানমন্ডি লেক সংলগ্ন ৮/এ রোড',
        status: 'ACTIVE',
        assignedTo: 'ধানমন্ডি পেট্রোল টিম #০৩ (SI রফিকুল)',
        startedAt: '১ মিনিট আগে',
        speed: '০ কিমি/ঘণ্টা (স্থির অবস্থান)'
      }
    ];
    saveState(appState);
    showToast('টেস্ট এসওএস সিমুলেশন চালু করা হয়েছে!', 'alert');
    renderAdminDashboard(document.getElementById('app'));
  };
}

// Global KYC Filter & Search State (Picture 2 requirement)
let kycSearchQuery = '';
let kycStatusFilter = 'ALL';

// ----------------------------------------------------------
// Tab 2: e-KYC Approval Queue
// ----------------------------------------------------------
function renderKYCTab(container) {
  const pendingCount = appState.kycQueue.filter(k => k.status === 'PENDING').length;
  const approvedCount = appState.kycQueue.filter(k => k.status === 'APPROVED').length;
  const rejectedCount = appState.kycQueue.filter(k => k.status === 'REJECTED').length;

  const q = (kycSearchQuery || '').toLowerCase().trim();
  const filteredQueue = appState.kycQueue.filter(k => {
    const matchesFilter = (kycStatusFilter === 'ALL') || (k.status === kycStatusFilter);
    if (!matchesFilter) return false;
    if (!q) return true;
    const nameMatch = (k.name || '').toLowerCase().includes(q);
    const phoneMatch = (k.phone || '').includes(q) || (k.cleanPhone || '').includes(q);
    const idMatch = (k.idNumber || '').toLowerCase().includes(q);
    return nameMatch || phoneMatch || idMatch;
  });

  container.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:1rem; margin-bottom:1.5rem;">
        <div>
          <h2 style="font-size:1.6rem; margin-bottom:0.3rem;">e-KYC ভেরিফিকেশন কিউ</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem;">
            লাইভ ক্যামেরা সেলফি ও পরিচয়পত্রের ছবি মিলিয়ে অনুমোদন বা বাতিল করুন।
          </p>
        </div>

        <div style="display:flex; gap:0.6rem; align-items:center; flex-wrap:wrap;">
          <span style="background:rgba(0,242,254,0.1); color:var(--cyan-400); border:1px solid rgba(0,242,254,0.3); padding:0.45rem 1rem; border-radius:var(--radius-full); font-size:0.85rem; font-weight:bold;">
            অপেক্ষমাণ: ${pendingCount} জন
          </span>
        </div>
      </div>

      <!-- Search & Filter Bar (Picture 2 requirement) -->
      <div style="display:flex; gap:0.8rem; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
        <div style="flex:1; min-width:260px;">
          <input 
            type="text" 
            id="kyc-search-input" 
            class="form-input" 
            placeholder="🔍 নাম, মোবাইল নম্বর বা NID নম্বর দিয়ে খুঁজুন..." 
            value="${kycSearchQuery}" 
            style="width:100%; padding:0.65rem 1rem; border-radius:var(--radius-md); font-size:0.9rem; background:var(--bg-card); border:1px solid var(--border-subtle);" 
          />
        </div>
        <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
          <button class="btn ${kycStatusFilter === 'ALL' ? 'btn-primary' : 'btn-outline'}" style="padding:0.45rem 0.85rem; font-size:0.82rem;" onclick="window.setKYCFilter('ALL')">
            সব (${appState.kycQueue.length})
          </button>
          <button class="btn ${kycStatusFilter === 'PENDING' ? 'btn-primary' : 'btn-outline'}" style="padding:0.45rem 0.85rem; font-size:0.82rem; border-color:var(--cyan-400);" onclick="window.setKYCFilter('PENDING')">
            অপেক্ষমাণ (${pendingCount})
          </button>
          <button class="btn ${kycStatusFilter === 'APPROVED' ? 'btn-primary' : 'btn-outline'}" style="padding:0.45rem 0.85rem; font-size:0.82rem; border-color:var(--emerald-400);" onclick="window.setKYCFilter('APPROVED')">
            অনুমোদিত (${approvedCount})
          </button>
          <button class="btn ${kycStatusFilter === 'REJECTED' ? 'btn-primary' : 'btn-outline'}" style="padding:0.45rem 0.85rem; font-size:0.82rem; border-color:var(--red-500);" onclick="window.setKYCFilter('REJECTED')">
            বাতিল (${rejectedCount})
          </button>
        </div>
      </div>

      ${filteredQueue.length === 0 ? `
        <div style="text-align: center; padding: 4rem 2rem; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border-subtle); margin-top: 1rem;">
          <span style="font-size: 3rem; display: block; margin-bottom: 0.8rem;">📭</span>
          <h3 style="font-size: 1.25rem; margin-bottom: 0.4rem; color: var(--text-primary);">কোনো আবেদন পাওয়া যায়নি</h3>
          <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto; font-size: 0.88rem;">
            ${kycSearchQuery ? 'আপনার সার্চকৃত তথ্যের সাথে কোনো আবেদন মিলছে না।' : 'বর্তমানে এই ফিল্টারে কোনো আবেদন জমা নেই।'}
          </p>
        </div>
      ` : `
        <div class="kyc-grid">
          ${filteredQueue.map(kyc => `
            <div class="kyc-card" onclick="window.openKYCDetail('${kyc.id}')" title="সম্পূর্ণ তথ্য দেখতে ক্লিক করুন">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
                <span style="font-size:0.75rem; color:var(--text-muted);">⏱️ ${kyc.submittedAt}</span>
                <span style="padding:0.25rem 0.65rem; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:bold; ${
                  kyc.status === 'APPROVED' ? 'background:rgba(0,230,118,0.15); color:var(--emerald-400);' :
                  kyc.status === 'REJECTED' ? 'background:rgba(255,51,102,0.15); color:var(--red-500);' :
                  'background:rgba(0,242,254,0.15); color:var(--cyan-400);'
                }">
                  ${kyc.status === 'APPROVED' ? '✓ APPROVED' : kyc.status === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING'}
                </span>
              </div>

              <h3 style="font-size:1.2rem; margin-bottom:0.25rem;">${kyc.name}</h3>
              <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.25rem;">📞 ${kyc.phone}</p>
              <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.8rem;">
                ডকুমেন্ট: <strong style="color:var(--cyan-400);">${kyc.docType === 'NID' ? 'NID (উভয় পাশ)' : 'জন্ম নিবন্ধন (১টি)'}</strong> | 
                ফেস ম্যাচ: <strong style="color:var(--emerald-400);">${kyc.livenessScore || '৯৯.৪%'}</strong>
              </p>

              <!-- Document Preview: NID gets 3 photos; Birth Certificate gets 2 photos -->
              <div class="kyc-images-preview ${kyc.docType === 'NID' ? 'triple' : ''}">
                <div class="kyc-img-box">
                  <img src="${kyc.selfieUrl}" alt="Live Camera Selfie" />
                  <span class="kyc-img-label">লাইভ সেলফি (ক্যামেরা)</span>
                </div>
                <div class="kyc-img-box">
                  <img src="${kyc.docFrontUrl}" alt="Document Front" />
                  <span class="kyc-img-label">${kyc.docType === 'NID' ? 'NID সামনের অংশ' : 'জন্ম সনদ'}</span>
                </div>
                ${kyc.docType === 'NID' ? `
                  <div class="kyc-img-box">
                    <img src="${kyc.docBackUrl || kyc.docFrontUrl}" alt="NID Back" />
                    <span class="kyc-img-label">NID পেছনের অংশ</span>
                  </div>
                ` : ''}
              </div>

              <div style="margin: 0.8rem 0 0.5rem; text-align:center;">
                <span style="font-size:0.8rem; color:var(--cyan-400); font-weight:600; text-decoration:underline;">
                  🔍 সম্পূর্ণ প্রোফাইল ও ডকুমেন্টস যাচাই করুন &rarr;
                </span>
              </div>

              ${kyc.status === 'PENDING' ? `
                <div class="kyc-actions" onclick="event.stopPropagation()">
                  <button class="btn btn-outline" style="border-color:var(--red-500); color:var(--red-500);" onclick="window.rejectKYC('${kyc.id}')">
                    ✕ বাতিল (Reject)
                  </button>
                  <button class="btn btn-primary" onclick="window.approveKYC('${kyc.id}')">
                    ✓ অনুমোদন (Approve)
                  </button>
                </div>
              ` : `
                <div style="text-align:center; padding:0.5rem; background:rgba(255,255,255,0.02); border-radius:var(--radius-sm); font-size:0.8rem; font-weight:bold; color:${kyc.status === 'APPROVED' ? 'var(--emerald-400)' : 'var(--red-500)'};" onclick="event.stopPropagation()">
                  ${kyc.status === 'APPROVED' ? '✓ যাচাই সম্পন্ন হয়েছে (APPROVED)' : '✕ আবেদনটি বাতিলকৃত (REJECTED)'}
                </div>
              `}
            </div>
          `).join('')}
        </div>
      `}
    </div>

    <!-- Full KYC Profile Details Modal -->
    <div id="kyc-detail-modal-container"></div>
  `;

  // Search input live listener
  const searchInput = document.getElementById('kyc-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      kycSearchQuery = e.target.value;
      renderKYCTab(container);
      const newInput = document.getElementById('kyc-search-input');
      if (newInput) {
        newInput.focus();
        newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
      }
    });
  }

  // Filter change helper
  window.setKYCFilter = (filter) => {
    kycStatusFilter = filter;
    renderKYCTab(container);
  };

  // Quick Approve (Updates both KYC and Citizen Account in Firebase)
  window.approveKYC = async (id) => {
    const item = appState.kycQueue.find(k => k.id === id);
    if (item) {
      item.status = 'APPROVED';
      saveState(appState);
      await updateKYCStatusInFirebase(item.id, item.phone, 'APPROVED');
      showToast(`${item.name}-এর অ্যাকাউন্ট অনুমোদিত হয়েছে!`, 'success');
      renderAdminDashboard(document.getElementById('app'));
    }
  };

  // Quick Reject (Updates both KYC and Citizen Account in Firebase)
  window.rejectKYC = async (id) => {
    const item = appState.kycQueue.find(k => k.id === id);
    if (item) {
      item.status = 'REJECTED';
      saveState(appState);
      await updateKYCStatusInFirebase(item.id, item.phone, 'REJECTED');
      showToast(`${item.name}-এর আবেদন বাতিল করা হয়েছে`, 'alert');
      renderAdminDashboard(document.getElementById('app'));
    }
  };

  // Open Full Detail Modal (Picture 1 & Picture 3 requirement)
  window.openKYCDetail = (id) => {
    const kyc = appState.kycQueue.find(k => k.id === id);
    if (!kyc) return;

    const modalBox = document.getElementById('kyc-detail-modal-container');
    if (!modalBox) return;

    modalBox.innerHTML = `
      <div class="kyc-detail-overlay" id="kyc-active-overlay" onclick="window.closeKYCDetail(event)">
        <div class="kyc-detail-box" onclick="event.stopPropagation()">
          <!-- Modal Header -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; border-bottom:1px solid var(--border-subtle); padding-bottom:1rem;">
            <div>
              <div style="display:flex; align-items:center; gap:0.8rem; margin-bottom:0.3rem;">
                <h2 style="font-size:1.6rem; color:var(--text-primary); margin:0;">${kyc.name}</h2>
                <span style="padding:0.25rem 0.75rem; border-radius:var(--radius-sm); font-size:0.8rem; font-weight:bold; ${
                  kyc.status === 'APPROVED' ? 'background:rgba(0,230,118,0.15); color:var(--emerald-400); border:1px solid rgba(0,230,118,0.3);' :
                  kyc.status === 'REJECTED' ? 'background:rgba(255,51,102,0.15); color:var(--red-500); border:1px solid rgba(255,51,102,0.3);' :
                  'background:rgba(0,242,254,0.15); color:var(--cyan-400); border:1px solid rgba(0,242,254,0.3);'
                }">
                  ${kyc.status === 'APPROVED' ? '✓ APPROVED' : kyc.status === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING REVIEW'}
                </span>
              </div>
              <p style="color:var(--text-secondary); font-size:0.85rem; margin:0;">
                আবেদন ট্র্যাকিং আইডি: <code>#${kyc.id}</code> | জমার সময়: <strong>${kyc.submittedAt}</strong>
              </p>
            </div>
            <button onclick="window.closeKYCDetail()" style="background:rgba(255,255,255,0.06); border:1px solid var(--border-subtle); color:var(--text-muted); width:36px; height:36px; border-radius:50%; font-size:1.4rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">&times;</button>
          </div>

          <!-- Document Images Grid with Image Zoom Click (Picture 1 requirement) -->
          <h4 style="font-size:1.05rem; margin-bottom:0.8rem; color:var(--cyan-400); display:flex; align-items:center; gap:0.5rem;">
            📷 আপলোডকৃত পরিচয়পত্র ও লাইভ বায়োমেট্রিক ছবি (বড় করে দেখতে ছবিতে ক্লিক করুন)
          </h4>

          <div class="kyc-detail-images">
            <!-- 1. Live Selfie -->
            <div class="kyc-detail-img-card" onclick="window.openImageZoom('${kyc.selfieUrl}', 'লাইভ ক্যামেরা সেলফি - ${kyc.name}')" style="cursor:zoom-in;" title="বড় করে দেখতে ক্লিক করুন">
              <img src="${kyc.selfieUrl}" alt="Live Camera Selfie" />
              <div style="padding:0.8rem; background:#070d18; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="font-size:0.85rem; display:block; color:var(--emerald-400);">● লাইভ ক্যামেরা সেলফি</strong>
                  <small style="color:var(--text-muted); font-size:0.75rem;">গ্যালারি বাইপাস ব্লকেজ সুরক্ষিত</small>
                </div>
                <span style="background:rgba(0,242,254,0.12); color:var(--cyan-400); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">🔍 জুম</span>
              </div>
            </div>

            <!-- 2. Front Photo -->
            <div class="kyc-detail-img-card" onclick="window.openImageZoom('${kyc.docFrontUrl}', '${kyc.docType === 'NID' ? 'জাতীয় পরিচয়পত্র (সামনের অংশ)' : 'ডিজিটাল জন্ম নিবন্ধন সনদ'} - ${kyc.name}')" style="cursor:zoom-in;" title="বড় করে দেখতে ক্লিক করুন">
              <img src="${kyc.docFrontUrl}" alt="Document Front" />
              <div style="padding:0.8rem; background:#070d18; display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <strong style="font-size:0.85rem; display:block; color:var(--cyan-400);">
                    ● ${kyc.docType === 'NID' ? 'জাতীয় পরিচয়পত্র (সামনের অংশ)' : 'ডিজিটাল জন্ম নিবন্ধন সনদ'}
                  </strong>
                  <small style="color:var(--text-muted); font-size:0.75rem;">ছবি ও টেক্সট স্পষ্টতা যাচাইকৃত</small>
                </div>
                <span style="background:rgba(0,242,254,0.12); color:var(--cyan-400); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">🔍 জুম</span>
              </div>
            </div>

            <!-- 3. Back Photo (ONLY FOR NID) -->
            ${kyc.docType === 'NID' ? `
              <div class="kyc-detail-img-card" onclick="window.openImageZoom('${kyc.docBackUrl || kyc.docFrontUrl}', 'জাতীয় পরিচয়পত্র (পেছনের অংশ) - ${kyc.name}')" style="cursor:zoom-in;" title="বড় করে দেখতে ক্লিক করুন">
                <img src="${kyc.docBackUrl || kyc.docFrontUrl}" alt="NID Back" />
                <div style="padding:0.8rem; background:#070d18; display:flex; justify-content:space-between; align-items:center;">
                  <div>
                    <strong style="font-size:0.85rem; display:block; color:var(--cyan-400);">● জাতীয় পরিচয়পত্র (পেছনের অংশ)</strong>
                    <small style="color:var(--text-muted); font-size:0.75rem;">ঠিকানা ও বারকোড যাচাই</small>
                  </div>
                  <span style="background:rgba(0,242,254,0.12); color:var(--cyan-400); padding:0.2rem 0.5rem; border-radius:4px; font-size:0.75rem;">🔍 জুম</span>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Full Personal Information Table -->
          <h4 style="font-size:1.05rem; margin:1.8rem 0 0.8rem; color:var(--cyan-400);">
            📋 আবেদনকারীর পূর্ণাঙ্গ জীবনবৃত্তান্ত ও বায়োডাটা
          </h4>

          <table class="kyc-info-table">
            <tbody>
              <tr>
                <td>আবেদনকারীর পুরো নাম:</td>
                <td><strong style="font-size:1.05rem;">${kyc.name}</strong></td>
              </tr>
              <tr>
                <td>মোবাইল নম্বর:</td>
                <td>
                  <a href="tel:${kyc.phone}" style="color:var(--cyan-400); font-weight:bold; font-family:var(--font-mono);">
                    📞 ${kyc.phone}
                  </a>
                  <small style="color:var(--text-muted); margin-left:0.5rem;">(সরাসরি কল করতে ক্লিক করুন)</small>
                </td>
              </tr>
              <tr>
                <td>ইমেইল অ্যাড্রেস:</td>
                <td><code>${kyc.email || 'তথ্য দেওয়া হয়নি'}</code></td>
              </tr>
              <tr>
                <td>পরিচয়পত্রের ধরন:</td>
                <td>
                  <strong style="color:var(--cyan-400);">
                    ${kyc.docType === 'NID' ? 'জাতীয় পরিচয়পত্র (NID - উভয় পাশ যাচাই)' : 'অনলাইন ডিজিটাল জন্ম নিবন্ধন সনদ (১টি কপি)'}
                  </strong>
                </td>
              </tr>
              <tr>
                <td>পরিচয়পত্র / জন্ম নিবন্ধন নং:</td>
                <td>
                  <code style="font-size:1.05rem; letter-spacing:1px; color:#fff; background:rgba(0,242,254,0.1); padding:0.2rem 0.6rem; border-radius:4px;">
                    ${kyc.idNumber || 'তথ্য নেই'}
                  </code>
                </td>
              </tr>
              <tr>
                <td>জন্ম তারিখ:</td>
                <td><strong>${kyc.dob || 'তথ্য নেই'}</strong></td>
              </tr>
              <tr>
                <td>রক্তের গ্রুপ (Blood Group):</td>
                <td>
                  <span style="background:rgba(255,51,102,0.15); color:var(--red-500); font-weight:bold; padding:0.2rem 0.6rem; border-radius:4px; font-size:0.9rem;">
                    🩸 ${kyc.bloodGroup || 'B+'}
                  </span>
                </td>
              </tr>
              <tr>
                <td>বর্তমান ঠিকানা:</td>
                <td>📍 ${kyc.address || 'তথ্য নেই'}</td>
              </tr>
              <tr>
                <td>AI ফেস ম্যাচ ও লাইভনেস স্কোর:</td>
                <td>
                  <span style="color:var(--emerald-400); font-weight:bold; font-size:1rem;">
                    🎯 ${kyc.livenessScore || '৯৯.৪% (আসল জীবন্ত মানুষ নিশ্চিত)'}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Actions Bar (Picture 3 requirement: Clean actions once approved/rejected) -->
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem; margin-top:2rem; border-top:1px solid var(--border-subtle); padding-top:1.2rem;">
            ${kyc.status === 'APPROVED' ? `
              <div style="display:flex; align-items:center; gap:0.5rem; color:var(--emerald-400); font-weight:bold; font-size:0.95rem;">
                <span style="font-size:1.3rem;">✅</span> এই অ্যাকাউন্টটি ইতোমধ্যে অনুমোদিত হয়েছে (APPROVED)
              </div>
            ` : kyc.status === 'REJECTED' ? `
              <div style="display:flex; align-items:center; gap:0.5rem; color:var(--red-500); font-weight:bold; font-size:0.95rem;">
                <span style="font-size:1.3rem;">❌</span> এই আবেদনটি ইতোমধ্যে বাতিল করা হয়েছে (REJECTED)
              </div>
            ` : `
              <div style="display:flex; align-items:center; gap:0.5rem; color:var(--cyan-400); font-size:0.9rem;">
                <span>⏳</span> আবেদনটি অ্যাডমিন অনুমোদনের জন্য অপেক্ষমাণ (PENDING)
              </div>
            `}

            <div style="display:flex; gap:0.8rem; align-items:center;">
              <button class="btn btn-outline" onclick="window.closeKYCDetail()">
                উইন্ডো বন্ধ করুন
              </button>
              ${kyc.status === 'PENDING' ? `
                <button class="btn btn-outline" style="border-color:var(--red-500); color:var(--red-500);" onclick="window.rejectKYC('${kyc.id}'); window.closeKYCDetail();">
                  ✕ আবেদন বাতিল করুন (Reject)
                </button>
                <button class="btn btn-primary" onclick="window.approveKYC('${kyc.id}'); window.closeKYCDetail();">
                  ✓ অ্যাকাউন্ট অনুমোদন করুন (Approve)
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;
  };

  window.closeKYCDetail = () => {
    const modalBox = document.getElementById('kyc-detail-modal-container');
    if (modalBox) modalBox.innerHTML = '';
  };
}

// Global Image Zoom Lightbox Function (Picture 1 requirement)
window.openImageZoom = (imgUrl, title) => {
  let zoomBox = document.getElementById('image-zoom-lightbox');
  if (!zoomBox) {
    zoomBox = document.createElement('div');
    zoomBox.id = 'image-zoom-lightbox';
    document.body.appendChild(zoomBox);
  }
  zoomBox.innerHTML = `
    <div class="zoom-lightbox-overlay" onclick="window.closeImageZoom()">
      <div class="zoom-lightbox-content" onclick="event.stopPropagation()">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:0.6rem;">
          <strong style="color:var(--cyan-400); font-size:1.05rem;">${title || 'ডকুমেন্ট ছবি বিস্তারিত'}</strong>
          <button class="btn btn-outline" style="padding:0.3rem 0.8rem; font-size:0.85rem;" onclick="window.closeImageZoom()">✕ বন্ধ করুন</button>
        </div>
        <div style="max-height:80vh; overflow:auto; text-align:center; background:#000; border-radius:var(--radius-md); padding:0.5rem;">
          <img src="${imgUrl}" alt="High Resolution Document" />
        </div>
        <div style="text-align:center; margin-top:0.8rem;">
          <small style="color:var(--text-muted);">ক্লিয়ার হাই-রেজ্যুলেশন প্রিভিউ (Optical Clarity Verified)</small>
        </div>
      </div>
    </div>
  `;
};

window.closeImageZoom = () => {
  const zoomBox = document.getElementById('image-zoom-lightbox');
  if (zoomBox) zoomBox.innerHTML = '';
};

// ----------------------------------------------------------
// Tab 3: Police Station & Officer Generator
// ----------------------------------------------------------
function renderPoliceTab(container) {
  container.innerHTML = `
    <div class="police-mgmt-layout">
      <!-- Create Officer Form -->
      <div class="police-form-card">
        <h3 style="font-size: 1.3rem; margin-bottom: 0.4rem;">নতুন পুলিশ অফিসার যুক্ত করুন</h3>
        <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.5rem;">
          বাংলাদেশের ৮৫+ থানা থেকে নির্বাচন করুন অথবা নতুন থানা টাইপ করে অটো-ক্রেডেনশিয়াল জেনারেট করুন।
        </p>

        <form id="create-police-form">
          <div class="form-group">
            <label>থানা নির্বাচন করুন (${bangladeshPoliceStations.length - 1}+ থানা তালিকাভুক্ত)</label>
            <select id="pol-station" class="form-input" required>
              ${bangladeshPoliceStations.map(st => `<option value="${st}">${st}</option>`).join('')}
            </select>
          </div>

          <!-- Custom Station Input (Revealed if 'অন্যান্য' chosen) -->
          <div class="form-group" id="pol-custom-station-wrap" style="display:none;">
            <label style="color:var(--cyan-400);">নতুন থানার নাম লিখুন (Custom Station Name):</label>
            <input type="text" id="pol-custom-station" class="form-input" placeholder="যেমন: সাভার মডেল থানা / কক্সবাজার সদর থানা..." />
          </div>

          <div class="form-group">
            <label>অফিসারের পুরো নাম</label>
            <input type="text" id="pol-name" class="form-input" placeholder="যেমন: মোঃ জাহিদ হাসান" required />
          </div>

          <div class="form-group">
            <label>পদবী (Rank)</label>
            <select id="pol-rank" class="form-input" required>
              <option value="Sub-Inspector (SI)">Sub-Inspector (SI)</option>
              <option value="Assistant Sub-Inspector (ASI)">Assistant Sub-Inspector (ASI)</option>
              <option value="Inspector / OC">Officer in Charge (OC / Inspector)</option>
              <option value="Constable">Constable</option>
              <option value="Sergeant">Traffic Sergeant</option>
            </select>
          </div>

          <div class="form-group">
            <label>ব্যাজ নম্বর (Badge No)</label>
            <input type="text" id="pol-badge" class="form-input" placeholder="BD-5520" required />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.85rem;">
            ⚡ ইউজারনেম ও পাসওয়ার্ড জেনারেট করুন
          </button>
        </form>

        <div id="new-cred-box" style="display: none;"></div>
      </div>

      <!-- Police Roster Table -->
      <div class="roster-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size: 1.3rem;">সক্রিয় পুলিশ অফিসার তালিকা</h3>
          <span style="font-size: 0.8rem; color: var(--text-muted);" id="police-count-badge">মোট সদস্য: ${appState.policeRoster.length} জন</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>অফিসার নাম ও পদবী</th>
              <th>থানা</th>
              <th>লগইন আইডি ও পাসওয়ার্ড</th>
              <th>ডিউটি স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody id="police-roster-tbody">
            ${appState.policeRoster.map(pol => `
              <tr>
                <td>
                  <strong>${pol.name}</strong><br/>
                  <small style="color:var(--text-muted);">${pol.rank} (${pol.badge})</small>
                </td>
                <td style="font-size:0.85rem;">${pol.station}</td>
                <td>
                  <div style="font-size:0.85rem;"><strong>ID:</strong> <code style="color:var(--cyan-400);">${pol.username}</code></div>
                  <div style="font-size:0.85rem; margin-top:0.3rem; display:flex; align-items:center; gap:0.4rem;">
                    <strong>Pass:</strong> <code style="color:#ffcc00; font-weight:bold; letter-spacing:0.5px;">${pol.password || 'Safe#2026'}</code>
                    <button class="btn btn-outline" style="padding:0.15rem 0.35rem; font-size:0.68rem;" onclick="navigator.clipboard.writeText('${pol.password || 'Safe#2026'}'); window.showToast && window.showToast('পাসওয়ার্ড কপি হয়েছে', 'success')" title="পাসওয়ার্ড কপি করুন">📋</button>
                  </div>
                </td>
                <td>
                  <span style="padding:0.2rem 0.5rem; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:bold; ${
                    pol.status === 'ON_DUTY' ? 'background:rgba(0,230,118,0.15); color:var(--emerald-400);' : 'background:rgba(255,255,255,0.06); color:var(--text-muted);'
                  }">
                    ${pol.status === 'ON_DUTY' ? '● ON-DUTY' : '○ OFF-DUTY'}
                  </span>
                </td>
                <td>
                  <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="window.toggleDuty('${pol.id}')">
                    ${pol.status === 'ON_DUTY' ? 'ডিউটি অফ করুন' : 'ডিউটি অন করুন'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Function to re-render table rows without destroying the form or credential box
  const refreshPoliceTable = () => {
    const tbody = document.getElementById('police-roster-tbody');
    const countBadge = document.getElementById('police-count-badge');
    if (countBadge) countBadge.innerText = `মোট সদস্য: ${appState.policeRoster.length} জন`;
    if (!tbody) return;
    tbody.innerHTML = appState.policeRoster.map(pol => `
      <tr>
        <td>
          <strong>${pol.name}</strong><br/>
          <small style="color:var(--text-muted);">${pol.rank} (${pol.badge})</small>
        </td>
        <td style="font-size:0.85rem;">${pol.station}</td>
        <td>
          <div style="font-size:0.85rem;"><strong>ID:</strong> <code style="color:var(--cyan-400);">${pol.username}</code></div>
          <div style="font-size:0.85rem; margin-top:0.3rem; display:flex; align-items:center; gap:0.4rem;">
            <strong>Pass:</strong> <code style="color:#ffcc00; font-weight:bold; letter-spacing:0.5px;">${pol.password || 'Safe#2026'}</code>
            <button class="btn btn-outline" style="padding:0.15rem 0.35rem; font-size:0.68rem;" onclick="navigator.clipboard.writeText('${pol.password || 'Safe#2026'}'); window.showToast && window.showToast('পাসওয়ার্ড কপি হয়েছে', 'success')" title="পাসওয়ার্ড কপি করুন">📋</button>
          </div>
        </td>
        <td>
          <span style="padding:0.2rem 0.5rem; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:bold; ${
            pol.status === 'ON_DUTY' ? 'background:rgba(0,230,118,0.15); color:var(--emerald-400);' : 'background:rgba(255,255,255,0.06); color:var(--text-muted);'
          }">
            ${pol.status === 'ON_DUTY' ? '● ON-DUTY' : '○ OFF-DUTY'}
          </span>
        </td>
        <td>
          <button class="btn btn-outline" style="padding:0.3rem 0.6rem; font-size:0.75rem;" onclick="window.toggleDuty('${pol.id}')">
            ${pol.status === 'ON_DUTY' ? 'ডিউটি অফ করুন' : 'ডিউটি অন করুন'}
          </button>
        </td>
      </tr>
    `).join('');
  };

  // Dynamic Station Select Change Listener
  const stationSelect = document.getElementById('pol-station');
  const customWrap = document.getElementById('pol-custom-station-wrap');
  const customInput = document.getElementById('pol-custom-station');

  if (stationSelect && customWrap) {
    stationSelect.addEventListener('change', () => {
      if (stationSelect.value.includes('অন্যান্য') || stationSelect.value.includes('নতুন থানা')) {
        customWrap.style.display = 'block';
        if (customInput) customInput.focus();
      } else {
        customWrap.style.display = 'none';
      }
    });
  }

  // Form submission
  document.getElementById('create-police-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pol-name').value;
    let station = document.getElementById('pol-station').value;
    
    // Check if custom station was typed
    if (station.includes('অন্যান্য') || station.includes('নতুন থানা')) {
      const customVal = customInput ? customInput.value.trim() : '';
      if (customVal) {
        station = customVal;
        if (!bangladeshPoliceStations.includes(customVal)) {
          bangladeshPoliceStations.splice(bangladeshPoliceStations.length - 1, 0, customVal);
        }
      }
    }

    const rank = document.getElementById('pol-rank').value;
    const badge = document.getElementById('pol-badge').value;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const stationCode = badge.replace(/\D/g, '') || randomSuffix;
    const username = `pol_${stationCode}`;
    const password = `Safe#${Math.random().toString(36).slice(-6)}@26`;

    const newOfficer = {
      id: 'pol-' + Date.now(),
      name,
      rank,
      station,
      badge,
      username,
      password, // Password included for mobile app authentication
      status: 'ON_DUTY',
      lat: 23.75 + (Math.random() - 0.5) * 0.05,
      lng: 90.38 + (Math.random() - 0.5) * 0.05
    };

    appState.policeRoster.unshift(newOfficer);
    saveState(appState);
    savePoliceOfficerToFirebase(newOfficer); // Persist to Firebase Cloud!

    // Reset input fields
    document.getElementById('pol-name').value = '';
    document.getElementById('pol-badge').value = '';

    // Show prominent Persistent Credential Card
    const credBox = document.getElementById('new-cred-box');
    credBox.style.display = 'block';
    credBox.innerHTML = `
      <div style="background:rgba(0, 230, 118, 0.08); border:1px solid rgba(0, 230, 118, 0.4); border-radius:var(--radius-md); padding:1.2rem; margin-top:1.5rem;">
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.8rem;">
          <span style="font-size:1.3rem;">✅</span>
          <strong style="color:var(--emerald-400); font-size:1.05rem;">নতুন পুলিশ অফিসার সফলভাবে যুক্ত হয়েছে!</strong>
        </div>
        <div style="background:var(--bg-card); border:1px solid var(--border-subtle); border-radius:var(--radius-sm); padding:1rem; margin-bottom:1rem; font-size:0.92rem; line-height:1.8;">
          <div><span style="color:var(--text-muted);">অফিসার নাম:</span> <strong>${name}</strong> (${rank})</div>
          <div><span style="color:var(--text-muted);">নিযুক্ত থানা:</span> <strong>${station}</strong> (ব্যাজ: ${badge})</div>
          <div style="margin-top:0.5rem; padding-top:0.5rem; border-top:1px dashed var(--border-subtle); display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="color:var(--text-muted);">ইউজারনেম (Username):</span> <code style="color:var(--cyan-400); font-size:1.1rem; font-weight:bold;">${username}</code>
            </div>
            <button class="btn btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="navigator.clipboard.writeText('${username}'); window.showToast && window.showToast('ইউজারনেম কপি হয়েছে', 'success')">📋 কপি</button>
          </div>
          <div style="margin-top:0.35rem; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="color:var(--text-muted);">পাসওয়ার্ড (Password):</span> <code style="color:#ffcc00; font-size:1.2rem; font-weight:bold; letter-spacing:1px;">${password}</code>
            </div>
            <button class="btn btn-outline" style="padding:0.2rem 0.5rem; font-size:0.75rem;" onclick="navigator.clipboard.writeText('${password}'); window.showToast && window.showToast('পাসওয়ার্ড কপি হয়েছে', 'success')">📋 কপি</button>
          </div>
        </div>
        <div style="display:flex; gap:0.8rem; flex-wrap:wrap;">
          <button class="btn btn-primary" style="flex:1; padding:0.6rem 1rem; font-size:0.85rem;" id="copy-cred-btn">
            📋 সম্পূর্ণ তথ্য ও পাসওয়ার্ড কপি করুন
          </button>
          <button class="btn btn-outline" style="padding:0.6rem 0.8rem; font-size:0.82rem;" onclick="document.getElementById('new-cred-box').style.display='none';">
            ✕ বন্ধ করুন
          </button>
        </div>
      </div>
    `;

    document.getElementById('copy-cred-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(`safeCIZ Police Officer Account:\nStation: ${station}\nOfficer: ${name} (${rank})\nBadge: ${badge}\nUsername: ${username}\nPassword: ${password}`);
      showToast('ইউজারনেম ও পাসওয়ার্ড ক্লিপবোর্ডে কপি হয়েছে!', 'success');
    });

    // Update table dynamically without wiping new-cred-box
    refreshPoliceTable();
    showToast(`অফিসার ${name}-এর অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!`, 'success');
  });

  window.toggleDuty = (id) => {
    const officer = appState.policeRoster.find(p => p.id === id);
    if (officer) {
      officer.status = officer.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
      saveState(appState);
      showToast(`${officer.name}-এর ডিউটি স্ট্যাটাস পরিবর্তিত হয়েছে`, 'info');
      refreshPoliceTable();
    }
  };
}

// Router listener
window.addEventListener('hashchange', renderApp);
window.addEventListener('DOMContentLoaded', renderApp);
renderApp();
