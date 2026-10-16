import './style.css';
import L from 'leaflet';

/* ==========================================================
   safeCIZ — Client-Side Router, State & Translation Engine
   ========================================================== */

// Initial Simulated State (Stored in localStorage)
const STORAGE_KEY = 'safeciz_state_v1';

const defaultState = {
  lang: 'bn',
  adminAuth: false,
  activeTab: 'radar', // 'radar' | 'kyc' | 'police' | 'logs'
  kycQueue: [
    {
      id: 'kyc-101',
      name: 'সাদিয়া আফরিন (Sadia Afrin)',
      phone: '01812-345678',
      email: 'sadia.afrin@example.com',
      docType: 'NID',
      selfieUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      docFrontUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      docBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
      status: 'PENDING',
      livenessScore: '99.2%',
      submittedAt: '১০ মিনিট আগে'
    },
    {
      id: 'kyc-102',
      name: 'তানভীর আহমেদ (Tanvir Ahmed)',
      phone: '01711-987654',
      email: 'tanvir.ahmed@example.com',
      docType: 'BIRTH_CERT',
      selfieUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      docFrontUrl: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=80',
      docBackUrl: null,
      status: 'PENDING',
      livenessScore: '98.5%',
      submittedAt: '২৫ মিনিট আগে'
    },
    {
      id: 'kyc-103',
      name: 'ফারহানা ইয়াসমিন (Farhana Yasmin)',
      phone: '01914-112233',
      email: 'farhana.y@example.com',
      docType: 'NID',
      selfieUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      docFrontUrl: 'https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=400&auto=format&fit=crop&q=80',
      docBackUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80',
      status: 'APPROVED',
      livenessScore: '99.8%',
      submittedAt: '২ ঘণ্টা আগে'
    }
  ],
  policeRoster: [
    { id: 'pol-1', name: 'মোঃ রফিকুল ইসলাম', rank: 'Sub-Inspector (SI)', station: 'ধানমন্ডি থানা (Dhanmondi PS)', badge: 'BD-8841', username: 'pol_dhn_8841', status: 'ON_DUTY', lat: 23.7461, lng: 90.3742 },
    { id: 'pol-2', name: 'শহীদুল আলম', rank: 'Assistant Sub-Inspector (ASI)', station: 'গুলশান থানা (Gulshan PS)', badge: 'BD-9204', username: 'pol_gul_9204', status: 'ON_DUTY', lat: 23.7925, lng: 90.4078 },
    { id: 'pol-3', name: 'কাজী মাহমুদ হাসান', rank: 'Officer in Charge (OC)', station: 'রমনা মডেল থানা (Ramna PS)', badge: 'BD-7102', username: 'pol_ram_7102', status: 'ON_DUTY', lat: 23.7412, lng: 90.4011 },
    { id: 'pol-4', name: 'নাসির উদ্দিন', rank: 'Constable', station: 'উত্তরা থানা (Uttara PS)', badge: 'BD-6019', username: 'pol_utt_6019', status: 'OFF_DUTY', lat: 23.8759, lng: 90.3795 }
  ],
  activeIncidents: [
    {
      id: 'sos-9921',
      victimName: 'নুসরাত জাহান (Nusrat Jahan)',
      phone: '01755-123456',
      bloodGroup: 'B+',
      battery: '68%',
      lat: 23.7445,
      lng: 90.3725,
      locationName: 'ধানমন্ডি লেক সংলগ্ন ৮/এ রোড',
      status: 'ACTIVE',
      assignedTo: 'ধানমন্ডি পেট্রোল টিম #০৩ (SI রফিকুল)',
      startedAt: '১ মিনিট ২০ সেকেন্ড আগে',
      speed: '০ কিমি/ঘণ্টা (স্থির অবস্থান)'
    }
  ],
  logs: [
    { time: '19:42:10', type: 'ALERT', text: 'SOS Activated: ভিকটিম নুসরাত জাহান (ধানমন্ডি লেক, ব্যাসার্ধ ২ কিমি)' },
    { time: '19:42:12', type: 'SUCCESS', text: 'FCM High-Priority Siren dispatched to 4 nearby officers & 3 family members' },
    { time: '19:42:45', type: 'SUCCESS', text: 'SI রফিকুল ইসলাম (ধানমন্ডি থানা) কল রিসিভ করেছেন। En-route via Google Maps' }
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
            <strong>24.6 MB</strong>
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
        <button class="btn btn-primary" id="start-apk-download" style="width:100%; padding:0.9rem;">
          📥 সরাসরি APK ডাউনলোড শুরু করুন
        </button>
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
  container.innerHTML = `
    <div class="radar-layout">
      <div class="map-container">
        <div id="admin-leaflet-map"></div>
        <div style="position: absolute; top: 15px; left: 60px; z-index: 1000; background: rgba(8,15,27,0.85); backdrop-filter: blur(10px); border: 1px solid var(--border-subtle); padding: 0.5rem 1rem; border-radius: var(--radius-md); font-size: 0.82rem;">
          <span style="color: var(--cyan-400); font-weight: bold;">● OpenStreetMap লাইভ ফিড</span> | 
          সক্রিয় এসওএস: <span style="color: var(--red-500); font-weight: bold;">${appState.activeIncidents.length} টি</span> | 
          অন-ডিউটি পুলিশ: <span style="color: var(--emerald-400); font-weight: bold;">${appState.policeRoster.filter(p => p.status === 'ON_DUTY').length} জন</span>
        </div>
      </div>

      <div class="radar-sidebar">
        <div class="radar-sidebar-header">
          <h3 style="font-size: 1.15rem;">সক্রিয় এসওএস অ্যালার্ট</h3>
          <span style="font-size: 0.75rem; background: var(--red-glow); color: var(--red-500); padding: 0.2rem 0.5rem; border-radius: 99px; font-weight: bold;">LIVE</span>
        </div>

        <div class="active-incidents-list">
          ${appState.activeIncidents.map(inc => `
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
              <button class="btn btn-primary" style="width: 100%; padding: 0.55rem; font-size: 0.82rem;" onclick="window.dispatchNearestUnit('${inc.id}')">
                🚓 নিকটস্থ পেট্রোল পাঠান (Dispatch)
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

    // Victim SOS Marker
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
}

// ----------------------------------------------------------
// Tab 2: e-KYC Approval Queue
// ----------------------------------------------------------
function renderKYCTab(container) {
  container.innerHTML = `
    <div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
        <div>
          <h2 style="font-size:1.6rem; margin-bottom:0.3rem;">e-KYC ভেরিফিকেশন কিউ</h2>
          <p style="color:var(--text-secondary); font-size:0.9rem;">লাইভ ক্যামেরা সেলফি ও পরিচয়পত্রের ছবি মিলিয়ে অ্যাকাউন্ট অনুমোদন বা বাতিল করুন।</p>
        </div>
        <span style="background:rgba(0,242,254,0.1); color:var(--cyan-400); border:1px solid rgba(0,242,254,0.3); padding:0.4rem 1rem; border-radius:var(--radius-full); font-size:0.85rem; font-weight:bold;">
          অপেক্ষমাণ আবেদন: ${appState.kycQueue.filter(k => k.status === 'PENDING').length} জন
        </span>
      </div>

      <div class="kyc-grid">
        ${appState.kycQueue.map(kyc => `
          <div class="kyc-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
              <span style="font-size:0.75rem; color:var(--text-muted);">${kyc.submittedAt}</span>
              <span style="padding:0.2rem 0.6rem; border-radius:var(--radius-sm); font-size:0.75rem; font-weight:bold; ${
                kyc.status === 'APPROVED' ? 'background:rgba(0,230,118,0.15); color:var(--emerald-400);' :
                kyc.status === 'REJECTED' ? 'background:rgba(255,51,102,0.15); color:var(--red-500);' :
                'background:rgba(0,242,254,0.15); color:var(--cyan-400);'
              }">
                ${kyc.status === 'APPROVED' ? '✓ APPROVED' : kyc.status === 'REJECTED' ? '✕ REJECTED' : '⏳ PENDING'}
              </span>
            </div>

            <h3 style="font-size:1.2rem; margin-bottom:0.2rem;">${kyc.name}</h3>
            <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:0.2rem;">📞 ${kyc.phone}</p>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.8rem;">আইডি টাইপ: <strong>${kyc.docType}</strong> | ফেস ম্যাচ: <strong style="color:var(--emerald-400);">${kyc.livenessScore}</strong></p>

            <div class="kyc-images-preview">
              <div class="kyc-img-box">
                <img src="${kyc.selfieUrl}" alt="Live Camera Selfie" />
                <span class="kyc-img-label">লাইভ সেলফি (ক্যামেরা)</span>
              </div>
              <div class="kyc-img-box">
                <img src="${kyc.docFrontUrl}" alt="ID Document Front" />
                <span class="kyc-img-label">${kyc.docType} সামনের অংশ</span>
              </div>
            </div>

            ${kyc.status === 'PENDING' ? `
              <div class="kyc-actions">
                <button class="btn btn-outline" style="border-color:var(--red-500); color:var(--red-500);" onclick="window.rejectKYC('${kyc.id}')">
                  ✕ বাতিল (Reject)
                </button>
                <button class="btn btn-primary" onclick="window.approveKYC('${kyc.id}')">
                  ✓ অনুমোদন (Approve)
                </button>
              </div>
            ` : `
              <div style="text-align:center; padding:0.5rem; background:rgba(255,255,255,0.02); border-radius:var(--radius-sm); font-size:0.8rem; color:var(--text-muted);">
                যাচাই সম্পন্ন হয়েছে
              </div>
            `}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  window.approveKYC = (id) => {
    const item = appState.kycQueue.find(k => k.id === id);
    if (item) {
      item.status = 'APPROVED';
      saveState(appState);
      showToast(`${item.name}-এর অ্যাকাউন্ট অনুমোদিত হয়েছে!`, 'success');
      renderAdminDashboard(document.getElementById('app'));
    }
  };

  window.rejectKYC = (id) => {
    const item = appState.kycQueue.find(k => k.id === id);
    if (item) {
      item.status = 'REJECTED';
      saveState(appState);
      showToast(`${item.name}-এর আবেদন বাতিল করা হয়েছে (তথ্য ভুল)`, 'alert');
      renderAdminDashboard(document.getElementById('app'));
    }
  };
}

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
          অফিসারের জন্য স্বয়ংক্রিয় ইউজারনেম ও সিকিউর পাসওয়ার্ড তৈরি করা হবে।
        </p>

        <form id="create-police-form">
          <div class="form-group">
            <label>থানা নির্বাচন করুন</label>
            <select id="pol-station" class="form-input" required>
              <option value="ধানমন্ডি থানা (Dhanmondi PS)">ধানমন্ডি থানা (Dhanmondi PS)</option>
              <option value="গুলশান থানা (Gulshan PS)">গুলশান থানা (Gulshan PS)</option>
              <option value="রমনা মডেল থানা (Ramna PS)">রমনা মডেল থানা (Ramna PS)</option>
              <option value="উত্তরা থানা (Uttara PS)">উত্তরা থানা (Uttara PS)</option>
              <option value="মিরপুর মডেল থানা (Mirpur PS)">মিরপুর মডেল থানা (Mirpur PS)</option>
            </select>
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
              <option value="Inspector / OC">Inspector / OC</option>
              <option value="Constable">Constable</option>
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
          <span style="font-size: 0.8rem; color: var(--text-muted);">মোট সদস্য: ${appState.policeRoster.length} জন</span>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>অফিসার নাম ও পদবী</th>
              <th>থানা</th>
              <th>ইউজারনেম</th>
              <th>ডিউটি স্ট্যাটাস</th>
              <th>অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            ${appState.policeRoster.map(pol => `
              <tr>
                <td>
                  <strong>${pol.name}</strong><br/>
                  <small style="color:var(--text-muted);">${pol.rank} (${pol.badge})</small>
                </td>
                <td style="font-size:0.85rem;">${pol.station}</td>
                <td><code>${pol.username}</code></td>
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

  // Form submission
  document.getElementById('create-police-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('pol-name').value;
    const station = document.getElementById('pol-station').value;
    const rank = document.getElementById('pol-rank').value;
    const badge = document.getElementById('pol-badge').value;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const stationShort = station.includes('Dhanmondi') ? 'dhn' : station.includes('Gulshan') ? 'gul' : station.includes('Ramna') ? 'ram' : 'pol';
    const username = `${stationShort}_${badge.replace(/\D/g, '') || randomSuffix}`;
    const password = `Safe#${Math.random().toString(36).slice(-6)}@26`;

    const newOfficer = {
      id: 'pol-' + Date.now(),
      name,
      rank,
      station,
      badge,
      username,
      status: 'ON_DUTY',
      lat: 23.75 + (Math.random() - 0.5) * 0.05,
      lng: 90.38 + (Math.random() - 0.5) * 0.05
    };

    appState.policeRoster.unshift(newOfficer);
    saveState(appState);

    const credBox = document.getElementById('new-cred-box');
    credBox.style.display = 'block';
    credBox.innerHTML = `
      <div class="cred-copy-box">
        <div>
          <small style="color:var(--text-muted); display:block;">অফিসারকে এই তথ্য দিন:</small>
          <span>ইউজারনেম: <code>${username}</code></span><br/>
          <span>পাসওয়ার্ড: <code>${password}</code></span>
        </div>
        <button class="btn btn-outline" style="padding:0.4rem 0.8rem; font-size:0.78rem;" id="copy-cred-btn">
          📋 কপি করুন
        </button>
      </div>
    `;

    document.getElementById('copy-cred-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(`safeCIZ Police Login:\nUsername: ${username}\nPassword: ${password}`);
      showToast('ক্রেডেনশিয়াল ক্লিপবোর্ডে কপি হয়েছে!', 'success');
    });

    showToast(`অফিসার ${name}-এর অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!`, 'success');
    renderPoliceTab(container);
  });

  window.toggleDuty = (id) => {
    const officer = appState.policeRoster.find(p => p.id === id);
    if (officer) {
      officer.status = officer.status === 'ON_DUTY' ? 'OFF_DUTY' : 'ON_DUTY';
      saveState(appState);
      showToast(`${officer.name}-এর ডিউটি স্ট্যাটাস পরিবর্তিত হয়েছে`, 'info');
      renderPoliceTab(container);
    }
  };
}

// Router listener
window.addEventListener('hashchange', renderApp);
window.addEventListener('DOMContentLoaded', renderApp);
renderApp();
