export type SupportedLanguage = 'en' | 'si' | 'my' | 'th' | 'vi' | 'km' | 'lo';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰' },
  { code: 'my', name: 'Burmese', nativeName: 'မြန်မာ', flag: '🇲🇲' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flag: '🇱🇦' },
];

export interface ScreenContent {
  title: string;
  subtitle: string;
  tag: string;
  points: string[];
}

export interface HighlightCardContent {
  title: string;
  desc: string;
}

export interface LandingTranslation {
  brandName: string;
  institute: string;
  badge: string;
  heroTitle: string;
  heroDesc: string;
  danaNote: string;
  insideAppTitle: string;
  insideAppSubtitle: string;
  screens: {
    calendar: ScreenContent;
    meditation: ScreenContent;
    chants: ScreenContent;
    books: ScreenContent;
    study: ScreenContent;
  };
  highlights: {
    vinaya: HighlightCardContent;
    audio: HighlightCardContent;
    scripts: HighlightCardContent;
    location: HighlightCardContent;
    traditions: HighlightCardContent;
    privacy: HighlightCardContent;
  };
  pills: {
    vinaya: string;
    traditions: string;
    scripts: string;
    audio: string;
    privacy: string;
  };
  footer: {
    blessing: string;
    appStore: string;
    googlePlay: string;
    privacyPolicy: string;
    terms: string;
    github: string;
    copyright: string;
    dropScreenshot: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, LandingTranslation> = {
  en: {
    brandName: 'IIT Calendar',
    institute: 'International Institute of Theravada',
    badge: 'Monastic & Lay Practice Companion',
    heroTitle: 'A quiet companion for Dhamma practice and monastic observance.',
    heroDesc:
      'Calculates astronomical dawn and solar noon times for Vinaya meal rules, tracks Uposatha moon days across Theravada traditions, renders Pāli chants across multiple Asian scripts, and provides a peaceful meditation timer.',
    danaNote: 'Offered freely as Dāna • Completely offline • No advertisements • No user tracking',
    insideAppTitle: 'Inside the App',
    insideAppSubtitle: 'The core instruments for monastic Vinaya and contemplative life.',
    screens: {
      calendar: {
        title: 'Lunar & Solar',
        subtitle: 'Uposatha & Sun Times',
        tag: 'Calendar',
        points: [
          'Astronomical Solar Noon (Majjhanhike)',
          'Dawn rise (Aruṇuggamana)',
          'Sri Lankan, Myanmar & Thai Uposatha',
        ],
      },
      meditation: {
        title: 'Stillness',
        subtitle: 'Meditation & Singing Bowl',
        tag: 'Stillness',
        points: [
          'Tibetan bronze singing bowl bells',
          'Preparation & interval reminders',
          'Private local practice log',
        ],
      },
      chants: {
        title: 'Pāli Chants',
        subtitle: 'Multi-Script Recitation',
        tag: 'Chants',
        points: [
          'Roman, Sinhala, Burmese & Thai scripts',
          'Paritta, Vandana & Suttas',
          'Synchronized audio player',
        ],
      },
      books: {
        title: 'Dhamma Books',
        subtitle: 'Canonical Texts & Vinaya',
        tag: 'Reading',
        points: [
          'Bhikkhu Pātimokkha & Vinaya rules',
          'Chanting book & memorization texts',
          'Offline reading & bookmarks',
        ],
      },
      study: {
        title: 'Study Focus',
        subtitle: 'Focus Blocks & Reflection',
        tag: 'Study',
        points: [
          'Memorization focus intervals',
          'Pātimokkha recitation tracker',
          'Daily Dhammapada reflections',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'Vinaya: Dawn & Solar Noon',
        desc: 'Astronomical dawn (Aruṇuggamana) & solar noon (Majjhanhike) computed on-device for meal times.',
      },
      audio: {
        title: 'Monastic Audio & Bells',
        desc: 'Authentic Tibetan bronze singing bowls, temple gongs, and paritta recitation recordings.',
      },
      scripts: {
        title: '7+ Aksharamukha Scripts',
        desc: 'Real-time Pāli script transliteration: Roman, Sinhala, Burmese, Thai, Khmer, Lao.',
      },
      location: {
        title: 'Monastery Presets & GPS',
        desc: 'Built-in coordinates for IIT, Na-Uyana, Pa-Auk, and offline global solar calculations.',
      },
      traditions: {
        title: 'Theravāda Traditions',
        desc: 'Uposatha moon days aligned for Sri Lankan, Myanmar (Pa-Auk), and Thai monastic calendars.',
      },
      privacy: {
        title: '100% Offline & Private',
        desc: 'Zero user accounts, no telemetry, zero cloud tracking. Completely private on-device.',
      },
    },
    pills: {
      vinaya: 'Vinaya: Solar Noon Meal Cut-off',
      traditions: 'Traditions: Sri Lanka • Myanmar (Pa-Auk) • Thailand',
      scripts: 'Scripts: 7+ Aksharamukha Alphabets',
      audio: 'Audio: Monastic Gong & Singing Bowl',
      privacy: 'Privacy: 100% On-Device & Offline',
    },
    footer: {
      blessing: '“Sabbe sattā bhavantu sukhitattā”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Service',
      github: 'GitHub',
      copyright: 'International Institute of Theravada (IIT)',
      dropScreenshot: 'Screenshot Placeholder',
    },
  },

  si: {
    brandName: 'IIT දින දර්ශනය',
    institute: 'අන්තර්ජාතික ථෙරවාද බෞද්ධ ආයතනය (IIT)',
    badge: 'පැවිදි සහ ගිහි ප්‍රතිපත්ති සහයක',
    heroTitle: 'ධර්ම ප්‍රතිපදාව සහ විනයානුකූල දිවිපෙවෙත සඳහා නිහඬ සහයකයෙක්.',
    heroDesc:
      'විකාල භෝජන විනය නීතිය සඳහා නිවැරදි සූර්ය මධ්‍යාහ්න (මජ්ඣන්හිකේ) හා අරුණෝදය ගණනය කිරීම, ථෙරවාද සම්ප්‍රදායන් අනුව පොහොය දින සටහන්, බහු-භාෂා අක්ෂරවලින් පාලි සජ්ඣායනා සහ නිස්කලංක භාවනා කාලගණකය.',
    danaNote: 'සම්පූර්ණයෙන්ම ධර්ම දානයක් ලෙස පිරිනැමේ • නොබැඳිව (Offline) ක්‍රියා කරයි • දැන්වීම් රහිතයි • දත්ත රැස් නොකෙරේ',
    insideAppTitle: 'යෙදුමේ අන්තර්ගතය',
    insideAppSubtitle: 'විනයානුකූල පැවිදි දිවිය සහ සිත දියුණු කිරීම සඳහා වන මූලික මෙවලම්.',
    screens: {
      calendar: {
        title: 'චන්ද්‍ර හා සූර්ය කාල',
        subtitle: 'පොහොය හා විනය වේලාවන්',
        tag: 'දින දර්ශනය',
        points: [
          'සූර්ය මධ්‍යාහ්නය (මජ්ඣන්හිකේ - විකාල සීමාව)',
          'අරුණෝදය (අරුණුග්ගමන)',
          'ශ්‍රී ලංකා, මියන්මාර සහ තායි සම්ප්‍රදායන්',
        ],
      },
      meditation: {
        title: 'සමථ භාවනාව',
        subtitle: 'භාවනා හා නාද සීනුව',
        tag: 'භාවනා',
        points: [
          'තිබෙත් ලෝකඩ පාත්‍ර නාද සීනුව',
          'සුදානම් වීමේ සහ කාල පරතර සීනු',
          'පුද්ගලික භාවනා කාල සටහන්',
        ],
      },
      chants: {
        title: 'පාලි සජ්ඣායනා',
        subtitle: 'බහු අක්ෂර පරිවර්තනය',
        tag: 'සජ්ඣායනා',
        points: [
          'සිංහල, රෝමන්, බුරුම සහ තායි අක්ෂර',
          'පිරිත්, වන්දනා සහ සූත්‍ර',
          'සමගාමී ශ්‍රව්‍ය ධාවකය',
        ],
      },
      books: {
        title: 'ධර්ම පුස්තක',
        subtitle: 'පාතිමොක්ඛය හා ධර්ම ග්‍රන්ථ',
        tag: 'කියවන්න',
        points: [
          'භික්ඛුපාතිමොක්ඛ සහ විනය ශික්ෂාපද',
          'දිනපතා පිරිත් පොත සහ ධර්ම පාඨ',
          'අන්තර්ජාලය නොමැතිව කියවීම',
        ],
      },
      study: {
        title: 'ධර්ම අධ්‍යයනය',
        subtitle: 'ධර්ම සාකච්ඡා හා මතක තබා ගැනීම',
        tag: 'අධ්‍යයනය',
        points: [
          'පාතිමොක්ඛ කටපාඩම් කාල පරිච්ඡේද',
          'සූත්‍ර පරිශීලන සටහන්',
          'දිනපතා ධම්මපද ගාථා',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'විනය: අරුණෝදය හා සූර්ය මධ්‍යාහ්නය',
        desc: 'විකාල භෝජන සීමාව (මජ්ඣන්හිකේ) සහ අරුණෝදය (අරුණුග්ගමන) නිවැරදිව ගණනය කිරීම.',
      },
      audio: {
        title: 'ලෝකඩ පාත්‍ර හා ඝණ්ඨා නාද',
        desc: 'තිබෙත් ලෝකඩ පාත්‍ර නාද සීනුව, ආරණ්‍ය ඝණ්ඨා නාද සහ නොබැඳි පිරිත් ශ්‍රව්‍ය ධාවකය.',
      },
      scripts: {
        title: 'අක්ෂරමුඛ 7+ ලිපි ක්‍රම',
        desc: 'පාලි පාඨ සිංහල, රෝමන්, බුරුම, තායි, ඛමර් සහ ලාඕ අක්ෂරවලට ක්ෂණිකව පරිවර්තනය.',
      },
      location: {
        title: 'ආරාම ස්ථාන සහ GPS',
        desc: 'IIT, නා උයන, පා-ඖක් ආරාම ස්ථාන සහ අන්තර්ජාලය රහිතව ලොව ඕනෑම තැනක සූර්ය ගණනය.',
      },
      traditions: {
        title: 'ථෙරවාද සම්ප්‍රදායන්',
        desc: 'ශ්‍රී ලංකා, මියන්මාර (පා-ඖක්) සහ තායිලන්ත සම්ප්‍රදායන් අනුව පොහොය දින සටහන්.',
      },
      privacy: {
        title: '100% නොබැඳි හා පෞද්ගලික',
        desc: 'කිසිදු පරිශීලක ගිණුමක්, දත්ත රැස් කිරීමක් හෝ දැන්වීම් නැත. සම්පූර්ණයෙන්ම උපාංගය තුළ පමණි.',
      },
    },
    pills: {
      vinaya: 'විනය: විකාල භෝජන සීමාව',
      traditions: 'සම්ප්‍රදායන්: ශ්‍රී ලංකා • මියන්මාර (පා-ඖක්) • තායි',
      scripts: 'අක්ෂර: අක්ෂරමුඛ 7+ ලිපි ක්‍රම',
      audio: 'ශබ්ද: ලෝකඩ පාත්‍ර හා ඝණ්ඨා නාද',
      privacy: 'පෞද්ගලිකත්වය: 100% උපාංගය තුළ පමණි',
    },
    footer: {
      blessing: '“සබ්බේ සත්තා භවන්තු සුඛිතත්තා”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
      terms: 'භාවිත කොන්දේසි',
      github: 'GitHub',
      copyright: 'අන්තර්ජාතික ථෙරවාද බෞද්ධ ආයතනය (IIT)',
      dropScreenshot: 'තිර ඡායාරූප ස්ථානය',
    },
  },

  my: {
    brandName: 'IIT ပြက္ခဒိန်',
    institute: 'အပြည်ပြည်ဆိုင်ရာ ထေရဝါဒ ဗုဒ္ဓတက္ကသိုလ် (IIT)',
    badge: 'ရဟန်းနှင့် လူပုဂ္ဂိုလ်များအတွက် လမ်းညွှန်',
    heroTitle: 'တရားဓမ္မကျင့်ကြံမှုနှင့် ဝိနည်းတော်အတွက် အေးချမ်းသောအဖော်မွန်။',
    heroDesc:
      'ဝိနည်းတော်နှင့်အညီ နေလွန်းချိန် (မဇ္ဈနှိကေ) နှင့် အရုဏ်တက်ချိန်တွက်ချက်ခြင်း၊ ထေရဝါဒဂိုဏ်းပေါင်းစုံ ဥပုသ်နေ့ရက်များ၊ ပါဠိစာပေများကို ဘာသာစကားမျိုးစုံဖြင့် ဖတ်ရှုရွတ်ဖတ်နိုင်ခြင်းနှင့် တရားထိုင်ချိန်မှတ်နာရီ။',
    danaNote: 'ဓမ္မဒါနအဖြစ် လှူဒါန်းပါသည် • အင်တာနက်မလိုဘဲ အသုံးပြုနိုင်သည် • ကြော်ငြာလုံးဝမပါပါ • ဒေတာရယူခြင်းမရှိပါ',
    insideAppTitle: 'အက်ပ်အတွင်း ပါဝင်သောအရာများ',
    insideAppSubtitle: 'ရဟန်းတော်များ၏ ဝိနည်းနှင့် တရားကျင့်ကြံမှုအတွက် အဓိကကိရိယာများ။',
    screens: {
      calendar: {
        title: 'လနှင့် နေပြက္ခဒိန်',
        subtitle: 'ဥပုသ်နေ့နှင့် ဝိနည်းအချိန်များ',
        tag: 'ပြက္ခဒိန်',
        points: [
          'နေလွန်းချိန် တွက်ချက်မှု (မဇ္ဈနှိကေ)',
          'အရုဏ်တက်ချိန် (အရုဏုဂ္ဂမန)',
          'သီရိလင်္ကာ၊ မြန်မာ နှင့် ထိုင်း ဥပုသ်ရက်များ',
        ],
      },
      meditation: {
        title: 'တရားထိုင်ခြင်း',
        subtitle: 'သမာဓိနှင့် ခေါင်းလောင်းသံ',
        tag: 'တရားထိုင်',
        points: [
          'တိဗက်ကြေးဖလား ခေါင်းလောင်းသံ',
          'ပြင်ဆင်ချိန်နှင့် ကြားကာလ ခေါင်းလောင်း',
          'ကိုယ်ပိုင်တရားထိုင်မှတ်တမ်း',
        ],
      },
      chants: {
        title: 'ပါဠိရွတ်ဖတ်မှု',
        subtitle: 'အက္ခရာဖလှယ်ခြင်းစနစ်',
        tag: 'ရွတ်ဖတ်',
        points: [
          'မြန်မာ၊ ရိုမန်၊ သီဟိုဠ်၊ ထိုင်း အက္ခရာများ',
          'ပရိတ်တော်၊ ဝန္ဒနာနှင့် သုတ်တော်များ',
          'အသံဖိုင်နှင့်အတူ ရွတ်ဖတ်နိုင်မှု',
        ],
      },
      books: {
        title: 'ဓမ္မကျမ်းစာများ',
        subtitle: 'ပါတိမောက်နှင့် ကျမ်းဂန်များ',
        tag: 'ဖတ်ရှု',
        points: [
          'ဘိက္ခုပါတိမောက် ဝိနည်းသိက္ခာပုဒ်များ',
          'နေ့စဉ်ဝတ်ရွတ်စဉ်နှင့် ကျက်မှတ်ဖွယ်များ',
          'အင်တာနက်မလိုဘဲ ဖတ်ရှုနိုင်မှု',
        ],
      },
      study: {
        title: 'စာပေလေ့လာခြင်း',
        subtitle: 'ကျက်မှတ်မှုနှင့် နှလုံးသွင်းခြင်း',
        tag: 'လေ့လာမှု',
        points: [
          'ဝိနည်းအာဂုံဆောင် အချိန်ပိုင်းများ',
          'ပါတိမောက်ပြန်ဆိုမှု မှတ်တမ်း',
          'နေ့စဉ် ဓမ္မပဒဂါထာတော်များ',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'ဝိနည်း: အရုဏ်နှင့် နေလွန်းချိန်',
        desc: 'အရုဏ်တက်ချိန် (အရုဏုဂ္ဂမန) နှင့် ဝိနည်းဆွမ်းစားချိန် နေလွန်းချိန် (မဇ္ဈနှိကေ) တိကျစွာ တွက်ချက်မှု။',
      },
      audio: {
        title: 'ကြေးစည်နှင့် ခေါင်းလောင်းသံ',
        desc: 'တိဗက်ကြေးဖလား ခေါင်းလောင်းသံ၊ ကျောင်းတိုက်ကြေးစည်သံနှင့် အော့ဖ်လိုင်း ပရိတ်ရွတ်ဖတ်သံများ။',
      },
      scripts: {
        title: 'အက္ခရာ ၇ မျိုးကျော် ဖလှယ်မှု',
        desc: 'ပါဠိတော်များကို မြန်မာ၊ ရိုမန်၊ သီဟိုဠ်၊ ထိုင်း၊ ခမာ၊ လာအို အက္ခရာများဖြင့် အချိန်နှင့်တပြေးညီ ဖလှယ်ဖတ်ရှုနိုင်ခြင်း။',
      },
      location: {
        title: 'ကျောင်းတိုက်တည်နေရာနှင့် GPS',
        desc: 'IIT၊ နာအုယျာန၊ ဖားအောက်ကျောင်းတိုက်များနှင့် အင်တာနက်မလိုဘဲ ကမ္ဘာအနှံ့ နေအချိန်တွက်ချက်မှု။',
      },
      traditions: {
        title: 'ထေရဝါဒ ဂိုဏ်းစုံ ဥပုသ်ရက်များ',
        desc: 'သီရိလင်္ကာ၊ မြန်မာ (ဖားအောက်) နှင့် ထိုင်း ထေရဝါဒပြက္ခဒိန်များ စုံလင်စွာ ထည့်သွင်းထားခြင်း။',
      },
      privacy: {
        title: '၁၀၀% လုံခြုံစိတ်ချ အော့ဖ်လိုင်း',
        desc: 'အကောင့်ဖွင့်ရန်မလို၊ အချက်အလက်ရယူခြင်းမရှိ၊ ဖုန်းတွင်း၌သာ လုံခြုံစွာ သုံးနိုင်ခြင်း။',
      },
    },
    pills: {
      vinaya: 'ဝိနည်း: ဆွမ်းစားချိန် ကန့်သတ်ချက်',
      traditions: 'ဂိုဏ်းများ: သီရိလင်္ကာ • မြန်မာ (ဖားအောက်) • ထိုင်း',
      scripts: 'အက္ခရာ: ၇ မျိုးကျော် ဖလှယ်နိုင်မှု',
      audio: 'အသံ: ကြေးစည်နှင့် ကြေးဖလားသံ',
      privacy: 'လုံခြုံမှု: မိမိဖုန်းတွင်း၌သာ ၁၀၀% သိမ်းဆည်းသည်',
    },
    footer: {
      blessing: '“သဗ္ဗေ သတ္တာ ဘဝန္တု သုခိတတ္တာ”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'ကိုယ်ရေးအချက်အလက် မူဝါဒ',
      terms: 'စည်းကမ်းချက်များ',
      github: 'GitHub',
      copyright: 'International Institute of Theravada (IIT)',
      dropScreenshot: 'စခရင်ရှော့ နေရာလွတ်',
    },
  },

  th: {
    brandName: 'IIT ปฏิทิน',
    institute: 'สถาบันเถรวาทนานาชาติ (IIT)',
    badge: 'เพื่อนคู่คิดสำหรับพระภิกษุและพุทธศาสนิกชน',
    heroTitle: 'เพื่อนร่วมทางอันสงบเพื่อการปฏิบัติธรรมและพระวินัย.',
    heroDesc:
      'คำนวณเวลาอรุณรุ่งและเวลาเที่ยงวันตามหลักดาราศาสตร์ (มัชฌันหิกะ) สำหรับการขบฉันตามพระวินัย ติดตามวันอุโบสถของนิกายเถรวาท สวดมนต์ภาษาบาลีหลายอักษร และนาฬิกาทำสมาธิ.',
    danaNote: 'แจกจ่ายเป็นธรรมทานโดยไม่คิดมูลค่า • ใช้งานแบบออฟไลน์ได้ 100% • ไม่มีโฆษณา • ไม่มีการติดตามข้อมูล',
    insideAppTitle: 'ภายในแอปพลิเคชัน',
    insideAppSubtitle: 'เครื่องมือสำคัญสำหรับพระวินัยและการเจริญภาวนา.',
    screens: {
      calendar: {
        title: 'ปฏิทินจันทรคติและสุริยคติ',
        subtitle: 'วันอุโบสถและเวลาพระวินัย',
        tag: 'ปฏิทิน',
        points: [
          'เวลาเที่ยงวันจริง (มัชฌันหิกะ ขอบเขตวิกาล)',
          'เวลาอรุณขึ้น (อรุณุคคมนะ)',
          'ปฏิทินไทย ศรีลังกา และพม่า',
        ],
      },
      meditation: {
        title: 'ความสงบแห่งจิต',
        subtitle: 'การทำสมาธิและระฆังภาวนา',
        tag: 'สมาธิ',
        points: [
          'เสียงระฆังขันสำริดทิเบตอันกังวาน',
          'เวลานับถอยหลังเตรียมตัวและเสียงบอกช่วงเวลา',
          'บันทึกเวลาปฏิบัติส่วนตัว',
        ],
      },
      chants: {
        title: 'บทสวดมนต์บาลี',
        subtitle: 'การถอดอักษรหลายภาษา',
        tag: 'สวดมนต์',
        points: [
          'อักษรไทย โรมัน สิงหล และพม่า',
          'พระปริตร บทสวดมนต์ และพระสูตร',
          'ระบบเสียงสวดประกอบจังหวะ',
        ],
      },
      books: {
        title: 'พระไตรปิฎกและคัมภีร์',
        subtitle: 'พระปาติโมกข์และพระวินัย',
        tag: 'อ่าน',
        points: [
          'ภิกขุปาติโมกขบาลีและศีลวินัย',
          'หนังสือสวดมนต์และบทท่องจำ',
          'อ่านคัมภีร์ได้โดยไม่ต้องใช้อินเทอร์เน็ต',
        ],
      },
      study: {
        title: 'การศึกษาพระธรรม',
        subtitle: 'ช่วงเวลาท่องจำและไตร่ตรอง',
        tag: 'ศึกษา',
        points: [
          'ช่วงเวลาท่องจำพระปาติโมกข์',
          'บันทึกความก้าวหน้าในการศึกษา',
          'พระธรรมบทประจำวันพร้อมคำอธิบาย',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'พระวินัย: เวลาอรุณและเที่ยงวัน',
        desc: 'คำนวณเวลาอรุณรุ่ง (อรุณุคคมนะ) และเวลาเที่ยงวันจริง (มัชฌันหิกะ) สำหรับการขบฉันในเครื่อง.',
      },
      audio: {
        title: 'เสียงระฆังและฆ้องวัดป่า',
        desc: 'เสียงระฆังขันสำริดทิเบต ฆ้องวัดป่าสำหรับการเจริญสติ และเสียงสวดมนต์แบบออฟไลน์.',
      },
      scripts: {
        title: 'ถอดรหัสบาลี 7+ อักษร',
        desc: 'ถอดอักษรบาลีแบบทันที: ไทย, โรมัน, สิงหล, พม่า, เขมร และลาว ผ่านระบบ Aksharamukha.',
      },
      location: {
        title: 'พิกัดวัดป่าและ GPS ทั่วโลก',
        desc: 'พิกัดวัด IIT, นาอูยานา, ป่าอ็อก และคำนวณตำแหน่งดวงอาทิตย์ทั่วโลกโดยไม่ต้องใช้อินเทอร์เน็ต.',
      },
      traditions: {
        title: 'นิกายเถรวาทอันหลากหลาย',
        desc: 'ติดตามวันอุโบสถของคณะสงฆ์ไทย (ธรรมยุต/มหานิกาย), ศรีลังกา และพม่าอย่างแม่นยำ.',
      },
      privacy: {
        title: 'ออฟไลน์และเป็นส่วนตัว 100%',
        desc: 'ไม่มีการสร้างบัญชี ไม่มีการเก็บข้อมูลสถิติ ปลอดภัยและทำงานภายในอุปกรณ์ทั้งหมด.',
      },
    },
    pills: {
      vinaya: 'พระวินัย: ขอบเขตเวลาเที่ยงวันในการขบฉัน',
      traditions: 'นิกาย: ไทย (ธรรมยุต/มหานิกาย) • ศรีลังกา • พม่า',
      scripts: 'อักษร: ถอดรหัสบาลีได้มากกว่า 7 ตัวอักษร',
      audio: 'เสียง: ระฆังสำริดและฆ้องวัดป่า',
      privacy: 'ความเป็นส่วนตัว: ปลอดภัยและทำงานในเครื่อง 100%',
    },
    footer: {
      blessing: '“สพฺเพ สตฺตา ภวนฺตุ สุขิตตฺตา”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'นโยบายความเป็นส่วนตัว',
      terms: 'ข้อกำหนดการใช้งาน',
      github: 'GitHub',
      copyright: 'สถาบันเถรวาทนานาชาติ (IIT)',
      dropScreenshot: 'ช่องว่างสำหรับภาพหน้าจอ',
    },
  },

  vi: {
    brandName: 'Lịch IIT',
    institute: 'Viện Phật học Nguyên thủy Quốc tế (IIT)',
    badge: 'Đồng hành cùng Tăng chúng & Phật tử',
    heroTitle: 'Người bạn đồng hành an tịnh cho việc tu học và Giới luật.',
    heroDesc:
      'Tính toán giờ rạng đông và nhật trung (chính ngọ) theo thiên văn học để thọ thực đúng Luật, theo dõi ngày Bố-tát (Uposatha) theo các truyền thống Theravada, tụng kinh Pāli đa ngữ văn tự và đồng hồ hành thiền an định.',
    danaNote: 'Pháp thí hoàn toàn miễn phí • Hoạt động offline 100% • Không quảng cáo • Không thu thập dữ liệu',
    insideAppTitle: 'Bên trong Ứng dụng',
    insideAppSubtitle: 'Các công cụ cốt lõi cho nếp sống phạm hạnh và an định nội tâm.',
    screens: {
      calendar: {
        title: 'Lịch Âm & Mặt Trời',
        subtitle: 'Ngày Uposatha & Thời khắc Giới luật',
        tag: 'Lịch',
        points: [
          'Nhật trung thiên văn (Majjhanhike - giờ thọ thực)',
          'Thời điểm rạng đông (Aruṇuggamana)',
          'Truyền thống Sri Lanka, Myanmar & Thái Lan',
        ],
      },
      meditation: {
        title: 'Hành Thiền An Định',
        subtitle: 'Chuông xoay & Tĩnh lặng',
        tag: 'Thiền định',
        points: [
          'Âm thanh chuông đồng Tây Tạng ngân vang',
          'Thời gian chuẩn bị và chuông báo định kỳ',
          'Nhật ký hành thiền lưu trữ nội bộ',
        ],
      },
      chants: {
        title: 'Tụng Niệm Pāli',
        subtitle: 'Chuyển tự đa hệ văn tự',
        tag: 'Tụng niệm',
        points: [
          'Ký tự Roman, Sinhala, Miến Điện & Thái',
          'Kinh Paritta, tụng niệm tán dương và bài kinh',
          'Âm thanh xướng tụng đồng bộ',
        ],
      },
      books: {
        title: 'Kinh Điển & Giới Luật',
        subtitle: 'Pātimokkha & Văn bản Phật pháp',
        tag: 'Đọc sách',
        points: [
          'Giới bổn Tỳ-khưu Pātimokkha & học giới',
          'Kinh tụng hằng ngày & tài liệu học thuộc',
          'Đọc ngoại tuyến không cần mạng',
        ],
      },
      study: {
        title: 'Học Pháp Chuyên Sâu',
        subtitle: 'Khối thời gian học & Chiêm nghiệm',
        tag: 'Học tập',
        points: [
          'Khối thời gian học thuộc Giới bổn',
          'Theo dõi việc ôn tụng Pātimokkha',
          'Câu kinh Pháp Cú (Dhammapada) hằng ngày',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'Giới luật: Hừng đông & Giờ ngọ',
        desc: 'Tính toán thiên văn thời điểm hừng đông (Aruṇuggamana) và đứng bóng (Majjhanhike) trên thiết bị.',
      },
      audio: {
        title: 'Chuông xoay & Âm thanh tu viện',
        desc: 'Chuông xoay Tây Tạng, chuông đồng tu viện và các bài tụng kinh Paritta ngoại tuyến.',
      },
      scripts: {
        title: 'Hơn 7 văn tự Aksharamukha',
        desc: 'Chuyển tự Pāli tức thì giữa các chữ viết: Roman, Sinhala, Miến Điện, Thái, Khmer, Lào.',
      },
      location: {
        title: 'Tọa độ Tu viện & GPS toàn cầu',
        desc: 'Tích hợp sẵn tọa độ IIT, Na-Uyana, Pa-Auk và tính toán mặt trời ngoại tuyến trên toàn thế giới.',
      },
      traditions: {
        title: 'Truyền thống Theravāda',
        desc: 'Ngày Bố-tát theo lịch tăng đoàn Sri Lanka, Myanmar (Pa-Auk) và Thái Lan.',
      },
      privacy: {
        title: '100% Ngoại tuyến & Riêng tư',
        desc: 'Không cần tài khoản, không theo dõi từ xa, không máy chủ đám mây. Hoàn toàn riêng tư.',
      },
    },
    pills: {
      vinaya: 'Giới luật: Hạn định giờ ngọ trai',
      traditions: 'Truyền thống: Sri Lanka • Myanmar (Pa-Auk) • Thái Lan',
      scripts: 'Văn tự: Hơn 7 bảng chữ cái Pāli qua Aksharamukha',
      audio: 'Âm thanh: Chuông xoay & chuông tu viện an định',
      privacy: 'Quyền riêng tư: 100% trên thiết bị, không gửi dữ liệu',
    },
    footer: {
      blessing: '“Sabbe sattā bhavantu sukhitattā”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'Chính sách Quyền riêng tư',
      terms: 'Điều khoản dịch vụ',
      github: 'GitHub',
      copyright: 'Viện Phật học Nguyên thủy Quốc tế (IIT)',
      dropScreenshot: 'Khung vị trí ảnh chụp màn hình',
    },
  },

  km: {
    brandName: 'ប្រតិទិន IIT',
    institute: 'វិទ្យាស្ថានថេរវាទអន្តរជាតិ (IIT)',
    badge: 'មគ្គុទ្ទេសក៍សម្រាប់ព្រះសង្ឃ និងពុទ្ធបរិស័ទ',
    heroTitle: 'មិត្តដ៏ស្ងប់ស្ងាត់សម្រាប់ការប្រតិបត្តិធម៌ និងការគោរពវិន័យ.',
    heroDesc:
      'គណនាពេលវេលាអរុណរះ និងថ្ងៃត្រង់ពិត (មជ្ឈន្ហិកេ) សម្រាប់ការឆាន់តាមវិន័យ តាមដានថ្ងៃឧបោសថតាមប្រពៃណីថេរវាទ សូត្រមន្តបាលីជាអក្សរច្រើនភាសា និងនាឡិកាភាវនាប្រកបដោយសន្តិភាព.',
    danaNote: 'ចែកជូនជាធម្មទានដោយឥតគិតថ្លៃ • ដំណើរការក្រៅបណ្តាញ ១០០% • គ្មានការផ្សាយពាណិជ្ជកម្ម • មិនប្រមូលទិន្នន័យ',
    insideAppTitle: 'មាតិកាក្នុងកម្មវិធី',
    insideAppSubtitle: 'ឧបករណ៍សំខាន់ៗសម្រាប់វិន័យសង្ឃ និងការអភិវឌ្ឍចិត្ត.',
    screens: {
      calendar: {
        title: 'ប្រតិទិនចន្ទគតិ និងព្រះអាទិត្យ',
        subtitle: 'ថ្ងៃឧបោសថ និងម៉ោងវិន័យ',
        tag: 'ប្រតិទិន',
        points: [
          'ថ្ងៃត្រង់តារាសាស្ត្រ (មជ្ឈន្ហិកេ - កំណត់ពេលឆាន់)',
          'អរុណរះ (អរុណុគ្គមន)',
          'ប្រពៃណីស្រីលង្កា មីយ៉ាន់ម៉ា និងថៃ',
        ],
      },
      meditation: {
        title: 'សមថភាវនា',
        subtitle: 'ការតាំងសមាធិ និងសំឡេងជួង',
        tag: 'ភាវនា',
        points: [
          'សំឡេងជួងចានស្ពាន់ទីបេដ៏ពិរោះ',
          'ពេលវេលារៀបចំ និងជួងរំលឹកតាមដំណាក់កាល',
          'កំណត់ត្រាការប្រតិបត្តិផ្ទាល់ខ្លួន',
        ],
      },
      chants: {
        title: 'ការសូត្រមន្តបាលី',
        subtitle: 'ការបម្លែងអក្សរពហុភាសា',
        tag: 'សូត្រមន្ត',
        points: [
          'អក្សរខ្មែរ រ៉ូម៉ាំង សីហឡៈ និងភូមា',
          'គាថាបរិត្ត វន្ទនា និងព្រះសូត្រ',
          'សំឡេងសូត្រស្របគ្នា',
        ],
      },
      books: {
        title: 'គម្ពីរព្រះធម៌',
        subtitle: 'បាតិមោក្ខ និងក្បួនវិន័យ',
        tag: 'អាន',
        points: [
          'ភិក្ខុបាតិមោក្ខបាលី និងសិក្ខាបទ',
          'សៀវភៅសូត្រមន្ត និងមេរៀនទន្ទេញ',
          'អានដោយមិនបាច់ប្រើអ៊ីនធឺណិត',
        ],
      },
      study: {
        title: 'ការសិក្សាព្រះធម៌',
        subtitle: 'ការទន្ទេញ និងការពិចារណា',
        tag: 'ការសិក្សា',
        points: [
          'វគ្គសិក្សាសម្រាប់ការទន្ទេញបាតិមោក្ខ',
          'តាមដានការសូត្របាតិមោក្ខ',
          'គាថាធម្មបទប្រចាំថ្ងៃ',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'វិន័យ: អរុណរះ និងថ្ងៃត្រង់ពិត',
        desc: 'គណនាពេលអរុណរះ (អរុណុគ្គមន) និងថ្ងៃត្រង់ពិត (មជ្ឈន្ហិកេ) សម្រាប់ការឆាន់តាមវិន័យលើទូរសព្ទ។',
      },
      audio: {
        title: 'ជួងចានស្ពាន់ និងគងវត្តអារាម',
        desc: 'សំឡេងជួងចានស្ពាន់ទីបេ គងវត្តអារាមសម្រាប់ភាវនា និងសំឡេងសូត្របរិត្តក្រៅបណ្តាញ។',
      },
      scripts: {
        title: 'បម្លែងអក្សរបាលី ៧+ ប្រព័ន្ធ',
        desc: 'បម្លែងអក្សរបាលីភ្លាមៗ: អក្សរខ្មែរ រ៉ូម៉ាំង សីហឡៈ ភូមា ថៃ និងឡាវ តាម Aksharamukha។',
      },
      location: {
        title: 'ទីតាំងវត្តអារាម និង GPS',
        desc: 'កំណត់ទីតាំងវត្ត IIT, Na-Uyana, Pa-Auk និងគណនាពន្លឺព្រះអាទិត្យទូទាំងពិភពលោកដោយមិនបាច់អ៊ីនធឺណិត។',
      },
      traditions: {
        title: 'ប្រពៃណីថេរវាទ',
        desc: 'តាមដានថ្ងៃឧបោសថស្របតាមប្រពៃណីសង្ឃស្រីលង្កា មីយ៉ាន់ម៉ា (ប៉ាអ៊ុក) និងថៃ។',
      },
      privacy: {
        title: 'ក្រៅបណ្តាញ និងឯកជនភាព ១០០%',
        desc: 'គ្មានគណនីប្រើប្រាស់ គ្មានការប្រមូលទិន្នន័យ ដំណើរការក្នុងទូរសព្ទរបស់អ្នកទាំងស្រុង។',
      },
    },
    pills: {
      vinaya: 'វិន័យ: កំណត់ពេលវេលាឆាន់មុនថ្ងៃត្រង់',
      traditions: 'ប្រពៃណី: ស្រីលង្កា • មីយ៉ាន់ម៉ា (ប៉ាអ៊ុក) • ថៃ',
      scripts: 'អក្សរ: បម្លែងអក្សរបាលីច្រើនជាង ៧ ប្រព័ន្ធ',
      audio: 'សំឡេង: ជួងចានស្ពាន់ និងគងវត្តអារាម',
      privacy: 'ឯកជនភាព: រក្សាទុកក្នុងទូរសព្ទ ១០០%',
    },
    footer: {
      blessing: '“សព្វេ សត្តា ភវន្តុ សុខិតត្តា”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'គោលការណ៍ឯកជនភាព',
      terms: 'លក្ខខណ្ឌប្រើប្រាស់',
      github: 'GitHub',
      copyright: 'វិទ្យាស្ថានថេរវាទអន្តរជាតិ (IIT)',
      dropScreenshot: 'កន្លែងសម្រាប់រូបថតអេក្រង់',
    },
  },

  lo: {
    brandName: 'ປະຕິທິນ IIT',
    institute: 'ສະຖາບັນເຖຣະວາດສາກົນ (IIT)',
    badge: 'ເພື່ອນຄູ່ຄິດສຳລັບພຣະສົງ ແລະ ຊາວພຸດ',
    heroTitle: 'ເພື່ອນຮ່ວມທາງອັນສະຫງົບ ເພື່ອການປະຕິບັດທັມ ແລະ ພຣະວິນັຍ.',
    heroDesc:
      'ຄຳນວນເວລາອາຣຸນຂຶ້ນ ແລະ ຕອນທ່ຽງແທ້ (ມັດຊັນຫິກະ) ສຳລັບການສັນຕາມພຣະວິນັຍ, ຕິດຕາມວັນອຸໂປສົດຕາມປະເພນີເຖຣະວາດ, ສູດມົນພາສາບາລີຫຼາຍຕົວອັກສອນ ແລະ ໂມງນັ່ງສະມາທິ.',
    danaNote: 'ແຈກຢາຍເປັນທັມມະທານໂດຍບໍ່ຄິດມູນຄ່າ • ໃຊ້ງານອອບລາຍໄດ້ 100% • ບໍ່ມີໂຄສະນາ • ບໍ່ມີການເກັບຂໍ້ມູນ',
    insideAppTitle: 'ພາຍໃນແອັບພລິເຄຊັນ',
    insideAppSubtitle: 'ເຄື່ອງມືສຳຄັນສຳລັບພຣະວິນັຍ ແລະ ການຈະເລີນພາວະນາ.',
    screens: {
      calendar: {
        title: 'ປະຕິທິນຈັນທະຄະຕິ ແລະ ສຸຣິຍະຄະຕິ',
        subtitle: 'ວັນອຸໂປສົດ ແລະ ເວລາພຣະວິນັຍ',
        tag: 'ປະຕິທິນ',
        points: [
          'ເວລາຕອນທ່ຽງແທ້ (ມັດຊັນຫິກະ - ຂອບເຂດວິການ)',
          'ເວລາອາຣຸນຂຶ້ນ (ອາຣຸນຸກຄະມະນະ)',
          'ປະຕິທິນສີລັງກາ, ມຽນມາ ແລະ ໄທ',
        ],
      },
      meditation: {
        title: 'ຄວາມສະຫງົບແຫ່ງຈິດ',
        subtitle: 'ການທຳສະມາທິ ແລະ ສຽງລະຄັງພາວະນາ',
        tag: 'ພາວະນາ',
        points: [
          'ສຽງລະຄັງຂັນທອງເຫຼືອງທິເບດອັນກັງວານ',
          'ເວລານັບຖອຍຫຼັງກຽມຕົວ ແລະ ສຽງເຕືອນແຕ່ລະໄລຍະ',
          'ບັນທຶກເວລາປະຕິບັດສ່ວນຕົວ',
        ],
      },
      chants: {
        title: 'ບົດສູດມົນບາລີ',
        subtitle: 'ການຖອດອັກສອນຫຼາຍພາສາ',
        tag: 'ສູດມົນ',
        points: [
          'ອັກສອນລາວ, ໂຣມັນ, ສິງຫົນ ແລະ ມຽນມາ',
          'ພຣະປະຣິດ, ບົດສູດມົນ ແລະ ພຣະສູດ',
          'ລະບົບສຽງສູດປະກອບຈັງຫວະ',
        ],
      },
      books: {
        title: 'ພຣະໄຕຣປິດົກ ແລະ ຄຳພີ',
        subtitle: 'ພຣະປາຕິໂມກ ແລະ ພຣະວິນັຍ',
        tag: 'ອ່ານ',
        points: [
          'ພຣະພິກຂຸປາຕິໂມກຂະບາລີ ແລະ ສິກຂາບົດ',
          'ປຶ້ມສູດມົນ ແລະ ບົດທ່ອງຈຳ',
          'ອ່ານຄຳພີໄດ້ໂດຍບໍ່ຕ້ອງໃຊ້ອິນເຕີເນັດ',
        ],
      },
      study: {
        title: 'ການສຶກສາພຣະທັມ',
        subtitle: 'ຊ່ວງເວລາທ່ອງຈຳ ແລະ ພິຈາລະນາ',
        tag: 'ສຶກສາ',
        points: [
          'ຊ່ວງເວລາທ່ອງຈຳພຣະປາຕິໂມກ',
          'ບັນທຶກຄວາມຄືບໜ້າໃນການສຶກສາ',
          'ພຣະທັມມະບົດປະຈຳວັນພ້ອມຄຳອະທິບາຍ',
        ],
      },
    },
    highlights: {
      vinaya: {
        title: 'ພຣະວິນັຍ: ເວລາອາຣຸນ ແລະ ຕອນທ່ຽງແທ້',
        desc: 'ຄຳນວນເວລາອາຣຸນຂຶ້ນ (ອາຣຸນຸກຄະມະນະ) ແລະ ຕອນທ່ຽງແທ້ (ມັດຊັນຫິກະ) ສຳລັບການສັນໃນເຄື່ອງ.',
      },
      audio: {
        title: 'ລະຄັງທອງເຫຼືອງ ແລະ ຄ້ອງວັດປ່າ',
        desc: 'ສຽງລະຄັງຂັນທອງເຫຼືອງທິເບດ ຄ້ອງວັດປ່າສຳລັບການຈະເລີນພາວະນາ ແລະ ສຽງສູດມົນແບບອອບລាយ.',
      },
      scripts: {
        title: 'ຖອດລະຫັດບາລີ 7+ ຕົວອັກສອນ',
        desc: 'ຖອດອັກສອນບາລີແບບທັນທີ: ລາວ, ໂຣມັນ, ສິງຫົນ, ມຽນມາ, ໄທ ແລະ ຂະແມ ຜ່ານ Aksharamukha.',
      },
      location: {
        title: 'ພິກັດວັດປ່າ ແລະ GPS ທົ່ວໂລກ',
        desc: 'ພິກັດວັດ IIT, ນາອູຍານາ, ປ່າອອກ ແລະ ຄຳນວນຕຳແໜ່ງດວງຕາເວັນທົ່ວໂລກໂດຍບໍ່ຕ້ອງໃຊ້ອິນເຕີເນັດ.',
      },
      traditions: {
        title: 'ນິກາຍເຖຣະວາດອັນຫຼາກຫຼາຍ',
        desc: 'ຕິດຕາມວັນອຸໂປສົດຂອງຄະນະສົງສີລັງກາ, ມຽນມາ (ພາເອົາ) ແລະ ໄທ ຢ່າງຖືກຕ້ອງ.',
      },
      privacy: {
        title: 'ອອບລາຍ ແລະ ຄວາມເປັນສ່ວນຕົວ 100%',
        desc: 'ບໍ່ມີການສ້າງບັນຊີ ບໍ່ມີການເກັບຂໍ້ມູນ ສະຖິຕິ ປອດໄພ ແລະ ເຮັດວຽກພາຍໃນອຸປະກອນທັງໝົດ.',
      },
    },
    pills: {
      vinaya: 'ພຣະວິນັຍ: ຂອບເຂດເວລາຕອນທ່ຽງໃນການສັນ',
      traditions: 'ນິກາຍ: ສີລັງກາ • ມຽນມາ (ພາເອົາ) • ໄທ',
      scripts: 'ອັກສອນ: ຖອດລະຫັດບາລີໄດ້ຫຼາຍກວ່າ 7 ຕົວອັກສອນ',
      audio: 'ສຽງ: ລະຄັງທອງເຫຼືອງ ແລະ ຄ້ອງວັດປ່າ',
      privacy: 'ຄວາມເປັນສ່ວນຕົວ: ປອດໄພ ແລະ ເຮັດວຽກໃນເຄື່ອງ 100%',
    },
    footer: {
      blessing: '“ສັພເພ ສັຕຕາ ພະວັນຕຸ ສຸຂິຕັຕຕາ”',
      appStore: 'App Store',
      googlePlay: 'Google Play',
      privacyPolicy: 'ນະໂຍບາຍຄວາມເປັນສ່ວນຕົວ',
      terms: 'ເງື່ອນໄຂການໃຊ້ງານ',
      github: 'GitHub',
      copyright: 'ສະຖາບັນເຖຣະວາດສາກົນ (IIT)',
      dropScreenshot: 'ບ່ອນວ່າງສຳລັບພາບໜ້າຈໍ',
    },
  },
};
