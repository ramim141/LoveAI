import React, { useState, useRef } from 'react';
import { 
  Heart, Sparkles, Copy, RefreshCw, Send, Star, User, Zap, 
  Gift, BrainCircuit, ChevronRight, CheckCircle2, Calendar, 
  Music, PenTool, Code, TrendingUp, Landmark, Info, Mail 
} from 'lucide-react';

const App = () => {
  const [name, setName] = useState('');
  const [senderType, setSenderType] = useState('boyfriend'); 
  const [angerLevel, setAngerLevel] = useState('moderate');
  const [letterStyle, setLetterStyle] = useState('literary');
  const [generatedText, setGeneratedText] = useState('');
  const [shortRhyme, setShortRhyme] = useState('');
  const [giftIdea, setGiftIdea] = useState('');
  const [fightDescription, setFightDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);
  
  const resultRef = useRef(null);
  const modelsCacheRef = useRef([]);
  const modelsCacheAtRef = useRef(0);

  // API Key handling per environment instructions
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
  const preferredModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
  const candidateModels = [
    preferredModel,
    'gemini-1.5-flash',
    'gemini-1.5-flash-8b'
  ];
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const MODELS_CACHE_TTL_MS = 10 * 60 * 1000;

  const styles = [
    { id: 'literary', label: 'সাহিত্যিক', icon: <PenTool size={16} /> },
    { id: 'poetic', label: 'কাব্যিক', icon: <Heart size={16} /> },
    { id: 'programming', label: 'প্রোগ্রামিং', icon: <Code size={16} /> },
    { id: 'economic', label: 'অর্থনৈতিক', icon: <TrendingUp size={16} /> },
    { id: 'historical', label: 'ঐতিহাসিক', icon: <Landmark size={16} /> },
    { id: 'musical', label: 'গানের মতো', icon: <Music size={16} /> },
    { id: 'scientific', label: 'বৈজ্ঞানিক', icon: <Zap size={16} /> },
  ];

  const angerLevels = [
    { id: 'cute', label: 'মিষ্টি অভিমান', emoji: '🥰' },
    { id: 'mild', label: 'একটু রাগ', emoji: '🤏' },
    { id: 'moderate', label: 'মাঝারি', emoji: '😐' },
    { id: 'silent', label: 'নিঝুম মৌনতা', emoji: '🤐' },
    { id: 'cold', label: 'বরফ শীতল', emoji: '❄️' },
    { id: 'extreme', label: 'ভয়াবহ!', emoji: '🔥' },
    { id: 'explosive', label: 'পারমাণবিক!', emoji: '☢️' }
  ];

  const createLocalFallback = () => {
    const today = new Date().toLocaleDateString('bn-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const receiverWord = senderType === 'boyfriend' ? 'রাজকন্যা' : 'রাজকুমার';
    const moodLine = {
      cute: 'আজকের অভিমানটা এতই মিষ্টি যে আমি রাগ না, আদর করতেই চাই।',
      mild: 'তোমার একটু রাগ মানেই আমার দিনটা অর্ধেক অন্ধকার।',
      moderate: 'আমার ভুলগুলো আমি বুঝেছি, এবার শুধু তোমার হাসিটা চাই।',
      silent: 'তোমার চুপ থাকা আমার জন্য সবচেয়ে কঠিন শাস্তি।',
      cold: 'তোমার এই ঠান্ডা দূরত্ব গলাতে আমি মন দিয়ে চেষ্টা করছি।',
      extreme: 'রাগ যত বড়ই হোক, তোমাকে হারানোর ভয়টা তার থেকেও বড়।',
      explosive: 'আজ পরিস্থিতি বিস্ফোরক, কিন্তু আমার ভালোবাসা তার থেকেও শক্তিশালী।'
    };

    const letter = `*তারিখ:* ${today}\n*বিষয়:* অভিমান ভাঙানোর জরুরি আবেদন 💌\n\nপ্রিয় ${name},\n\nআমার প্রিয় ${receiverWord},\n${moodLine[angerLevel] || moodLine.moderate}\n\nতোমার ওপর রাগ করা আমার কাজ না, তোমাকে ভালো রাখা আমার দায়িত্ব। আমি যদি কোথাও তোমাকে কষ্ট দিয়ে থাকি, সত্যি করে *দুঃখিত*। আজকে থেকে আমি কথা কম, যত্ন বেশি দেখাবো।\n\nতুমি আমার জীবনের সবচেয়ে সুন্দর অভ্যাস। তোমার হাসি ফেরানো পর্যন্ত আমি চেষ্টা চালিয়ে যাবো—চা নিয়ে, গল্প নিয়ে, আর অনেক *ভালোবাসা* নিয়ে।\n\nএকটা সুযোগ দাও, নতুন করে শুরু করি? 🌸`; 

    const rhyme = `রাগ কোরো না, মনটা দাও, 💖\nভুল যে হলে, মাফটা চাও। 🙏\nতোমার হাসি চাই যে খুব, 😊\nফিরে এসো, প্রিয়তম রূপ। 🌼`;

    const gift = 'একটা হাতে লেখা ছোট নোট, সাথে প্রিয় স্ন্যাক্স আর একটি গোলাপ দিন। 🌹';

    return { letter, rhyme, gift };
  };

  const resolveModelsToTry = async () => {
    const baseModels = [...new Set(candidateModels.filter(Boolean))];
    const now = Date.now();

    if (modelsCacheRef.current.length > 0 && now - modelsCacheAtRef.current < MODELS_CACHE_TTL_MS) {
      const prioritized = baseModels.filter((model) => modelsCacheRef.current.includes(model));
      const remaining = modelsCacheRef.current.filter((model) => !prioritized.includes(model));
      return [...prioritized, ...remaining];
    }

    try {
      const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!listResponse.ok) return baseModels;

      const listData = await listResponse.json();
      const available = (listData.models || [])
        .filter((modelInfo) => Array.isArray(modelInfo.supportedGenerationMethods) && modelInfo.supportedGenerationMethods.includes('generateContent'))
        .map((modelInfo) => (modelInfo.name || '').replace(/^models\//, ''))
        .filter(Boolean);

      if (available.length === 0) return baseModels;

      modelsCacheRef.current = available;
      modelsCacheAtRef.current = now;

      const prioritized = baseModels.filter((model) => available.includes(model));
      const remaining = available.filter((model) => !prioritized.includes(model));
      return [...prioritized, ...remaining];
    } catch {
      return baseModels;
    }
  };

  const callGemini = async (prompt, retries = 1, delay = 1500) => {
    if (!apiKey) {
      throw new Error('VITE_GEMINI_API_KEY is missing.');
    }

    let lastError = null;

    try {
      const modelsToTry = await resolveModelsToTry();

      for (const model of modelsToTry) {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return text;
          lastError = new Error('Empty response from Gemini API.');
          continue;
        }

        let errorMessage = `Model ${model} request failed (${response.status})`;
        try {
          const errorPayload = await response.json();
          const apiMessage = errorPayload?.error?.message;
          if (apiMessage) errorMessage = apiMessage;
        } catch {
          // Ignore parse errors; keep generic message
        }

        const modelNotAvailable = response.status === 404 || /not found|not supported|not available|invalid model/i.test(errorMessage);
        if (modelNotAvailable) {
          lastError = new Error(errorMessage);
          continue;
        }

        if (response.status === 429) {
          const rateLimitError = new Error(errorMessage);
          const retryAfterHeader = response.headers.get('retry-after');
          const retryAfterSeconds = Number.parseInt(retryAfterHeader || '0', 10);
          rateLimitError.status = 429;
          rateLimitError.retryAfterMs = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0 ? retryAfterSeconds * 1000 : delay;
          rateLimitError.isQuotaExceeded = /quota|exceeded|limit reached|resource has been exhausted/i.test(errorMessage);

          if (rateLimitError.isQuotaExceeded) {
            throw rateLimitError;
          }

          lastError = rateLimitError;
          continue;
        }

        throw new Error(errorMessage);
      }

      throw lastError || new Error('No compatible Gemini model found. API key restrictions বা model access check করুন।');
    } catch (err) {
      if (err?.isQuotaExceeded) {
        throw new Error('Gemini free quota শেষ হয়ে গেছে। কিছুক্ষণ পরে চেষ্টা করুন অথবা নতুন API key ব্যবহার করুন।');
      }

      if (retries > 0) {
        const waitMs = err?.status === 429 ? (err?.retryAfterMs || delay) : delay;
        await sleep(waitMs);
        return callGemini(prompt, retries - 1, Math.min(delay * 2, 6000));
      }
      throw err;
    }
  };

  const analyzeFight = async () => {
    if (!fightDescription.trim()) return;
    setAnalyzing(true);
    const prompt = `Based on this fight description in Bengali: "${fightDescription}", determine:
    1. Anger Level (choose one from: cute, mild, moderate, silent, cold, extreme, explosive)
    2. Best Letter Style (choose one from: literary, poetic, programming, economic, historical, musical, scientific).
    Return only a JSON object like: {"level": "...", "style": "...", "reason": "brief reason in Bengali"}`;

    try {
      const result = await callGemini(prompt);
      // Clean result to ensure valid JSON
      const cleanedJson = result.replace(/```json|```/g, '').trim();
      const analysis = JSON.parse(cleanedJson);
      
      if (analysis.level) setAngerLevel(analysis.level);
      if (analysis.style) setLetterStyle(analysis.style);
      
      setError(`💡 AI টিপস: ${analysis.reason}`);
      setTimeout(() => setError(null), 8000);
    } catch (err) {
      console.error(err);
      const message = err?.message?.includes('VITE_GEMINI_API_KEY')
        ? 'API key পাওয়া যায়নি। .env ফাইলে VITE_GEMINI_API_KEY সেট করুন।'
        : err?.message?.includes('quota') || err?.message?.includes('429')
        ? 'Gemini free limit hit করেছে। ১-৫ মিনিট পরে আবার চেষ্টা করুন, না হলে অন্য API key দিন।'
        : "বিশ্লেষণ করতে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।";
      setError(message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setAnalyzing(false);
    }
  };

  const generateEverything = async () => {
    if (!name.trim()) {
      setError(`আগে আপনার ${senderType === 'boyfriend' ? 'রাজকন্যার' : 'রাজকুমারের'} নাম লিখুন! 😊`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    setGeneratedText('');
    setShortRhyme('');
    setGiftIdea('');
    
    const receiverType = senderType === 'boyfriend' ? 'Girlfriend' : 'Boyfriend';
    const honorific = senderType === 'boyfriend' ? 'মহামান্যা (Mahamanya)' : 'মহামান্য (Mahamanyo)';
    
    const prompt = `Write a hilarious, romantic, and extremely flattering letter in BENGALI from a ${senderType} to their ${receiverType} named "${name}". 
    Address them as "${honorific}". Style: "${letterStyle}". Anger Context: "${angerLevel}".
    
    CRITICAL FORMATTING INSTRUCTIONS for WhatsApp Compatibility:
    1. Use single asterisk (*) for bolding like *বোল্ড টেক্সট* (Do NOT use double asterisks **).
    2. Start the letter with Date and Subject in this format:
       *তারিখ:* [Current Date]
       *বিষয়:* [Funny Subject with Emojis]
    3. Use plenty of expressive emojis at the end of sentences.
    4. Ensure the body uses *word* for important emphasized words so they appear bold in WhatsApp.
    5. The language MUST be pure Bengali (No English words).

    Also, provide:
    1. A 4-line sweet Bengali rhyme with matching emojis (use * for bolding key words).
    2. One creative gift idea to fix the mood with relevant emojis.
    
    Format response exactly as:
    LETTER: [The long letter]
    RHYME: [The 4-liner]
    GIFT: [Short gift tip]`;

    try {
      const result = await callGemini(prompt);
      const sanitizedResult = result.replace(/\*\*/g, '*');
      
      const letterMatch = sanitizedResult.match(/LETTER:([\s\S]*?)RHYME:/);
      const rhymeMatch = sanitizedResult.match(/RHYME:([\s\S]*?)GIFT:/);
      const giftMatch = sanitizedResult.match(/GIFT:([\s\S]*)/);

      const parsedLetter = letterMatch ? letterMatch[1].trim() : sanitizedResult.trim();
      const parsedRhyme = rhymeMatch ? rhymeMatch[1].trim() : "";
      const parsedGift = giftMatch ? giftMatch[1].trim() : "";

      if (parsedLetter.replace(/\s+/g, ' ').length < 140) {
        throw new Error('অসম্পূর্ণ উত্তর পাওয়া গেছে');
      }

      setGeneratedText(parsedLetter);
      setShortRhyme(parsedRhyme);
      setGiftIdea(parsedGift);
      
      setTimeout(() => {
        if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      const fallback = createLocalFallback();
      setGeneratedText(fallback.letter);
      setShortRhyme(fallback.rhyme);
      setGiftIdea(fallback.gift);

      const message = err?.message?.includes('VITE_GEMINI_API_KEY')
        ? 'API key পাওয়া যায়নি। তাই লোকাল টেমপ্লেট দিয়ে চিঠি তৈরি করা হয়েছে।'
        : err?.message?.includes('quota') || err?.message?.includes('429')
        ? 'Gemini limit hit করেছে। তাই আপাতত লোকাল টেমপ্লেট দিয়ে চিঠি তৈরি করা হয়েছে।'
        : 'AI response অসম্পূর্ণ ছিল, তাই লোকাল টেমপ্লেট দিয়ে পূর্ণ চিঠি তৈরি করা হয়েছে।';
      setError(message);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const bgGradient = senderType === 'boyfriend' 
    ? 'from-rose-50 to-pink-50' 
    : 'from-indigo-50 to-blue-50';
  const primaryBtn = senderType === 'boyfriend' 
    ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-200' 
    : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
    
  // Dynamic classes for TailwindCSS v4 compatibility
  const focusBorderColor = senderType === 'boyfriend' ? 'focus:border-rose-400' : 'focus:border-indigo-400';
  const focusRingColor = senderType === 'boyfriend' ? 'focus:ring-rose-100' : 'focus:ring-indigo-100';
  const iconActiveColor = senderType === 'boyfriend' ? 'group-focus-within:text-rose-500' : 'group-focus-within:text-indigo-500';
  const spinnerColor = senderType === 'boyfriend' ? 'text-rose-500' : 'text-indigo-500';
  const spinnerBgColor = senderType === 'boyfriend' ? 'bg-rose-400' : 'bg-indigo-400';
  
  const getAngerButtonClass = (isActive) => {
    if (!isActive) return 'bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50';
    return senderType === 'boyfriend' 
      ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm ring-2 ring-rose-100 ring-offset-1'
      : 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-2 ring-indigo-100 ring-offset-1';
  };

  return (
    <div className={`min-h-screen bg-linear-to-br ${bgGradient} text-slate-800 pb-12 transition-colors duration-700`}>
      <style>
        {`
          .paper-texture {
            background-color: #fffef9;
            background-image: radial-gradient(#e5e7eb 1px, transparent 0);
            background-size: 24px 24px;
          }
          
          .wax-seal {
            background: linear-gradient(135deg, #be123c 0%, #9f1239 100%);
            box-shadow: inset 0 2px 4px rgba(255,255,255,0.3), 0 4px 6px rgba(0,0,0,0.2);
          }

          /* Custom Scrollbar for better aesthetics */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
        `}
      </style>

      {/* Header */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-white/20 shadow-sm transition-all duration-500`}>
        <div className="flex items-center justify-between px-4 py-4 mx-auto max-w-7xl md:px-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl text-white shadow-lg transition-colors duration-500 ${senderType === 'boyfriend' ? 'bg-rose-500' : 'bg-indigo-600'}`}>
              <Zap size={20} fill="currentColor" className="text-yellow-300" />
            </div>
            <div>
              <h1 className={`text-xl font-bold tracking-tight leading-none ${senderType === 'boyfriend' ? 'text-rose-600' : 'text-indigo-600'}`}>
                Mood Fixer <span className="italic font-black text-slate-800">Pro</span>
              </h1>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">AI Relationship Saver</p>
            </div>
          </div>
          
          <div className="flex gap-1 p-1 shadow-inner bg-slate-100/80 rounded-xl">
            <button 
              onClick={() => setSenderType('boyfriend')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${senderType === 'boyfriend' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
            >
              <span className="text-base font-black sm:hidden">BF</span>
              <span className="hidden text-base sm:inline">👦</span> 
              <span className="hidden sm:inline">Boyfriend</span>
            </button>
            <button 
              onClick={() => setSenderType('girlfriend')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${senderType === 'girlfriend' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
            >
              <span className="text-base font-black sm:hidden">GF</span>
              <span className="hidden text-base sm:inline">👧</span> 
              <span className="hidden sm:inline">Girlfriend</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="px-4 py-8 mx-auto max-w-7xl md:px-6">
        <div className="grid items-start grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* Input Section */}
          <div className="space-y-6 lg:col-span-5">
            
            {/* Analyzer Card */}
            <div className="relative p-6 overflow-hidden bg-white border shadow-xl rounded-3xl shadow-slate-200/60 border-slate-100 group">
              <div className="absolute transition-transform duration-700 opacity-50 -right-6 -top-6 text-slate-50 group-hover:scale-110">
                <BrainCircuit size={140} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 text-orange-600 bg-orange-100 rounded-xl">
                    <BrainCircuit size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-wide uppercase text-slate-700">AI ঝগড়া বিশ্লেষক</h3>
                    <p className="text-[11px] text-slate-400 font-medium">ঝগড়ার কারণ লিখুন, AI মুড ঠিক করবে</p>
                  </div>
                </div>
                
                <textarea 
                  value={fightDescription}
                  onChange={(e) => setFightDescription(e.target.value)}
                  placeholder="কি নিয়ে ঝগড়া হয়েছে? এখানে ছোট করে লিখুন..."
                  className="w-full p-4 text-sm font-medium transition-all border-2 outline-none resize-none bg-slate-50 rounded-2xl border-slate-100 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 h-28 text-slate-600 placeholder:text-slate-300"
                />
                
                <button 
                  onClick={analyzeFight} 
                  disabled={analyzing || !fightDescription} 
                  className="w-full mt-3 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg shadow-orange-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {analyzing ? <RefreshCw size={16} className="animate-spin" /> : <>অটো-সেটিং ঠিক করো <Sparkles size={16} /></>}
                </button>
              </div>
            </div>

            {/* Main Config Card */}
            <div className="p-6 space-y-8 bg-white border shadow-xl rounded-3xl md:p-8 shadow-slate-200/60 border-slate-100">
              
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  কার অভিমান ভাঙাবেন? <span className="text-red-400">*</span>
                </label>
                <div className="relative group">
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="তার নাম লিখুন..." 
                    className={`w-full pl-16 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:outline-none ${focusBorderColor} focus:bg-white focus:ring-4 ${focusRingColor} text-lg font-bold text-slate-700 transition-all placeholder:text-slate-300`} 
                  />
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white shadow-sm text-slate-300 ${iconActiveColor} transition-colors`}>
                    <User size={18} />
                  </div>
                </div>
              </div>

              {/* Anger Level Selector */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  রাগের মাত্রা 🌡️
                </label>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                  {angerLevels.map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setAngerLevel(lvl.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px] ${getAngerButtonClass(angerLevel === lvl.id)}`}
                    >
                      <span className="flex-shrink-0 text-base">{lvl.emoji}</span>
                      <span className="leading-tight text-center">{lvl.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Selector */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
                  চিঠির স্টাইল 🎨
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {styles.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setLetterStyle(s.id)}
                      className={`p-3 rounded-2xl border-2 transition-all flex items-center gap-3 text-left active:scale-[0.98] ${
                        letterStyle === s.id 
                        ? 'border-slate-800 bg-slate-800 text-white shadow-lg' 
                        : 'bg-white border-slate-100 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${letterStyle === s.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        {s.icon}
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-tight">{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 text-xs font-medium text-blue-700 duration-300 border border-blue-100 bg-blue-50 rounded-2xl animate-in fade-in zoom-in">
                  <Info size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Generate Button */}
              <button 
                onClick={generateEverything} 
                disabled={loading} 
                className={`w-full py-4 rounded-2xl text-white font-bold text-sm shadow-xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-80 disabled:cursor-not-allowed group ${primaryBtn}`}
              >
                {loading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <Sparkles size={20} className="text-yellow-200 transition-transform group-hover:rotate-12" fill="currentColor" /> 
                    <span className="tracking-wide uppercase">ম্যাজিক চিঠি জেনারেট করো</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-7 scroll-mt-24" ref={resultRef}>
            
            {/* Empty State */}
            {!generatedText && !loading && (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white/40 border-4 border-dashed border-slate-200/60 rounded-[2.5rem] mt-4 lg:mt-0 transition-all">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200 border border-slate-50 animate-bounce duration-[3000ms]">
                  <Mail className="text-slate-300" size={32} />
                </div>
                <h2 className="text-xl font-black tracking-tight uppercase text-slate-400">অপেক্ষমাণ চিঠি</h2>
                <p className="max-w-xs mt-3 text-xs font-medium leading-relaxed text-slate-400">
                  বামে তথ্যগুলো পূরণ করে বাটনে ক্লিক করুন, <br/>আপনার ম্যাজিক লেটারটি এখানে তৈরি হবে।
                </p>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white/60 backdrop-blur-sm rounded-[2.5rem] p-8 border border-white space-y-6 min-h-[500px] flex flex-col justify-center items-center">
                 <div className="relative">
                    <div className={`absolute inset-0 ${spinnerBgColor} rounded-full blur-xl opacity-20 animate-pulse`}></div>
                    <RefreshCw className={`animate-spin ${spinnerColor} relative z-10`} size={48} />
                 </div>
                 <div className="space-y-2 text-center">
                    <h3 className="text-lg font-bold text-slate-700">চিঠি লেখা হচ্ছে... ✍️</h3>
                    <p className="text-sm text-slate-500">আপনার {senderType === 'boyfriend' ? 'প্রিয়তমার' : 'প্রিয়তমের'} রাগ ভাঙানোর জন্য সেরা শব্দগুলো খোঁজা হচ্ছে।</p>
                 </div>
              </div>
            )}

            {/* Generated Content */}
            {generatedText && !loading && (
              <div className="space-y-6 duration-700 animate-in fade-in slide-in-from-bottom-8">
                
                {/* Insights Row */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {giftIdea && (
                    <div className="p-5 transition-all bg-white border shadow-lg rounded-3xl border-slate-100 shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 group">
                      <div className="flex flex-col items-center gap-4 sm:flex-row">
                        <div className="p-3 transition-transform bg-emerald-100 rounded-2xl text-emerald-600 group-hover:scale-110">
                          <Gift size={20} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                          <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">গিফট আইডিয়া 💡</h4>
                          <p className="text-xs font-bold leading-snug text-slate-700">"{giftIdea}"</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {shortRhyme && (
                    <div className="relative p-5 overflow-hidden bg-white border shadow-lg rounded-3xl border-slate-100 shadow-slate-100/50 group">
                      <div className="relative z-10 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        <div className="p-3 mt-0 text-blue-600 bg-blue-100 rounded-2xl shrink-0 sm:mt-1">
                          <Music size={20} />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">তার জন্য 🎶</h4>
                           <p className="text-xs italic leading-relaxed whitespace-pre-line text-slate-600 font-bengali-serif">{shortRhyme}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(shortRhyme)} 
                        className="absolute p-2 transition-colors bottom-2 right-2 bg-slate-50 hover:bg-blue-500 hover:text-white rounded-xl text-slate-400"
                        title="Copy Rhyme"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Letter Card */}
                <div className="relative pt-4">
                   {/* Decorative elements */}
                  <div className="absolute z-20 flex items-center justify-center -translate-x-1/2 border-4 border-white rounded-full shadow-xl -top-3 left-1/2 w-14 h-14 wax-seal">
                    <Heart className="text-white/90" fill="currentColor" size={20} />
                  </div>

                  <div className="paper-texture rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-slate-300/50 border border-slate-200 relative overflow-hidden pt-16">
                    {/* Watermark */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
                      <Landmark size={250} />
                    </div>
                    
                    {/* Letter Header */}
                    <div className="flex flex-col items-start justify-between gap-4 pb-6 mb-8 border-b sm:flex-row sm:items-center border-slate-200/60">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <CheckCircle2 size={14} className="text-green-500" />
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Love Dispatch 🕊️</span>
                         </div>
                         <h4 className="text-xs font-bold tracking-wider uppercase text-slate-600">Ref: AI-{angerLevel.toUpperCase()}</h4>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 border rounded-full shadow-sm bg-white/80 backdrop-blur-sm border-slate-100">
                         <Calendar size={12} className="text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                           {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </span>
                      </div>
                    </div>

                    {/* Letter Body */}
                    <article className="relative z-10 prose prose-slate max-w-none">
                      <div className="whitespace-pre-wrap text-slate-800 leading-[2.1] font-bengali-serif text-lg md:text-xl font-medium select-all selection:bg-rose-100/50">
                        {generatedText}
                      </div>
                    </article>

                    {/* Letter Footer */}
                    <div className="flex justify-end pt-8 mt-12 border-t border-slate-200/60">
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">চিরদিন তোমারই ❤️</p>
                          <div className="h-10">
                             {/* Signature placeholder space */}
                             <span className="text-2xl italic font-bengali-serif text-slate-700 opacity-80">ইতি, তোমার পাগলা</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-2">
                  <button 
                    onClick={() => copyToClipboard(generatedText)} 
                    className={`h-14 rounded-2xl font-bold text-xs transition-all border-2 flex items-center justify-center gap-2.5 active:scale-[0.98] ${
                      copied 
                      ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {copied ? <><Star size={18} fill="currentColor" /> কপি করা হয়েছে!</> : <><Copy size={18} /> সম্পূর্ণ চিঠি কপি করুন</>}
                  </button>
                  
                  <a 
                    href={`https://wa.me/?text=${encodeURIComponent(generatedText)}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="h-14 bg-[#25D366] text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-green-200 hover:bg-[#1ebd5a] transition-all active:scale-[0.98]"
                  >
                    <Send size={18} /> হোয়াটসঅ্যাপে পাঠান
                  </a>
                </div>

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;