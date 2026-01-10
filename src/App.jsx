import React, { useState, useEffect, useRef } from 'react';
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

  // API Key handling per environment instructions
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

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

  const callGemini = async (prompt, retries = 3, delay = 1000) => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return callGemini(prompt, retries - 1, delay * 2);
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
      setError("বিশ্লেষণ করতে সমস্যা হয়েছে, দয়া করে আবার চেষ্টা করুন।");
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

      setGeneratedText(letterMatch ? letterMatch[1].trim() : sanitizedResult);
      setShortRhyme(rhymeMatch ? rhymeMatch[1].trim() : "");
      setGiftIdea(giftMatch ? giftMatch[1].trim() : "");
      
      setTimeout(() => {
        if (resultRef.current) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError("AI সার্ভারে একটু সমস্যা হচ্ছে। আবার চেষ্টা করুন। 🥺");
      setTimeout(() => setError(null), 4000);
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

  const themeColor = senderType === 'boyfriend' ? 'rose' : 'indigo';
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
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
          
          <div className="bg-slate-100/80 p-1 rounded-xl flex gap-1 shadow-inner">
            <button 
              onClick={() => setSenderType('boyfriend')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${senderType === 'boyfriend' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
            >
              <span className="text-base sm:hidden font-black">BF</span>
              <span className="text-base hidden sm:inline">👦</span> 
              <span className="hidden sm:inline">Boyfriend</span>
            </button>
            <button 
              onClick={() => setSenderType('girlfriend')} 
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${senderType === 'girlfriend' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
            >
              <span className="text-base sm:hidden font-black">GF</span>
              <span className="text-base hidden sm:inline">👧</span> 
              <span className="hidden sm:inline">Girlfriend</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Input Section */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Analyzer Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/60 border border-slate-100 relative overflow-hidden group">
              <div className="absolute -right-6 -top-6 text-slate-50 opacity-50 group-hover:scale-110 transition-transform duration-700">
                <BrainCircuit size={140} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                    <BrainCircuit size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">AI ঝগড়া বিশ্লেষক</h3>
                    <p className="text-[11px] text-slate-400 font-medium">ঝগড়ার কারণ লিখুন, AI মুড ঠিক করবে</p>
                  </div>
                </div>
                
                <textarea 
                  value={fightDescription}
                  onChange={(e) => setFightDescription(e.target.value)}
                  placeholder="কি নিয়ে ঝগড়া হয়েছে? এখানে ছোট করে লিখুন..."
                  className="w-full bg-slate-50 p-4 rounded-2xl text-sm border-2 border-slate-100 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 transition-all resize-none h-28 outline-none font-medium text-slate-600 placeholder:text-slate-300"
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
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 space-y-8">
              
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
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                  {angerLevels.map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setAngerLevel(lvl.id)}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all flex items-center justify-center gap-1.5 active:scale-95 min-h-[44px] ${getAngerButtonClass(angerLevel === lvl.id)}`}
                    >
                      <span className="text-base flex-shrink-0">{lvl.emoji}</span>
                      <span className="text-center leading-tight">{lvl.label}</span>
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
                <div className="p-4 bg-blue-50 text-blue-700 rounded-2xl text-xs font-medium border border-blue-100 flex items-start gap-3 animate-in fade-in zoom-in duration-300">
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
                    <Sparkles size={20} className="group-hover:rotate-12 transition-transform text-yellow-200" fill="currentColor" /> 
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
                <h2 className="text-xl font-black text-slate-400 uppercase tracking-tight">অপেক্ষমাণ চিঠি</h2>
                <p className="text-slate-400 text-xs mt-3 max-w-xs font-medium leading-relaxed">
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
                 <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-700">চিঠি লেখা হচ্ছে... ✍️</h3>
                    <p className="text-sm text-slate-500">আপনার {senderType === 'boyfriend' ? 'প্রিয়তমার' : 'প্রিয়তমের'} রাগ ভাঙানোর জন্য সেরা শব্দগুলো খোঁজা হচ্ছে।</p>
                 </div>
              </div>
            )}

            {/* Generated Content */}
            {generatedText && !loading && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
                {/* Insights Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {giftIdea && (
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center gap-4 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                      <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                        <Gift size={20} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">গিফট আইডিয়া 💡</h4>
                        <p className="text-xs text-slate-700 font-bold leading-snug">"{giftIdea}"</p>
                      </div>
                    </div>
                  )}
                  
                  {shortRhyme && (
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/50 relative overflow-hidden flex flex-col justify-between group">
                      <div className="flex items-start gap-4 relative z-10">
                        <div className="bg-blue-100 p-3 rounded-2xl text-blue-600 shrink-0 mt-1">
                          <Music size={20} />
                        </div>
                        <div>
                           <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">মিষ্টি ছড়া 🎶</h4>
                           <p className="text-xs text-slate-600 font-bengali-serif leading-relaxed italic whitespace-pre-line">{shortRhyme}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(shortRhyme)} 
                        className="absolute bottom-2 right-2 p-2 bg-slate-50 hover:bg-blue-500 hover:text-white rounded-xl text-slate-400 transition-colors"
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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-14 h-14 rounded-full wax-seal flex items-center justify-center border-4 border-white shadow-xl">
                    <Heart className="text-white/90" fill="currentColor" size={20} />
                  </div>

                  <div className="paper-texture rounded-[2.5rem] p-6 md:p-12 shadow-2xl shadow-slate-300/50 border border-slate-200 relative overflow-hidden pt-16">
                    {/* Watermark */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none select-none">
                      <Landmark size={250} />
                    </div>
                    
                    {/* Letter Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-6 border-b border-slate-200/60 gap-4">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2">
                           <CheckCircle2 size={14} className="text-green-500" />
                           <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Love Dispatch 🕊️</span>
                         </div>
                         <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Ref: AI-{angerLevel.toUpperCase()}</h4>
                      </div>
                      <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm flex items-center gap-2">
                         <Calendar size={12} className="text-slate-400" />
                         <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                           {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                         </span>
                      </div>
                    </div>

                    {/* Letter Body */}
                    <article className="prose prose-slate max-w-none relative z-10">
                      <div className="whitespace-pre-wrap text-slate-800 leading-[2.1] font-bengali-serif text-lg md:text-xl font-medium select-all selection:bg-rose-100/50">
                        {generatedText}
                      </div>
                    </article>

                    {/* Letter Footer */}
                    <div className="mt-12 pt-8 border-t border-slate-200/60 flex justify-end">
                       <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">চিরদিন তোমারই ❤️</p>
                          <div className="h-10">
                             {/* Signature placeholder space */}
                             <span className="font-bengali-serif text-2xl italic text-slate-700 opacity-80">ইতি, তোমার পাগলা</span>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-8">
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