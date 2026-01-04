import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, Brain, Trophy, ChevronRight, RefreshCw, 
  Volume2, Sparkles, Loader2, ArrowLeft, GraduationCap, 
  CheckCircle, XCircle, Search, Moon, Sun, 
  Printer, Flame, Share2, PlayCircle, Key, Settings, X
} from 'lucide-react';

// --- Configuration ---
// LEAVE THIS EMPTY for security when deploying. 
// The app will ask the user to enter a key via the UI.
const defaultApiKey = ""; 

// --- Helper: PCM to WAV Converter ---
function pcmToWav(base64PCM, sampleRate = 24000) {
  try {
    const binaryString = atob(base64PCM);
    const len = binaryString.length;
    const buffer = new ArrayBuffer(len);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < len; i++) {
      view[i] = binaryString.charCodeAt(i);
    }
    const pcmData = new Int16Array(buffer);
    const wavHeader = new ArrayBuffer(44);
    const headerView = new DataView(wavHeader);
    headerView.setUint8(0, 'R'.charCodeAt(0));
    headerView.setUint8(1, 'I'.charCodeAt(0));
    headerView.setUint8(2, 'F'.charCodeAt(0));
    headerView.setUint8(3, 'F'.charCodeAt(0));
    headerView.setUint32(4, 36 + pcmData.byteLength, true);
    headerView.setUint8(8, 'W'.charCodeAt(0));
    headerView.setUint8(9, 'A'.charCodeAt(0));
    headerView.setUint8(10, 'V'.charCodeAt(0));
    headerView.setUint8(11, 'E'.charCodeAt(0));
    headerView.setUint8(12, 'f'.charCodeAt(0));
    headerView.setUint8(13, 'm'.charCodeAt(0));
    headerView.setUint8(14, 't'.charCodeAt(0));
    headerView.setUint8(15, ' '.charCodeAt(0));
    headerView.setUint32(16, 16, true);
    headerView.setUint16(20, 1, true); 
    headerView.setUint16(22, 1, true); 
    headerView.setUint32(24, sampleRate, true);
    headerView.setUint32(28, sampleRate * 2, true);
    headerView.setUint16(32, 2, true); 
    headerView.setUint16(34, 16, true); 
    headerView.setUint8(36, 'd'.charCodeAt(0));
    headerView.setUint8(37, 'a'.charCodeAt(0));
    headerView.setUint8(38, 't'.charCodeAt(0));
    headerView.setUint8(39, 'a'.charCodeAt(0));
    headerView.setUint32(40, pcmData.byteLength, true);
    return new Blob([wavHeader, pcmData], { type: 'audio/wav' });
  } catch (e) {
    console.error("Audio conversion failed", e);
    return null;
  }
}

// --- Data Loader ---
// Format: [id, level, tags[], kanji, word, reading, meaning, sentence, cleanSentence, english, on, kun, options[], correctIdx, explanation]
const rawData = [
  // DAILY LIFE (N4)
  [101, 'N4', ['daily_life'], "起", "起きます", "おきます", "To wake up", "毎朝、６時に**起き**ます。", "毎朝、６時に起きます。", "I wake up at 6 AM every morning.", "KI", "o-kiru", ["おき", "あき", "ゆき", "せき"], 0, "Radical 走 (run). Commonly used for waking up from sleep."],
  [102, 'N4', ['daily_life'], "寝", "寝ます", "ねます", "To sleep", "もう**寝**る時間です。", "もう寝る時間です。", "It's time to go to sleep already.", "SHIN", "ne-ru", ["ね", "やす", "さ", "しん"], 0, "Intransitive verb. Contrast with 休む (to rest)."],
  [103, 'N4', ['daily_life'], "食", "食事", "しょくじ", "Meal", "家族と**食事**をします。", "家族と食事をします。", "I am having a meal with my family.", "SHOKU", "ta-beru", ["しょくじ", "たべごと", "しきじ", "しょくよ"], 0, "食 (Eat) + 事 (Thing/Matter) = Meal."],
  [104, 'N4', ['daily_life'], "焼", "焼きます", "やきます", "To bake/grill", "パンを**焼き**ます。", "パンを焼きます。", "I will bake bread.", "SHOU", "ya-ku", ["やき", "たき", "なき", "わき"], 0, "Used for cooking with fire (grilling, roasting, baking)."],
  [105, 'N4', ['daily_life'], "洗", "洗濯", "せんたく", "Laundry", "**洗濯**機が壊れた。", "洗濯機が壊れた。", "The washing machine broke.", "SEN", "ara-u", ["せんたく", "そうじ", "せんダク", "あらい"], 0, "洗 (Wash) + 濯 (Rinse/Wash). Essential household chore vocabulary."],
  [106, 'N4', ['daily_life'], "湯", "お湯", "おゆ", "Hot Water", "**お湯**を沸かします。", "お湯を沸かします。", "I boil hot water.", "TOU", "yu", ["おゆ", "おみず", "おちゃ", "おすい"], 0, "Specifically 'hot' water. Normal cold water is 水 (mizu)."],
  [107, 'N4', ['daily_life'], "味", "味", "あじ", "Taste", "この料理はいい**味**がする。", "この料理はいい味がする。", "This dish has a good taste.", "MI", "aji", ["あじ", "おと", "におい", "いろ"], 0, "Flavor or taste. Often used in 味見 (ajimi - tasting)."],
  [108, 'N4', ['daily_life'], "悪", "悪い", "わるい", "Bad", "気分が**悪い**です。", "気分が悪いです。", "I feel sick (my feeling is bad).", "AKU", "waru-i", ["わるい", "ひくい", "あかるい", "ふるい"], 0, "Opposite of 良い (Yoi/Ii). Can mean 'evil' or just 'poor quality'."],
  [109, 'N4', ['daily_life'], "暗", "暗い", "くらい", "Dark", "部屋が**暗い**です。", "部屋が暗いです。", "The room is dark.", "AN", "kura-i", ["くらい", "くろい", "あかるい", "あおい"], 0, "Opposite of 明るい (Akarui). Used for light or personality (gloomy)."],
  [110, 'N4', ['daily_life'], "寒", "寒い", "さむい", "Cold (weather)", "今日はとても**寒い**。", "今日はとても寒い。", "It's very cold today.", "KAN", "samu-i", ["さむい", "つめたい", "すずしい", "あつい"], 0, "Refers to atmospheric temperature. Objects are 冷たい (Tsumetai)."],
  [111, 'N4', ['daily_life'], "服", "服", "ふく", "Clothes", "新しい**服**を買う。", "新しい服を買う。", "I buy new clothes.", "FUKU", "-", ["ふく", "きもの", "ぬの", "したぎ"], 0, "General term for western clothing."],
  [112, 'N4', ['daily_life'], "理", "料理", "りょうり", "Cooking/Cuisine", "日本**料理**が好きです。", "日本料理が好きです。", "I like Japanese cuisine.", "RI", "-", ["りょうり", "ちょうり", "しょくり", "べんり"], 0, "料 (Materials) + 理 (Logic/Arrangement) = Cooking."],
  [113, 'N4', ['daily_life'], "犬", "子犬", "こいぬ", "Puppy", "**子犬**が生まれました。", "子犬が生まれました。", "Puppies were born.", "KEN", "inu", ["こいぬ", "しいぬ", "しょうけん", "こけん"], 0, "Child (Ko) + Dog (Inu)."],
  [114, 'N4', ['daily_life'], "茶", "茶碗", "ちゃわん", "Rice Bowl", "**茶碗**にご飯を盛る。", "茶碗にご飯を盛る。", "Serve rice in a bowl.", "CHA", "-", ["ちゃわん", "ちゃさら", "おわん", "ちゃどん"], 0, "Tea + Bowl (Wan). Originally for tea, now standard for rice bowls."],
  [115, 'N4', ['daily_life'], "肉", "牛肉", "ぎゅうにく", "Beef", "**牛肉**を食べます。", "牛肉を食べます。", "I eat beef.", "NIKU", "-", ["ぎゅうにく", "うしにく", "とりにく", "ぶたにく"], 0, "Cow (Gyuu) + Meat (Niku)."],

  // TRAVEL (N4)
  [201, 'N4', ['travel'], "特", "特急", "とっきゅう", "Limited Express", "**特急**に乗る。", "特急に乗る。", "I ride the limited express train.", "TOKU", "-", ["とっきゅう", "とっこう", "とうきゅう", "ときゅう"], 0, "Special + Hurry. Note the small 'tsu'. Faster than Express (Kyukou)."],
  [202, 'N4', ['travel'], "運", "運ぶ", "はこぶ", "To carry", "荷物を**運ぶ**。", "荷物を運ぶ。", "I carry the luggage.", "UN", "hako-bu", ["はこぶ", "うごく", "あそぶ", "えらぶ"], 0, "Transitive verb. Also used in 運転 (Driving)."],
  [203, 'N4', ['travel'], "図", "地図", "ちず", "Map", "**地図**を見る。", "地図を見る。", "I look at the map.", "ZU, TO", "-", ["ちず", "じず", "ちと", "ちが"], 0, "Ground (Chi) + Diagram (Zu). Essential for navigation."],
  [204, 'N4', ['travel'], "急", "急ぐ", "いそぐ", "To hurry", "学校へ**急ぐ**。", "学校へ急ぐ。", "I hurry to school.", "KYUU", "iso-gu", ["いそぐ", "およぐ", "さわぐ", "つなぐ"], 0, "Don't confuse with 泳ぐ (Swim). Radical implies heart/mind urgency."],
  [205, 'N4', ['travel'], "止", "止まる", "とまる", "To stop", "電車が**止まる**。", "電車が止まる。", "The train stops.", "SHI", "to-maru", ["とまる", "やめる", "しまる", "きまる"], 0, "Intransitive (it stops itself). Transitive is 止める (Tomeru)."],
  [206, 'N4', ['travel'], "京", "京都", "きょうと", "Kyoto", "**京都**へ行きたい。", "京都へ行きたい。", "I want to go to Kyoto.", "KYOU", "-", ["きょうと", "とうきょう", "けいと", "みやこ"], 0, "Capital (Kyou) + Metropolis (To). The ancient capital."],
  [207, 'N4', ['travel'], "乗", "乗る", "のる", "To ride", "バスに**乗る**。", "バスに乗る。", "I ride the bus.", "JOU", "no-ru", ["のる", "とる", "よる", "うる"], 0, "Particle 'ni' marks the vehicle you enter."],
  [208, 'N4', ['travel'], "海", "海外", "かいがい", "Overseas", "**海外**旅行をする。", "海外旅行をする。", "I travel overseas.", "KAI", "umi", ["かいがい", "うみそと", "かいそと", "うみがい"], 0, "Sea (Kai) + Outside (Gai)."],
  [209, 'N4', ['travel'], "県", "県", "けん", "Prefecture", "長野**県**。", "長野県。", "Nagano Prefecture.", "KEN", "-", ["けん", "ふ", "と", "し"], 0, "Administrative division in Japan (like a state)."],
  [210, 'N4', ['travel'], "都", "都会", "とかい", "City/Urban", "**都会**に住む。", "都会に住む。", "I live in the big city.", "TO", "miyako", ["とかい", "とあう", "みやこかい", "いちば"], 0, "Metropolis + Meeting/Association. Opposite of 田舎 (Inaka - countryside)."],
  [211, 'N4', ['travel'], "村", "村", "むら", "Village", "静かな**村**。", "静かな村。", "A quiet village.", "SON", "mura", ["むら", "まち", "しま", "くに"], 0, "Smaller than a town (Machi)."],
  [212, 'N4', ['travel'], "世", "世界", "せかい", "World", "**世界**中を旅する。", "世界中を旅する。", "Travel around the world.", "SE, SEI", "yo", ["せかい", "せわ", "よかい", "せいかい"], 0, "World/Generation (Se) + Boundary (Kai)."],
  [213, 'N4', ['travel'], "通", "通る", "とおる", "To pass through", "この道を**通る**。", "この道を通る。", "Pass through this street.", "TSUU", "too-ru", ["とおる", "かよう", "わたる", "まわる"], 0, "Intransitive verb. Used with particle 'wo' for the place passed."],
  [214, 'N4', ['travel'], "送", "送る", "おくる", "To send/escort", "友達を**送る**。", "友達を送る。", "I see off/escort a friend.", "SOU", "oku-ru", ["おくる", "めぐる", "つくる", "はしる"], 0, "Can mean sending mail or dropping someone off at the station."],
  [215, 'N4', ['travel'], "転", "運転", "うんてん", "Driving", "車を**運転**する。", "車を運転する。", "I drive a car.", "TEN", "koro-bu", ["うんてん", "じてん", "かいてん", "こうてん"], 0, "Carry (Un) + Turn (Ten)."],

  // BUSINESS / ABSTRACT (N4)
  [301, 'N4', ['abstract'], "意", "意見", "いけん", "Opinion", "**意見**を言う。", "意見を言う。", "I say my opinion.", "I", "-", ["いけん", "いみ", "いし", "きぶん"], 0, "Mind + See. Very common in business/meetings."],
  [302, 'N4', ['abstract'], "験", "経験", "けいけん", "Experience", "良い**経験**。", "良い経験。", "A good experience.", "KEN", "-", ["けいけん", "じっけん", "しけん", "けいかん"], 0, "Pass through + Test. Knowledge gained from doing."],
  [303, 'N4', ['abstract'], "約", "約束", "やくそく", "Promise", "**約束**を守る。", "約束を守る。", "I keep the promise.", "YAKU", "-", ["やくそく", "ようやく", "よやく", "ほうそく"], 0, "Promise + Bundle. Crucial for appointments."],
  [304, 'N4', ['abstract'], "産", "産業", "さんぎょう", "Industry", "自動車**産業**。", "自動車産業。", "The automobile industry.", "SAN", "u-mu", ["さんぎょう", "じゅぎょう", "そつぎょう", "ざんぎょう"], 0, "Produce + Business. Important for economic topics."],
  [305, 'N4', ['abstract'], "決", "決める", "きめる", "To decide", "予定を**決める**。", "予定を決める。", "I decide the schedule.", "KETSU", "ki-meru", ["きめる", "やめる", "しめる", "そめる"], 0, "Transitive verb. Intransitive is 決まる (Kimaru)."],
  [306, 'N4', ['abstract'], "会", "会議", "かいぎ", "Meeting", "**会議**に出る。", "会議に出る。", "I attend the meeting.", "KAI", "a-u", ["かいぎ", "かいわ", "かいしゃ", "かいじょう"], 0, "Meeting + Deliberation."],
  [307, 'N4', ['abstract'], "真", "写真", "しゃしん", "Photo", "**写真**を撮る。", "写真を撮る。", "I take a photo.", "SHIN", "ma", ["しゃしん", "まこと", "しんじつ", "ずが"], 0, "Copy (Sha) + Truth (Shin)."],
  [308, 'N4', ['abstract'], "説", "説明", "せつめい", "Explanation", "理由を**説明**する。", "理由を説明する。", "I explain the reason.", "SETSU", "to-ku", ["せつめい", "せつび", "しょうめい", "はつめい"], 0, "Theory/Explain + Bright/Clear."],
  [309, 'N4', ['abstract'], "研", "研究", "けんきゅう", "Research", "科学を**研究**する。", "科学を研究する。", "I research science.", "KEN", "to-gu", ["けんきゅう", "けんしゅう", "じっけん", "はっけん"], 0, "Sharpen + Investigate. Academic context."],
  [310, 'N4', ['abstract'], "究", "研究", "けんきゅう", "Research", "大学で**研究**する。", "大学で研究する。", "I do research at university.", "KYUU", "kiwa-meru", ["けんきゅう", "きゅうきゅう", "たんきゅう", "ようきゅう"], 0, "Second character of Kenkyuu."],
  [311, 'N4', ['abstract'], "質", "質問", "しつもん", "Question", "先生に**質問**する。", "先生に質問する。", "I ask the teacher a question.", "SHITSU", "-", ["しつもん", "もんだい", "しつれい", "ぶっしつ"], 0, "Substance + Ask."],
  [312, 'N4', ['abstract'], "問", "問題", "もんだい", "Problem", "難しい**問題**。", "難しい問題。", "A difficult problem.", "MON", "to-u", ["もんだい", "しつもん", "かんたん", "しゅくだい"], 0, "Gate + Mouth (Asking at the gate)."],
  [313, 'N4', ['abstract'], "貸", "貸す", "かす", "To lend", "金を**貸す**。", "金を貸す。", "I lend money.", "TAI", "ka-su", ["かす", "かりる", "かえす", "かう"], 0, "Opposite of 借りる (Kariru - Borrow)."],
  [314, 'N4', ['abstract'], "借", "借りる", "かりる", "To borrow", "本を**借りる**。", "本を借りる。", "I borrow a book.", "SHAKU", "ka-riru", ["かりる", "かす", "かえす", "あげる"], 0, "Person + Ancient."],
  [315, 'N4', ['abstract'], "銀", "銀行", "ぎんこう", "Bank", "**銀行**へ行く。", "銀行へ行く。", "I go to the bank.", "GIN", "-", ["ぎんこう", "ぎんぎょう", "きんこう", "はっこう"], 0, "Silver + Go/Institution."],

  // N5 REVIEW (N5)
  [501, 'N5', ['n5_refresher'], "校", "学校", "がっこう", "School", "**学校**へ行く。", "学校へ行く。", "I go to school.", "KOU", "-", ["がっこう", "がこう", "かっこう", "がくこう"], 0, "Tree + Mingle."],
  [502, 'N5', ['n5_refresher'], "新", "新しい", "あたらしい", "New", "**新しい**本。", "新しい本。", "A new book.", "SHIN", "atara-shii", ["あたらしい", "めずらしい", "すばらしい", "ふるい"], 0, "Axe + Stand + Tree. I-Adjective."],
  [503, 'N5', ['n5_refresher'], "電", "電気", "でんき", "Electricity", "**電気**をつける。", "電気をつける。", "Turn on the light/electricity.", "DEN", "-", ["でんき", "てんき", "げんき", "いんき"], 0, "Rain + Lightning."],
  [504, 'N5', ['n5_refresher'], "古", "古い", "ふるい", "Old", "**古い**時計。", "古い時計。", "An old clock.", "KO", "furu-i", ["ふるい", "ながい", "ひろい", "あおい"], 0, "Ten + Mouth (Oral tradition). Opposite of New."],
  [505, 'N5', ['n5_refresher'], "安", "安い", "やすい", "Cheap", "**安い**店。", "安い店。", "A cheap shop.", "AN", "yasu-i", ["やすい", "たかい", "ひくい", "うまい"], 0, "Roof + Woman (Peace/Cheap)."],
  [506, 'N5', ['n5_refresher'], "高", "高い", "たかい", "High/Expensive", "背が**高い**。", "背が高い。", "Tall (height).", "KOU", "taka-i", ["たかい", "ながい", "おおきい", "ふとい"], 0, "Tall building shape."],
  [507, 'N5', ['n5_refresher'], "小", "小さい", "ちいさい", "Small", "**小さい**猫。", "小さい猫。", "A small cat.", "SHOU", "chii-sai", ["ちいさい", "すくない", "みじかい", "ほそい"], 0, "Three strokes."],
  [508, 'N5', ['n5_refresher'], "大", "大きい", "おおきい", "Big", "**大きい**手。", "大きい手。", "A big hand.", "DAI", "oo-kii", ["おおきい", "おおい", "ふとい", "ひろい"], 0, "Person with arms spread."],
  [509, 'N5', ['n5_refresher'], "少", "少し", "すこし", "A little", "**少し**食べる。", "少し食べる。", "I eat a little.", "SHOU", "suko-shi", ["すこし", "すくない", "ちいさい", "たくさん"], 0, "Small + extra stroke."],
  [510, 'N5', ['n5_refresher'], "多", "多い", "おおい", "Many", "人が**多い**。", "人が多い。", "There are many people.", "TA", "oo-i", ["おおい", "おおきい", "あつい", "おもい"], 0, "Two moons stacked."],
  [511, 'N5', ['n5_refresher'], "白", "白い", "しろい", "White", "**白い**雪。", "白い雪。", "White snow.", "HAKU", "shiro-i", ["しろい", "あかい", "あおい", "くろい"], 0, "Color of light."],
  [512, 'N5', ['n5_refresher'], "黒", "黒い", "くろい", "Black", "**黒い**髪。", "黒い髪。", "Black hair.", "KOKU", "kuro-i", ["くろい", "くらい", "きいろい", "しろい"], 0, "Fire at bottom (soot)."],
  [513, 'N5', ['n5_refresher'], "赤", "赤い", "あかい", "Red", "**赤い**りんご。", "赤いりんご。", "Red apple.", "SEKI", "aka-i", ["あかい", "あかるい", "あまい", "あおい"], 0, "Big + Fire."],
  [514, 'N5', ['n5_refresher'], "青", "青い", "あおい", "Blue", "**青い**海。", "青い海。", "Blue sea.", "SEI", "ao-i", ["あおい", "あかい", "しろい", "みどり"], 0, "Color of nature/youth."],
  [515, 'N5', ['n5_refresher'], "手", "手紙", "てがみ", "Letter", "**手紙**を書く。", "手紙を書く。", "I write a letter.", "SHU", "te", ["てがみ", "てかみ", "しゅし", "ていし"], 0, "Hand + Paper."],
];

// Robust mapping with safety checks
const kanjiDatabase = rawData.map(d => ({
  id: d[0], 
  level: d[1] || 'N5', 
  tags: Array.isArray(d[2]) ? d[2] : [], 
  kanji: d[3] || '', 
  word: d[4] || '', 
  reading: d[5] || '', 
  meaning: d[6] || '', 
  sentence: d[7] || '', 
  cleanSentence: d[8] || d[7]?.replace(/\*\*/g, '') || '', 
  english: d[9] || '', 
  onyomi: d[10] || '-', 
  kunyomi: d[11] || '-', 
  options: Array.isArray(d[12]) ? d[12] : [], 
  correctIndex: typeof d[13] === 'number' ? d[13] : 0, 
  explanation: d[14] || ''
}));

const categories = [
  { id: 'daily_life', title: 'Daily Life', icon: '🏠', color: 'indigo', desc: 'Living, eating, and household.' },
  { id: 'travel', title: 'Travel & City', icon: '🚄', color: 'emerald', desc: 'Trains, maps, and locations.' },
  { id: 'abstract', title: 'Business & Ideas', icon: '💼', color: 'amber', desc: 'Thinking, planning, and work.' },
  { id: 'n5_refresher', title: 'N5 Review', icon: '🌱', color: 'teal', desc: 'Essential foundations.' }
];

// --- Components ---

const ApiKeyModal = ({ isOpen, onClose, onSave }) => {
  const [inputKey, setInputKey] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Key className="w-5 h-5" /> Enter Gemini API Key
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          To use the AI Tutor and Pronunciation features, you need a Google Gemini API Key. 
          Your key is saved locally in your browser.
        </p>
        <input 
          type="password" 
          value={inputKey}
          onChange={(e) => setInputKey(e.target.value)}
          placeholder="Paste your API key here..."
          className="w-full p-3 border rounded-xl mb-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
        />
        <div className="flex gap-2">
          <button 
            onClick={() => onSave(inputKey)}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold"
          >
            Save Key
          </button>
          <button 
            onClick={onClose}
            className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-bold"
          >
            Cancel
          </button>
        </div>
        <div className="mt-4 text-xs text-center text-slate-400">
          <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline hover:text-indigo-500">
            Get a free API key from Google
          </a>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ view, setView, theme, toggleTheme, xp, onOpenSettings }) => (
  <nav className={`sticky top-0 z-50 px-4 py-3 shadow-sm border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
    <div className="max-w-6xl mx-auto flex justify-between items-center">
      <button onClick={() => setView('menu')} className="flex items-center gap-2 group">
        <GraduationCap className={`w-8 h-8 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`} />
        <span className={`font-bold text-xl tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
          N4<span className="text-indigo-500">Master</span>
        </span>
      </button>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 border border-yellow-200">
          <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          <span className="font-bold text-yellow-800 text-sm">{typeof xp === 'number' ? xp : 0} XP</span>
        </div>
        
        <button 
          onClick={() => setView('dictionary')}
          className={`p-2 rounded-lg transition ${view === 'dictionary' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'}`}
          title="Dictionary"
        >
          <BookOpen className="w-5 h-5" />
        </button>

        <button 
          onClick={onOpenSettings}
          className={`p-2 rounded-lg transition text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800`}
          title="API Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button 
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition ${theme === 'dark' ? 'bg-slate-800 text-yellow-400' : 'bg-slate-100 text-slate-600'}`}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  </nav>
);

const SenseiTutor = ({ item, theme, apiKey }) => {
  const [aiContent, setAiContent] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAdvice = async () => {
    if (!apiKey) {
      alert("Please enter your Gemini API Key in Settings to use the AI Tutor.");
      return;
    }
    if (aiContent || loading || !item) return;
    setLoading(true);
    try {
      const prompt = `
        Act as a Japanese Sensei helping a student with the JLPT N4 exam.
        Target Kanji: ${item.kanji} (Reading: ${item.reading}, Meaning: ${item.meaning}).
        Context Sentence: ${item.cleanSentence}
        
        Provide:
        1. 🎨 **Visual Mnemonic**: A short sentence to visualize this Kanji's shape.
        2. 🧠 **Grammar Breakdown**: Explain the sentence structure simply for an N4 student.
        3. 🇯🇵 **Real Japan & Exam**: Is this common in JLPT or daily conversation? Any nuances?
        
        Format with simple Markdown. Be encouraging!
      `;
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      setAiContent(typeof text === 'string' ? text : "Sensei is taking a break.");
    } catch (e) {
      setAiContent("Sensei cannot connect. Please check your API Key.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <div className={`mt-4 border rounded-xl p-4 transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-indigo-50 border-indigo-100'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-indigo-300' : 'text-indigo-900'}`}>
          <Sparkles className="w-4 h-4 text-indigo-500" />
          Sensei's Corner
        </h3>
        {!aiContent && (
          <button 
            onClick={fetchAdvice}
            className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition flex items-center gap-1"
          >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Ask Sensei"}
          </button>
        )}
      </div>

      {loading && <div className="text-center py-4 text-indigo-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>}
      
      {aiContent && (
        <div className={`prose prose-sm max-w-none ${theme === 'dark' ? 'prose-invert text-slate-300' : 'text-slate-700'}`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{aiContent}</div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
export default function N4KanjiApp() {
  const [theme, setTheme] = useState('light');
  const [view, setView] = useState('menu'); 
  const [activeCategory, setActiveCategory] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [xp, setXp] = useState(1250); 
  const [quizState, setQuizState] = useState('question');
  const [selectedOption, setSelectedOption] = useState(null); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('ALL');
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // API Key State
  const [userApiKey, setUserApiKey] = useState(defaultApiKey);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load API Key from storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem('gemini_api_key');
    if (storedKey) setUserApiKey(storedKey);
  }, []);

  const saveApiKey = (key) => {
    setUserApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    setIsSettingsOpen(false);
  };

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const playAudio = async (text) => {
    if (!userApiKey) {
      setIsSettingsOpen(true);
      return;
    }
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${userApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Say in Japanese: " + text }] }], 
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
          }
        })
      });
      const data = await response.json();
      const audioData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        const audioBlob = pcmToWav(audioData);
        if (audioBlob) {
          const url = URL.createObjectURL(audioBlob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => setIsPlaying(false);
          audio.play();
        } else {
            setIsPlaying(false);
        }
      } else {
          setIsPlaying(false);
      }
    } catch (e) {
      console.error(e);
      setIsPlaying(false);
    }
  };

  // Start Randomized Quiz
  const startQuiz = (catId) => {
    const pool = kanjiDatabase.filter(k => catId === 'all' || k.tags.includes(catId));
    
    if (pool.length === 0) {
        alert("No questions available for this category yet!");
        return;
    }

    // Pick 10 random questions
    const selectedQuestions = [...pool].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    // Shuffle options for each question so correct answer isn't always index 0
    const randomizedQuizItems = selectedQuestions.map(item => {
        // Create pairs of [optionText, isCorrect]
        const optionsWithStatus = item.options.map((opt, i) => ({
            text: opt,
            isCorrect: i === item.correctIndex
        }));
        
        // Shuffle the pairs
        const shuffledOptions = optionsWithStatus.sort(() => Math.random() - 0.5);
        
        // Find the new index of the correct answer
        const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);
        
        // Return new item object with shuffled options and updated correctIndex
        return {
            ...item,
            options: shuffledOptions.map(opt => opt.text),
            correctIndex: newCorrectIndex
        };
    });

    setQuizItems(randomizedQuizItems);
    setCurrentQuizIndex(0);
    setScore(0);
    setQuizState('question');
    setSelectedOption(null);
    setActiveCategory(categories.find(c => c.id === catId) || { title: 'Mixed Review' });
    setView('quiz');
  };

  const handleAnswer = (index) => {
    if (quizState === 'feedback') return;
    setSelectedOption(index);
    setQuizState('feedback');
    if (quizItems[currentQuizIndex] && index === quizItems[currentQuizIndex].correctIndex) {
      setScore(s => s + 1);
      setXp(x => x + 10);
    }
  };

  const nextQuestion = () => {
    if (currentQuizIndex < quizItems.length - 1) {
      setCurrentQuizIndex(c => c + 1);
      setQuizState('question');
      setSelectedOption(null);
    } else {
      setView('result');
    }
  };

  // Printing functions
  const handlePrint = () => {
    window.print();
  };

  const filteredKanji = useMemo(() => {
    return kanjiDatabase.filter(k => {
      const matchesSearch = k.word.includes(searchQuery) || k.meaning.toLowerCase().includes(searchQuery.toLowerCase()) || k.kanji.includes(searchQuery);
      const matchesLevel = filterLevel === 'ALL' || k.level === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [searchQuery, filterLevel]);

  // --- Render Views ---

  // 1. MENU
  if (view === 'menu') {
    return (
      <div className={`min-h-screen transition-colors duration-300 font-sans ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <Navbar view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} xp={xp} onOpenSettings={() => setIsSettingsOpen(true)} />
        <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={saveApiKey} />
        
        <main className="max-w-6xl mx-auto p-6 md:p-12">
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-black mb-4 bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Road to N4
            </h1>
            <p className={`text-lg max-w-2xl mx-auto ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Master 300+ Kanji with native audio, AI-powered explanations, and adaptive quizzes.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => startQuiz(cat.id)}
                className={`group cursor-pointer rounded-2xl p-6 border transition-all hover:-translate-y-1 hover:shadow-xl relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-white border-slate-200 hover:border-indigo-400 shadow-md'}`}
              >
                <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                   <span className="text-9xl grayscale opacity-10">{cat.icon}</span>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 bg-${cat.color}-100`}>
                  {cat.icon}
                </div>
                <h2 className="text-xl font-bold mb-2">{cat.title}</h2>
                <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{cat.desc}</p>
                <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm">
                  Start Quiz <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button 
              onClick={() => setView('dictionary')}
              className={`flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold transition shadow-lg ${theme === 'dark' ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white hover:bg-slate-50 text-indigo-700 border border-slate-200'}`}
            >
              <BookOpen className="w-5 h-5" /> Open Dictionary
            </button>
          </div>
        </main>
      </div>
    );
  }

  // 2. DICTIONARY
  if (view === 'dictionary') {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <Navbar view={view} setView={setView} theme={theme} toggleTheme={toggleTheme} xp={xp} onOpenSettings={() => setIsSettingsOpen(true)} />
        <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={saveApiKey} />
        
        <main className="max-w-6xl mx-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-indigo-500" /> Kanji Dictionary
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search English or Kanji..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 focus:outline-none ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'}`}
                />
              </div>
              <select 
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className={`px-4 py-2 rounded-lg border font-bold ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-300 text-slate-900'}`}
              >
                <option value="ALL">All Levels</option>
                <option value="N4">N4</option>
                <option value="N5">N5</option>
              </select>
              <button 
                 onClick={handlePrint}
                 className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 justify-center"
              >
                <Printer className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-3 print:gap-4">
            {filteredKanji.map(item => (
              <div key={item.id} className={`p-4 rounded-xl border transition break-inside-avoid ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded bg-indigo-100 text-indigo-700 print:border print:border-slate-300`}>{item.level}</span>
                  <button 
                    onClick={() => playAudio(item.cleanSentence || item.word)} 
                    className="text-indigo-400 hover:text-indigo-600 print:hidden p-1 rounded hover:bg-indigo-50"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <div className="text-5xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-br from-indigo-500 to-purple-600 print:text-black">
                    {item.kanji}
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white print:text-black">{item.word}</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{item.reading}</div>
                </div>
                <div className={`text-sm pt-3 border-t ${theme === 'dark' ? 'border-slate-700 text-slate-300' : 'border-slate-100 text-slate-700'}`}>
                  <p className="font-bold mb-1">Meaning: <span className="font-normal">{item.meaning}</span></p>
                  <p className="text-xs opacity-75">On: {item.onyomi}</p>
                  <p className="text-xs opacity-75">Kun: {item.kunyomi}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredKanji.length === 0 && (
             <div className="text-center py-12 opacity-50">No Kanji found matching your search.</div>
          )}
        </main>

        <style>{`
          @media print {
            nav, button { display: none !important; }
            body { background: white; color: black; }
            main { padding: 0; margin: 0; max-width: none; }
            .print\\:grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
            .break-inside-avoid { break-inside: avoid; }
          }
        `}</style>
      </div>
    );
  }

  // 3. QUIZ
  if (view === 'quiz') {
    const currentItem = quizItems[currentQuizIndex];
    
    // Safety check: Show loading if quiz items aren't ready
    if (!currentItem) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'}`}>
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const progress = ((currentQuizIndex + 1) / quizItems.length) * 100;

    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        <ApiKeyModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} onSave={saveApiKey} />
        <div className="max-w-2xl mx-auto p-6 flex flex-col min-h-screen">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-200/20 rounded-full transition">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 mx-4">
              <div className="h-2 rounded-full bg-slate-200/20 overflow-hidden">
                <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
            <div className="font-bold text-indigo-500">{currentQuizIndex + 1}/{quizItems.length}</div>
          </div>

          {/* Card */}
          <div className={`flex-1 rounded-3xl shadow-2xl overflow-hidden flex flex-col border ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="p-8 text-center border-b border-slate-200/10 relative">
               <button 
                  onClick={() => playAudio(currentItem.cleanSentence)}
                  className="absolute top-6 right-6 p-2 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 transition"
                  title="Play Sentence"
                >
                  {isPlaying ? <Loader2 className="w-6 h-6 animate-spin" /> : <Volume2 className="w-6 h-6" />}
              </button>
              
              <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                Select the correct reading
              </h2>
              <p className="text-2xl font-bold leading-relaxed text-slate-900 dark:text-white mb-4">
                {currentItem.sentence.split('**').map((part, i) => 
                  i % 2 === 1 ? <span key={i} className="text-indigo-500 border-b-2 border-indigo-500/30 pb-1">{part}</span> : part
                )}
              </p>
              
              {/* Added Meaning for Context Flow */}
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium italic">
                "{currentItem.english}"
              </p>
            </div>

            <div className="p-6 grid gap-3 flex-1 bg-slate-100/50 dark:bg-slate-900/50">
              {currentItem.options.map((opt, i) => {
                let status = 'default';
                
                // Styling logic for feedback state
                if (quizState === 'feedback') {
                  if (i === currentItem.correctIndex) status = 'correct';
                  else if (i === selectedOption) status = 'wrong'; 
                  else status = 'dim';
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={quizState === 'feedback'}
                    className={`
                      w-full p-4 rounded-xl text-lg font-bold flex justify-between items-center transition-all duration-200
                      ${status === 'default' ? (theme === 'dark' ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-white hover:bg-white text-slate-800 border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300') : ''}
                      ${status === 'correct' ? 'bg-green-600 text-white shadow-lg ring-2 ring-green-400 border-green-600' : ''}
                      ${status === 'wrong' ? 'bg-red-500 text-white shadow-lg ring-2 ring-red-400 border-red-500' : ''}
                      ${status === 'dim' ? 'opacity-40 grayscale border-transparent' : ''}
                    `}
                  >
                    {opt}
                    {status === 'correct' && <CheckCircle className="w-6 h-6" />}
                    {status === 'wrong' && <XCircle className="w-6 h-6" />}
                  </button>
                );
              })}
            </div>

            {/* Explanation / Feedback Area */}
            {quizState === 'feedback' && (
              <div className={`p-6 border-t animate-in slide-in-from-bottom-4 ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-indigo-50 border-indigo-100'}`}>
                
                {/* Result Indicator */}
                <div className={`mb-4 font-black uppercase tracking-widest ${selectedOption === currentItem.correctIndex ? 'text-green-500' : 'text-red-500'}`}>
                   {selectedOption === currentItem.correctIndex ? "Correct!" : "Incorrect"}
                </div>

                <div className="flex gap-4 mb-4">
                  <div className={`w-14 h-14 flex items-center justify-center rounded-xl text-3xl font-black shrink-0 ${theme === 'dark' ? 'bg-slate-800 text-white' : 'bg-white text-indigo-600 shadow-sm border border-indigo-100'}`}>
                    {currentItem.kanji}
                  </div>
                  <div>
                    <div className="font-bold opacity-75 text-xs uppercase mb-1">Meaning & Rationale</div>
                    <div className="font-bold text-lg leading-snug mb-1">{currentItem.meaning}</div>
                    <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>{currentItem.explanation}</p>
                  </div>
                </div>
                
                {/* Embedded Sensei for Context */}
                <SenseiTutor item={currentItem} theme={theme} apiKey={userApiKey} />

                <button 
                  onClick={nextQuestion}
                  className="w-full mt-4 py-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition flex items-center justify-center gap-2"
                >
                  {currentQuizIndex === quizItems.length - 1 ? "Finish Quiz" : "Next Question"} <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. RESULT (Certificate Style)
  if (view === 'result') {
    const percentage = Math.round((score / quizItems.length) * 100);
    return (
      <div className={`min-h-screen flex items-center justify-center p-6 ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-800'}`}>
        
        {/* Printable Certificate */}
        <div id="result-card" className={`max-w-md w-full rounded-3xl shadow-2xl p-8 text-center border relative overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
          {/* Confetti Background */}
          {percentage >= 80 && (
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-yellow-400 via-red-500 to-indigo-500"></div>
          )}

          <div className="relative z-10">
            <div className="mb-6 flex justify-center">
              {percentage >= 80 ? (
                <div className="bg-yellow-100 p-6 rounded-full animate-bounce">
                  <Trophy className="w-20 h-20 text-yellow-600" />
                </div>
              ) : (
                <div className="bg-indigo-100 p-6 rounded-full">
                  <BookOpen className="w-20 h-20 text-indigo-600" />
                </div>
              )}
            </div>
            
            <h2 className="text-3xl font-black mb-2">{percentage >= 80 ? "Certificate of Mastery" : "Training Complete"}</h2>
            <p className="opacity-60 mb-8 font-medium uppercase tracking-wider">{activeCategory?.title || "N4"} Quiz</p>
            
            <div className="flex justify-center items-end gap-2 mb-8 bg-slate-500/5 p-4 rounded-2xl border border-slate-500/10">
              <span className="text-6xl font-black text-indigo-500">{score}</span>
              <span className="text-xl font-bold opacity-50 mb-2">/ {quizItems.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 print:hidden">
               <div className="bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
                 <div className="text-xs opacity-60 uppercase font-bold">XP Earned</div>
                 <div className="text-xl font-bold text-orange-500">+{score * 10} XP</div>
               </div>
               <div className="bg-slate-500/5 p-3 rounded-xl border border-slate-500/10">
                 <div className="text-xs opacity-60 uppercase font-bold">Accuracy</div>
                 <div className={`text-xl font-bold ${percentage >= 80 ? 'text-green-500' : 'text-blue-500'}`}>{percentage}%</div>
               </div>
            </div>

            <div className="space-y-3 print:hidden">
              <button 
                onClick={() => startQuiz(activeCategory?.id || 'daily_life')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
              >
                <RefreshCw className="w-5 h-5" /> Retry Quiz
              </button>
              <button 
                onClick={handlePrint}
                className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <Share2 className="w-5 h-5" /> Save Result as PDF
              </button>
              <button 
                onClick={() => setView('menu')}
                className="w-full py-3 opacity-60 hover:opacity-100 transition font-medium"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Print Styles specific for Certificate */}
        <style>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #result-card, #result-card * {
              visibility: visible;
            }
            #result-card {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 20px;
              border: 2px solid #333;
              box-shadow: none !important;
              transform: none !important; /* Reset centering */
            }
            /* Hide UI elements explicitly */
            nav, button, .print\\:hidden { 
              display: none !important; 
            }
          }
        `}</style>
      </div>
    );
  }
  
  return null;
}