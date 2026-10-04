import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Search, FileText, Image as ImageIcon, Menu, X, ChevronRight,
  PlayCircle, Copy, RefreshCw, ArrowRight, AlignLeft, CheckCircle2, User, Video,
  TrendingUp, Hash, Tag, Download, Camera, Wand2, BookOpen, MapPin, Mic2,
  ExternalLink, FileSpreadsheet, Zap, Layers } from 'lucide-react';
import { generateTopicsAPI, generateScriptAPI, generateCharacterAPI, generateVisualTableAPI,
  generateThumbnailTextsAPI, generateThumbnailPromptAPI, generateSEOAPI,
  generateProductionPromptsAPI } from './api';
import './App.css';

/* ── Constants ─────────────────────────────── */
const NICHES = [
  { id: 'true_crime', label: 'Kriminal & Misteri Sejarah', icon: Search, desc: 'Kasus nyata, misteri sejarah, kejadian nyata.' },
  { id: 'revenge',    label: 'Pengkhianatan & Balas Dendam', icon: User,   desc: 'Cerita Reddit RPM tinggi, balas dendam korporat, pengkhianatan.' }
];
const VISUAL_STYLES = [
  { id: 'cinematic',   label: 'Cinematic Realism (Nyata)',  prompt: 'Ultra realistic photography, shot on 35mm lens, shallow depth of field, heavily blurred bokeh background, dark black vignette edges, dramatic cinematic lighting, gritty true crime documentary style, raw photo, highly detailed, photorealistic, not looking like AI.' },
  { id: 'flat_vector', label: 'Minimalist Vector / Stickman', prompt: 'flat vector illustration, minimalist geometric character, thin uniform outline, solid flat color blocks, no texture shading, cool muted pastel palette, clean negative space composition.' },
  { id: 'dark_anime',  label: 'Dark Anime / Graphic Novel', prompt: 'Dark anime style, graphic novel illustration, dramatic heavy shadows, cel shaded, highly detailed background, atmospheric lighting, moody.' }
];
const STEPS = [
  { id:1, view:'step1', name:'Topik',    icon: Search },
  { id:2, view:'step2', name:'Skrip',    icon: FileText },
  { id:3, view:'step3', name:'Karakter', icon: User },
  { id:4, view:'step4', name:'Visual',   icon: ImageIcon },
  { id:5, view:'step5', name:'Thumbnail',icon: Video },
  { id:6, view:'step6', name:'SEO',      icon: TrendingUp },
  { id:7, view:'step7', name:'Prompt',   icon: Wand2 },
  { id:8, view:'step8', name:'Export',   icon: Download }
];

/* ── Utilities ─────────────────────────────── */
const copy = async (text) => {
  if (navigator.clipboard && window.isSecureContext) { try { await navigator.clipboard.writeText(text); return true; } catch {} }
  const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed';
  document.body.appendChild(ta); ta.focus(); ta.select();
  const ok = document.execCommand('copy'); ta.remove(); return ok;
};

/* ── ProgressBar ───────────────────────────── */
const ProgressBar = ({ currentStep }) => (
  <div className="w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 py-3 px-6 sticky top-0 z-30 shadow-sm">
    <div className="max-w-5xl mx-auto flex items-center justify-between gap-1">
      {STEPS.map((step, idx) => {
        const isActive = currentStep === step.id;
        const isPast   = currentStep > step.id;
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500
                ${isActive ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-110'
                  : isPast  ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {isPast ? <CheckCircle2 size={16} strokeWidth={2.5}/> : <step.icon size={15} strokeWidth={isActive?2.5:2}/>}
              </div>
              <span className={`text-[10px] font-bold tracking-wide ${isActive?'text-blue-600':isPast?'text-slate-700':'text-slate-400'}`}>{step.name}</span>
            </div>
            {idx < STEPS.length-1 && (
              <div className="flex-1 h-[2px] mx-1 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${isPast?'w-full bg-slate-800':'w-0'}`}/>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);

/* ── Sidebar ───────────────────────────────── */
const Sidebar = ({ isOpen, setIsOpen, currentView, setCurrentView }) => {
  const items = [
    { id:'dashboard', label:'Dasbor',           icon: LayoutDashboard },
    { id:'step1',     label:'Riset Topik',       icon: Search },
    { id:'step2',     label:'Skrip Imersif',     icon: FileText },
    { id:'step3',     label:'Desain Karakter',   icon: User },
    { id:'step4',     label:'Tabel Scene',       icon: ImageIcon },
    { id:'step5',     label:'Pembuat Thumbnail', icon: Video },
    { id:'step6',     label:'Paket SEO',         icon: TrendingUp },
    { id:'step7',     label:'Prompt Produksi',   icon: Wand2 },
    { id:'step8',     label:'Export & Tools',    icon: Download },
  ];
  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={()=>setIsOpen(false)}/>}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 w-[260px] bg-[#07101F] sidebar-texture border-r border-slate-800/60 text-slate-300 flex flex-col transition-transform duration-500 ease-[cubic-bezier(.16,1,.3,1)] ${isOpen?'translate-x-0':'-translate-x-full lg:translate-x-0'} shadow-2xl lg:shadow-none`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800/60 relative overflow-hidden">
          <div className="absolute -top-8 -left-8 w-28 h-28 bg-blue-600/15 blur-3xl rounded-full pointer-events-none"/>
          <div className="relative z-10">
            <h1 className="text-[18px] font-extrabold tracking-tight text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <PlayCircle size={16} className="text-white" strokeWidth={2.5}/>
              </div>
              Narrava
            </h1>
            <p className="text-[9px] text-blue-400/80 mt-1.5 font-extrabold tracking-[.25em] uppercase">Studio Pro</p>
          </div>
          <button className="lg:hidden text-slate-500 hover:text-white transition-colors" onClick={()=>setIsOpen(false)}><X size={20}/></button>
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-5 px-3.5 space-y-1 custom-scrollbar">
          {items.map(item => {
            const active = currentView === item.id;
            return (
              <button key={item.id} onClick={()=>{setCurrentView(item.id);setIsOpen(false);}}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-250 group btn-press text-left
                  ${active ? 'bg-blue-600 text-white shadow-[0_4px_16px_-4px_rgba(59,130,246,0.5)]'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}>
                <item.icon size={17} strokeWidth={active?2.5:2}
                  className={`transition-transform duration-300 group-hover:scale-110 ${active?'text-white':'text-slate-500 group-hover:text-blue-400'}`}/>
                <span className="font-semibold text-[13px] tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </nav>
        {/* Footer */}
        <div className="p-4 border-t border-slate-800/60 text-center">
          <p className="text-[10px] text-slate-600 font-medium">Powered by 9Router · webaplikasi1</p>
        </div>
      </div>
    </>
  );
};

/* ── Empty State ───────────────────────────── */
const EmptyState = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center justify-center min-h-[500px] text-slate-400 fade-in">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-5 float border border-slate-100">
      <Icon size={32} strokeWidth={1.5} className="text-slate-300"/>
    </div>
    <p className="font-semibold text-[15px]">{text}</p>
  </div>
);

/* ── Dashboard ─────────────────────────────── */
const Dashboard = ({ setCurrentView }) => (
  <div className="p-8 md:p-12 max-w-5xl mx-auto fade-slide">
    <div className="mb-10">
      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-[12px] font-extrabold tracking-widest uppercase border border-blue-100 mb-5">
        <Zap size={12}/> AI Content Studio
      </div>
      <h2 className="text-[42px] font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-4">
        Selamat Datang di<br/>
        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Narrative Studio</span>
      </h2>
      <p className="text-slate-500 text-[16px] font-medium max-w-xl leading-relaxed">Platform AI eksklusif untuk produksi konten YouTube retensi tinggi. Dari riset topik hingga prompt visual siap produksi.</p>
    </div>

    {/* Feature cards */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { icon: Search,   label: 'Riset Topik', color: 'blue',   desc: 'Viral topics AI' },
        { icon: FileText, label: 'Skrip POV',   color: 'indigo', desc: 'Immersive 2nd person' },
        { icon: ImageIcon,label: 'Visual Table', color: 'violet', desc: 'Scene-by-scene' },
        { icon: Wand2,    label: 'Prod. Prompt', color: 'purple', desc: 'Cinematic rewrite' },
      ].map(f => (
        <div key={f.label} className={`glass-card p-5 rounded-2xl border border-${f.color}-100/50 card-hover`}>
          <div className={`w-10 h-10 rounded-xl bg-${f.color}-50 flex items-center justify-center mb-3`}>
            <f.icon size={18} className={`text-${f.color}-600`} strokeWidth={2}/>
          </div>
          <p className="font-extrabold text-slate-800 text-[13px]">{f.label}</p>
          <p className="text-slate-400 text-[11px] font-medium mt-0.5">{f.desc}</p>
        </div>
      ))}
    </div>

    {/* CTA */}
    <div className="glass-card rounded-[2rem] p-12 text-center relative overflow-hidden card-hover">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 pointer-events-none"/>
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-t-[2rem]"/>
      <div className="relative z-10">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-7 shadow-xl float">
          <PlayCircle size={42} strokeWidth={1.5}/>
        </div>
        <h3 className="text-[28px] font-extrabold text-slate-900 mb-3 tracking-tight">Mulai Proyek Baru</h3>
        <p className="text-slate-500 mb-8 max-w-md mx-auto leading-relaxed text-[15px] font-medium">
          Riset topik viral, generate skrip psikologis imersif, dan ekstrak prompt visual sinematik — semua dalam satu alur.
        </p>
        <button onClick={()=>setCurrentView('step1')}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-4 rounded-2xl font-extrabold text-[15px] btn-glow-blue btn-press inline-flex items-center gap-3 group">
          Mulai Riset Topik <ChevronRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1.5 transition-transform"/>
        </button>
      </div>
    </div>
  </div>
);

/* ── Step 1: Topic Research ────────────────── */
const TopicResearch = ({ onSelectTopic, activeNiche, setActiveNiche }) => {
  const [category, setCategory] = useState('Missing Persons');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const categories = activeNiche==='true_crime'
    ? ['Missing Persons','Unsolved Mysteries','Historical Disasters','Internet Lore']
    : ['Pro Revenge','Corporate Betrayal','Family Drama','Cheating Partners'];
  useEffect(()=>{ setCategory(categories[0]); }, [activeNiche]);

  const handle = async () => {
    setLoading(true);
    const r = await generateTopicsAPI(activeNiche,'Worldwide',category,5);
    if (r) setTopics(r);
    setLoading(false);
  };
  const scoreColor = (s) => s>=85?'text-emerald-600 bg-emerald-50 border-emerald-200':s>=70?'text-amber-600 bg-amber-50 border-amber-200':'text-red-600 bg-red-50 border-red-200';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto fade-slide">
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Riset Topik</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Temukan narasi terverifikasi dengan potensi viral tinggi.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4">
          <div className="glass-card p-7 rounded-3xl sticky top-24">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Niche Cerita</p>
            <div className="space-y-3 mb-7">
              {NICHES.map(n => (
                <button key={n.id} onClick={()=>setActiveNiche(n.id)}
                  className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-250 btn-press
                    ${activeNiche===n.id?'bg-blue-50 border-blue-400 ring-2 ring-blue-500/10':'border-slate-200 hover:border-blue-200 bg-white/60'}`}>
                  <div className={`flex items-center gap-2.5 font-extrabold text-[13.5px] ${activeNiche===n.id?'text-blue-700':'text-slate-700'}`}>
                    <n.icon size={16} strokeWidth={activeNiche===n.id?2.5:2}/> {n.label}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-1 font-medium leading-snug">{n.desc}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Kategori</p>
            <div className="relative mb-7">
              <select value={category} onChange={e=>setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px] font-bold text-slate-700 cursor-pointer">
                {categories.map(c=><option key={c}>{c}</option>)}
              </select>
              <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"/>
            </div>
            <button onClick={handle} disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 btn-press text-[14px]">
              {loading ? <RefreshCw size={16} className="animate-spin"/> : <Search size={16} strokeWidth={2.5}/>}
              {loading ? 'Menganalisis...' : 'Hasilkan Topik'}
            </button>
          </div>
        </div>
        {/* Results */}
        <div className="lg:col-span-8 space-y-4">
          {topics.length===0 && !loading && (
            <div className="h-[420px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-white/30">
              <Search size={36} className="mb-4 text-slate-300 float" strokeWidth={1.5}/>
              <p className="font-semibold text-[15px]">Atur parameter dan klik hasilkan.</p>
            </div>
          )}
          {loading && [1,2,3,4,5].map(i=>(
            <div key={i} className="glass-card rounded-2xl p-6 fade-in">
              <div className="shimmer-load h-5 w-3/4 rounded-lg mb-3"/>
              <div className="shimmer-load h-3.5 w-full rounded mb-2"/>
              <div className="shimmer-load h-3.5 w-2/3 rounded"/>
            </div>
          ))}
          {topics.map((t,i) => (
            <div key={i} className="glass-card rounded-2xl p-6 card-hover fade-slide border border-transparent">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${scoreColor(t.overallScore)}`}>
                      ALGORITMA: {t.overallScore}/100
                    </span>
                  </div>
                  <h3 className="font-extrabold text-[18px] text-slate-900 mb-2 tracking-tight">{t.title}</h3>
                  <p className="text-slate-500 text-[13.5px] font-medium leading-relaxed mb-4 line-clamp-2">{t.shortSummary}</p>
                  <div className="flex items-center gap-4 text-[13px] font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5"><User size={13} className="text-blue-400"/> {t.protagonist}</span>
                    <span className="flex items-center gap-1.5 text-rose-500">⚔️ {t.antagonist}</span>
                  </div>
                </div>
                <button onClick={()=>onSelectTopic(t)}
                  className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-extrabold text-[13px] btn-press btn-glow-blue flex items-center gap-2 group">
                  Pilih <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform"/>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Step 2: Script Generator ──────────────── */
const ScriptGenerator = ({ topic, niche, setCurrentView, scriptData, setScriptData }) => {
  const [duration, setDuration] = useState(10);
  const [loading, setLoading]   = useState(false);
  const [report, setReport]     = useState('');
  if (!topic) return <EmptyState icon={Search} text="Selesaikan riset topik terlebih dahulu."/>;
  const totalWords      = duration * 140;
  const wordsPerChapter = Math.round(totalWords / 4);
  const minWords        = Math.floor(wordsPerChapter * 0.95);
  const maxWords        = Math.ceil(wordsPerChapter * 1.05);
  const getActual       = (txt) => txt ? txt.trim().split(/\s+/).length : 0;
  const getStatus       = (n) => n===0?'Belum Ada':n>=minWords&&n<=maxWords?'✓ Valid':n<minWords?`Kurang (${minWords-n})`:` Lebih (+${n-maxWords})`;
  const getStatusColor  = (n) => n===0?'text-slate-400':n>=minWords&&n<=maxWords?'text-emerald-600':'text-amber-600';

  const handle = async () => {
    setLoading(true); setReport('');
    const data = await generateScriptAPI(topic, duration, niche, scriptData);
    if (data) {
      setReport(data.validationChecklist||'');
      setScriptData((data.chapters||[]).map(ch=>({...ch, wordCount: getActual(ch.content)})));
    }
    setLoading(false);
  };

  const durations = [{ v:7, l:'7 Menit (~980 kata)' },{ v:10, l:'10 Menit (~1400 kata)' },{ v:12, l:'12 Menit (~1680 kata)' },{ v:15, l:'15 Menit (~2100 kata)' }];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto fade-slide">
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Skrip Imersif</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Generate skrip POV orang ke-2 dengan target durasi presisi.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4">
          <div className="glass-card p-7 rounded-3xl sticky top-24">
            <div className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="font-extrabold text-blue-700 text-[13px] truncate">{topic.title}</p>
              <p className="text-blue-500 text-[12px] font-medium mt-0.5">{topic.protagonist} · {topic.location}</p>
            </div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Target Durasi</p>
            <div className="relative mb-6">
              <select value={duration} onChange={e=>setDuration(Number(e.target.value))}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 appearance-none outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-[14px] font-bold text-slate-700 cursor-pointer">
                {durations.map(d=><option key={d.v} value={d.v}>{d.l}</option>)}
              </select>
              <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"/>
            </div>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 text-[13px] space-y-1.5">
              <div className="flex justify-between font-semibold"><span className="text-slate-500">Total Target</span><span className="text-slate-800">{totalWords} kata</span></div>
              <div className="flex justify-between font-semibold"><span className="text-slate-500">Per Bab</span><span className="text-slate-800">{wordsPerChapter} kata</span></div>
              <div className="flex justify-between font-semibold"><span className="text-slate-500">Toleransi</span><span className="text-slate-800">{minWords}–{maxWords}</span></div>
            </div>
            <button onClick={handle} disabled={loading}
              className={`w-full ${scriptData?'bg-amber-500 hover:bg-amber-600':'bg-slate-900 hover:bg-slate-800'} disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 btn-press text-[14px] mb-3`}>
              {loading ? <RefreshCw size={16} className="animate-spin"/> : <RefreshCw size={16} strokeWidth={2.5}/>}
              {loading ? 'Memproses...' : scriptData ? 'Revisi & Sesuaikan Durasi' : 'Generate Skrip'}
            </button>
            {scriptData && <button onClick={()=>setCurrentView('step3')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 btn-press btn-glow-blue text-[14px]">Desain Karakter <ArrowRight size={16}/></button>}
          </div>
        </div>
        <div className="lg:col-span-8">
          {scriptData ? (
            <div className="fade-slide space-y-4">
              {report && <div className="glass-card p-5 rounded-2xl border border-emerald-200 text-emerald-700 text-[13px] font-mono"><CheckCircle2 size={15} className="inline mr-2"/>{report}</div>}
              <div className="glass-card rounded-2xl p-5 mb-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Laporan Validasi Kata</p>
                <div className="grid grid-cols-4 gap-2 text-[12px]">
                  {scriptData.map(ch=>{
                    const actual = ch.wordCount || getActual(ch.content);
                    return (
                      <div key={ch.chapterNumber} className="bg-slate-50 rounded-xl p-3.5 text-center border border-slate-100">
                        <p className="font-extrabold text-slate-700 text-[11px]">Bab {ch.chapterNumber}</p>
                        <p className="text-slate-400 text-[10px]">{minWords}–{maxWords}</p>
                        <p className="font-extrabold text-[16px] mt-1 text-slate-800">{actual}</p>
                        <p className={`text-[10px] font-bold mt-0.5 ${getStatusColor(actual)}`}>{getStatus(actual)}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              {scriptData.map(ch => (
                <div key={ch.chapterNumber} className="glass-card rounded-2xl overflow-hidden card-hover">
                  <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between bg-white/50">
                    <div>
                      <h4 className="font-extrabold text-[15px] text-slate-900">Bab {ch.chapterNumber}: <span className="text-blue-600">{ch.chapterTitle}</span></h4>
                      <p className={`text-[12px] font-bold mt-0.5 ${getStatusColor(ch.wordCount||getActual(ch.content))}`}>Aktual: {ch.wordCount||getActual(ch.content)} kata</p>
                    </div>
                    <button onClick={()=>copy(ch.content)} className="text-slate-400 hover:text-blue-600 transition-colors p-2.5 hover:bg-blue-50 rounded-xl"><Copy size={16}/></button>
                  </div>
                  <div className="px-7 py-6 text-[15px] text-slate-700 leading-[2] font-serif whitespace-pre-wrap">{ch.content}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[500px] border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-white/30">
              <FileText size={40} className="mb-4 text-slate-300 float" strokeWidth={1.5}/>
              <p className="font-semibold text-[15px]">Klik Generate Skrip untuk memulai.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Step 3: Character Design ──────────────── */
const CharacterDesign = ({ topic, setCurrentView, characterPrompt, setCharacterPrompt }) => {
  const [selectedStyleId, setSelectedStyleId] = useState('cinematic');
  const [loading, setLoading] = useState(false);
  if (!topic) return <EmptyState icon={User} text="Pilih topik terlebih dahulu."/>;

  const handle = async () => {
    setLoading(true);
    const styleObj = VISUAL_STYLES.find(s=>s.id===selectedStyleId);
    const r = await generateCharacterAPI(topic, styleObj);
    if (r) setCharacterPrompt(r);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto fade-slide">
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Desain Karakter</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Buat referensi visual konsisten untuk karakter utama.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-7 rounded-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Gaya Visual</p>
          <div className="space-y-3 mb-6">
            {VISUAL_STYLES.map(s=>(
              <button key={s.id} onClick={()=>setSelectedStyleId(s.id)}
                className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all btn-press text-[13.5px] font-bold
                  ${selectedStyleId===s.id?'border-blue-400 bg-blue-50 text-blue-700 ring-2 ring-blue-500/10':'border-slate-200 text-slate-600 hover:bg-white/80 hover:border-blue-200'}`}>
                {s.label}
              </button>
            ))}
          </div>
          <button onClick={handle} disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 btn-press text-[14px]">
            {loading ? <RefreshCw size={16} className="animate-spin"/> : <User size={16} strokeWidth={2.5}/>}
            {loading ? 'Merancang...' : 'Generate Karakter'}
          </button>
        </div>
        <div className="glass-card p-7 rounded-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Prompt Karakter</p>
          {characterPrompt ? (
            <div className="fade-in">
              <div className="bg-slate-900 text-emerald-400 font-mono text-[13px] p-5 rounded-2xl leading-relaxed mb-5 whitespace-pre-wrap">{characterPrompt}</div>
              <div className="flex gap-3">
                <button onClick={()=>copy(characterPrompt)} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-extrabold py-3 rounded-xl btn-press hover:border-blue-300 text-[13px]"><Copy size={15}/> Salin</button>
                <button onClick={()=>setCurrentView('step4')} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl btn-press btn-glow-blue text-[13px]">Lanjut Visual <ArrowRight size={15}/></button>
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
              <p className="text-[14px] font-medium">Hasil karakter muncul di sini.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Step 4: Visual Table ──────────────────── */
const VisualResearch = ({ scriptData, visualData, setVisualData, characterPrompt, setCurrentView, topic }) => {
  const [selectedStyleId, setSelectedStyleId] = useState('cinematic');
  const [loading, setLoading]               = useState(false);
  const [activeIdx, setActiveIdx]           = useState(0);
  const [aiReports, setAiReports]           = useState({});
  if (!scriptData) return <EmptyState icon={BookOpen} text="Skrip belum tersedia."/>;
  const chapter      = scriptData[activeIdx];
  const chapterVis   = visualData?.[activeIdx];
  const badgeColor   = (t) => t==='Real Asset'?'bg-rose-50 border-rose-200 text-rose-700':t==='Motion Graphic'?'bg-indigo-50 border-indigo-200 text-indigo-700':'bg-emerald-50 border-emerald-200 text-emerald-700';

  const handle = async () => {
    setLoading(true);
    const styleObj = VISUAL_STYLES.find(s=>s.id===selectedStyleId);
    const r = await generateVisualTableAPI(chapter.content, styleObj, characterPrompt);
    if (r) {
      setAiReports(p=>({...p,[activeIdx]:r.validationChecklist}));
      setVisualData(p=>{ const d=p?[...p]:new Array(scriptData.length).fill(null); d[activeIdx]=r.scenes; return d; });
    }
    setLoading(false);
  };

  const copyTable = () => {
    if (!chapterVis) return;
    const t = chapterVis.map(s=>`[SCENE ${s.sceneNo}] - ${s.simpleIndonesian}\nSCRIPT: ${s.narration}\nTYPE: ${s.visualType}\nVISUAL SUGGESTION: ${s.visualSuggestion}`).join('\n\n');
    copy(t);
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto fade-slide">
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Papan Sutradara Visual</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Pecah skrip kalimat demi kalimat menjadi panduan real asset, motion graphic, dan reenactment AI.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-3xl sticky top-24 space-y-6">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Navigasi Bab Skrip</p>
              <div className="space-y-2">
                {scriptData.map((ch,i)=>(
                  <button key={i} onClick={()=>setActiveIdx(i)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[13.5px] font-bold transition-all btn-press flex items-center justify-between
                      ${activeIdx===i?'bg-blue-600 text-white':'bg-white/60 border border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                    Bab {ch.chapterNumber}
                    {visualData?.[i] && <CheckCircle2 size={15} strokeWidth={3} className={activeIdx===i?'text-white':'text-emerald-500'}/>}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Gaya Reenactment</p>
              <div className="space-y-2">
                {VISUAL_STYLES.map(s=>(
                  <button key={s.id} onClick={()=>setSelectedStyleId(s.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-[13px] font-bold transition-all btn-press border
                      ${selectedStyleId===s.id?'border-blue-400 bg-blue-50 text-blue-700':'border-slate-200 text-slate-600 hover:bg-white/80'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handle} disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2.5 btn-press text-[13.5px]">
              {loading ? <RefreshCw size={16} className="animate-spin"/> : <Camera size={16} strokeWidth={2.5}/>}
              Pecah Ke Tabel
            </button>
          </div>
        </div>
        <div className="lg:col-span-9">
          <div className="glass-card rounded-3xl overflow-hidden">
            <div className="p-7 border-b border-slate-100 bg-white/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-[20px] text-slate-900">Bab {chapter.chapterNumber}: <span className="text-slate-500">{chapter.chapterTitle}</span></h3>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1.5"><MapPin size={12}/> Real Asset, Motion & AI</p>
              </div>
              {chapterVis && (
                <div className="flex items-center gap-3 shrink-0">
                  <button onClick={copyTable} className="flex items-center gap-2 text-[13px] font-extrabold bg-white border border-slate-200 px-5 py-2.5 rounded-xl btn-press hover:bg-slate-50 text-slate-700"><Copy size={14}/> Salin</button>
                  <button onClick={()=>setCurrentView('step5')} className="flex items-center gap-2 text-[13px] font-extrabold bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl btn-press transition-colors">Thumbnail <ArrowRight size={14}/></button>
                </div>
              )}
            </div>
            <div className="overflow-x-auto custom-scrollbar">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-500">
                  <RefreshCw size={28} className="animate-spin text-blue-600"/>
                  <span className="font-bold animate-pulse">Menghitung sudut pengambilan gambar...</span>
                </div>
              ) : chapterVis ? (
                <div className="fade-slide">
                  {aiReports[activeIdx] && <div className="m-5 bg-slate-900 text-emerald-400 font-mono text-[12px] p-4 rounded-xl"><CheckCircle2 size={14} className="inline mr-2"/>{aiReports[activeIdx]}</div>}
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead><tr className="border-b-2 border-slate-100 bg-slate-50/50">
                      <th className="p-5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 w-1/4">Adegan & Narasi (IND)</th>
                      <th className="p-5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 w-1/3">Skrip (Inggris)</th>
                      <th className="p-5 text-[11px] font-extrabold uppercase tracking-widest text-slate-400">Instruksi Sutradara (Prompt)</th>
                    </tr></thead>
                    <tbody>
                      {chapterVis.map((sc,i)=>(
                        <tr key={i} className="border-b border-slate-100/80 hover:bg-blue-50/20 transition-colors">
                          <td className="p-5 align-top border-r border-slate-100">
                            <p className="font-extrabold text-blue-600 text-[12px] mb-1.5">Adegan {String(sc.sceneNo).padStart(2,'0')}</p>
                            <p className="text-slate-600 font-medium text-[13px] leading-relaxed">{sc.simpleIndonesian}</p>
                          </td>
                          <td className="p-5 align-top border-r border-slate-100 text-[14px] text-slate-700 font-serif leading-relaxed">"{sc.narration}"</td>
                          <td className="p-5 align-top relative group/cell">
                            <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest rounded-lg border mb-3 ${badgeColor(sc.visualType)}`}>{sc.visualType}</span>
                            <p className="text-slate-600 text-[12.5px] font-mono leading-relaxed">{sc.visualSuggestion}</p>
                            <button onClick={()=>copy(sc.visualSuggestion)} className="absolute top-4 right-4 opacity-0 group-hover/cell:opacity-100 transition-opacity bg-white border border-slate-200 p-2 rounded-lg text-blue-600 btn-press shadow-sm"><Copy size={14}/></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-t border-dashed border-slate-200">
                  <Camera size={30} className="mb-3 text-slate-300 float" strokeWidth={1.5}/>
                  <p className="font-semibold text-[14px]">Klik tombol di sisi kiri untuk memecah skrip menjadi matriks gambar.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Step 5: Thumbnail ─────────────────────── */
const ThumbnailGenerator = ({ topic, setCurrentView, thumbnailData, setThumbnailData, characterPrompt }) => {
  const [texts, setTexts]         = useState(thumbnailData?.texts || []);
  const [selected, setSelected]   = useState(thumbnailData?.selectedText || '');
  const [prompt, setPrompt]       = useState(thumbnailData?.prompt || '');
  const [loadTxt, setLoadTxt]     = useState(false);
  const [loadPrm, setLoadPrm]     = useState(false);
  const [copied, setCopied]       = useState(false);
  if (!topic) return <EmptyState icon={Video} text="Pilih topik terlebih dahulu."/>;

  const genTexts = async () => {
    setLoadTxt(true);
    const r = await generateThumbnailTextsAPI(topic);
    if (r) { setTexts(r); setSelected(''); setPrompt(''); }
    setLoadTxt(false);
  };
  const genPrompt = async () => {
    if (!selected) return;
    setLoadPrm(true);
    const r = await generateThumbnailPromptAPI(topic, selected, characterPrompt);
    if (r) { setPrompt(r); setThumbnailData({ texts, selectedText: selected, prompt: r }); }
    setLoadPrm(false);
  };
  const doCopy = () => { copy(prompt); setCopied(true); setTimeout(()=>setCopied(false),2000); };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto fade-slide">
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Pembuat Thumbnail</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Generate teks viral dan prompt AI untuk thumbnail YouTube.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-7 rounded-3xl space-y-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Opsi Teks Thumbnail</p>
            <button onClick={genTexts} disabled={loadTxt} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[12px] font-extrabold px-4 py-2 rounded-lg btn-press disabled:bg-slate-200 disabled:text-slate-400">
              {loadTxt ? <RefreshCw size={13} className="animate-spin"/> : <RefreshCw size={13}/>} Generate
            </button>
          </div>
          {texts.length > 0 ? (
            <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
              {texts.map((t,i)=>(
                <button key={i} onClick={()=>setSelected(t)}
                  className={`text-left p-3 rounded-xl text-[13px] font-bold transition-all btn-press border
                    ${selected===t?'bg-blue-600 text-white border-blue-600':'bg-white border-slate-200 text-slate-700 hover:border-blue-300'}`}>
                  {t}
                </button>
              ))}
            </div>
          ) : (
            <div className="h-48 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
              <p className="text-[13px] font-medium">Klik Generate untuk membuat teks thumbnail.</p>
            </div>
          )}
          {selected && (
            <button onClick={genPrompt} disabled={loadPrm}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold py-3.5 rounded-xl btn-press btn-glow-blue flex items-center justify-center gap-2 text-[13.5px]">
              {loadPrm ? <RefreshCw size={15} className="animate-spin"/> : <Camera size={15}/>} Generate Prompt AI
            </button>
          )}
        </div>
        <div className="glass-card p-7 rounded-3xl">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Prompt AI Thumbnail</p>
          {prompt ? (
            <div className="fade-in">
              {selected && <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-blue-700 font-extrabold text-[13px] mb-4 flex items-center gap-2"><Video size={14}/> "{selected}"</div>}
              <div className="bg-slate-900 text-emerald-400 font-mono text-[12.5px] p-5 rounded-2xl leading-relaxed mb-5 whitespace-pre-wrap min-h-[180px]">{prompt}</div>
              <div className="flex gap-3">
                <button onClick={doCopy} className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 text-slate-700 font-extrabold py-3 rounded-xl btn-press text-[13px]">
                  <Copy size={14}/> {copied ? 'Tersalin!' : 'Salin Prompt'}
                </button>
                <button onClick={()=>setCurrentView('step6')} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl btn-press btn-glow-blue text-[13px]">
                  Lanjut SEO <ArrowRight size={14}/>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-64 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
              <p className="text-[13px] font-medium">Pilih teks → Generate Prompt AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Step 6: SEO ───────────────────────────── */
const SEOPackage = ({ topic, scriptData, seoData, setSeoData, setCurrentView }) => {
  const [loading, setLoading] = useState(false);
  if (!topic) return <EmptyState icon={TrendingUp} text="Pilih topik terlebih dahulu."/>;

  const handle = async () => {
    setLoading(true);
    const r = await generateSEOAPI(topic, scriptData);
    if (r) setSeoData(r);
    setLoading(false);
  };
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto fade-slide">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Paket SEO</h2>
          <p className="text-slate-500 font-medium text-[15px] mt-1">Metadata YouTube yang dioptimasi untuk algoritma pencarian.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handle} disabled={loading} className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold px-6 py-3 rounded-xl btn-press text-[14px]">
            {loading ? <RefreshCw size={16} className="animate-spin"/> : <TrendingUp size={16}/>} {seoData?'Kalkulasi Ulang':'Generate SEO'}
          </button>
          {seoData && <button onClick={()=>setCurrentView('step7')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-6 py-3 rounded-xl btn-press btn-glow-blue text-[14px]">Prompt Produksi <ArrowRight size={16}/></button>}
        </div>
      </div>
      {!seoData && !loading && (
        <div className="h-72 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center text-slate-400 bg-white/30">
          <TrendingUp size={36} className="mb-4 text-slate-300 float" strokeWidth={1.5}/>
          <p className="font-semibold text-[15px]">Klik Generate SEO untuk kalkulasi metadata.</p>
        </div>
      )}
      {loading && (
        <div className="space-y-4">
          {[1,2,3].map(i=><div key={i} className="glass-card rounded-2xl p-6"><div className="shimmer-load h-4 w-3/4 rounded mb-3"/><div className="shimmer-load h-3 w-full rounded mb-2"/><div className="shimmer-load h-3 w-1/2 rounded"/></div>)}
        </div>
      )}
      {seoData && !loading && (
        <div className="fade-slide space-y-5">
          {seoData.titles?.length > 0 && (
            <div className="glass-card p-7 rounded-3xl">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-5 flex items-center gap-2"><Type size={14}/> Opsi Judul Video</p>
              <div className="space-y-3">
                {seoData.titles.map((t,i)=>(
                  <div key={i} className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <span className="bg-slate-100 text-slate-600 font-extrabold text-[11px] w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-[14px]">{typeof t==='object'?t.text:t}</p>
                      {typeof t==='object' && <p className="text-[11px] text-slate-400 mt-0.5 font-medium">{t.charCount} chars · Rating {t.rating}/10</p>}
                    </div>
                    <button onClick={()=>copy(typeof t==='object'?t.text:t)} className="shrink-0 text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Copy size={14}/></button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {seoData.description && (
            <div className="glass-card p-7 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2"><AlignLeft size={14}/> Deskripsi Video</p>
                <button onClick={()=>copy(seoData.description)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Copy size={15}/></button>
              </div>
              <div className="bg-slate-50 p-5 rounded-2xl text-[14.5px] text-slate-700 leading-relaxed font-medium border border-slate-100">{seoData.description}</div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {seoData.tags?.length > 0 && (
              <div className="glass-card p-7 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2"><Tag size={14}/> Tags</p>
                  <button onClick={()=>copy(Array.isArray(seoData.tags)?seoData.tags.join(', '):seoData.tags)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Copy size={15}/></button>
                </div>
                <div className="flex flex-wrap gap-2">{(Array.isArray(seoData.tags)?seoData.tags:[seoData.tags]).map((t,i)=><span key={i} className="bg-white border border-slate-200 text-slate-700 px-3.5 py-1.5 rounded-xl text-[13px] font-semibold">{t}</span>)}</div>
              </div>
            )}
            {seoData.hashtags?.length > 0 && (
              <div className="glass-card p-7 rounded-3xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2"><Hash size={14}/> Hashtags</p>
                  <button onClick={()=>copy(Array.isArray(seoData.hashtags)?seoData.hashtags.join(' '):seoData.hashtags)} className="text-slate-400 hover:text-blue-600 p-2 hover:bg-blue-50 rounded-lg transition-colors"><Copy size={15}/></button>
                </div>
                <div className="flex flex-wrap gap-2">{(Array.isArray(seoData.hashtags)?seoData.hashtags:[seoData.hashtags]).map((t,i)=><span key={i} className="bg-blue-50 border border-blue-200 text-blue-700 px-3.5 py-1.5 rounded-xl text-[13px] font-extrabold">{t}</span>)}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Step 7: Production Prompt ─────────────── */
const PromptProduction = ({ visualData, scriptData, characterPrompt, activeVisualStyle, productionData, setProductionData, setCurrentView }) => {
  const [loading, setLoading]   = useState(false);
  const [activeBab, setActiveBab] = useState(0);
  const [results, setResults]   = useState(productionData || {});

  const MASTER_PROMPT_LABEL = `Rewrite Master Prompt v1.0 — Documentary/True Crime`;

  const handle = async () => {
    if (!visualData?.[activeBab]) return;
    setLoading(true);
    const styleObj = VISUAL_STYLES.find(s=>s.id===activeVisualStyle) || VISUAL_STYLES[0];
    const scenesText = visualData[activeBab].map(sc =>
      `[SCENE ${sc.sceneNo}] - ${sc.simpleIndonesian}\nSCRIPT: ${sc.narration}\nTYPE: ${sc.visualType}\nVISUAL SUGGESTION: ${sc.visualSuggestion}`
    ).join('\n\n');
    const r = await generateProductionPromptsAPI(scenesText, characterPrompt, styleObj.label);
    if (r) {
      const updated = {...results, [activeBab]: r};
      setResults(updated);
      setProductionData(updated);
    }
    setLoading(false);
  };

  const copyAll = () => { if (results[activeBab]) copy(results[activeBab]); };

  // Parse output into blocks
  const parseBlocks = (text) => {
    if (!text) return [];
    return text.split(/\n\s*\n/).filter(b=>b.trim().startsWith('SCENE'));
  };

  if (!visualData) return <EmptyState icon={Layers} text="Selesaikan Tabel Scene terlebih dahulu."/>;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto fade-slide">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-1.5 rounded-full text-[11px] font-extrabold tracking-widest uppercase border border-purple-100 mb-4"><Wand2 size={11}/> AI Rewriter</div>
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Prompt Produksi</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Tulis ulang visual suggestion menjadi prompt sinematik final + negative prompt siap pakai.</p>
      </div>

      <div className="glass-card p-5 rounded-2xl mb-6 border border-purple-100 bg-purple-50/30">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-purple-600 mb-2 flex items-center gap-1.5"><Wand2 size={12}/> {MASTER_PROMPT_LABEL}</p>
        <p className="text-slate-600 text-[13px] font-medium leading-relaxed">AI akan membaca setiap scene dari tabel visual, lalu menulis ulang menjadi prompt sinematik lengkap (shot type, lens, lighting, texture, color grade) + negative prompt spesifik per scene. Output siap copy-paste ke Seedance, Higgsfield, Kling, dll.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-3">
          <div className="glass-card p-6 rounded-3xl sticky top-24 space-y-4">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Pilih Bab</p>
            {scriptData?.map((ch,i)=>(
              <button key={i} onClick={()=>setActiveBab(i)}
                className={`w-full text-left px-4 py-3 rounded-xl text-[13.5px] font-bold transition-all btn-press flex items-center justify-between border
                  ${activeBab===i?'bg-purple-600 text-white border-purple-600':'border-slate-200 bg-white/60 text-slate-600 hover:border-purple-300'}`}>
                Bab {ch.chapterNumber}
                {results[i] && <CheckCircle2 size={15} strokeWidth={3} className={activeBab===i?'text-white':'text-emerald-500'}/>}
              </button>
            ))}
            <button onClick={handle} disabled={loading || !visualData?.[activeBab]}
              className="w-full bg-purple-700 hover:bg-purple-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold rounded-xl px-4 py-3.5 flex items-center justify-center gap-2 btn-press text-[13.5px] mt-2">
              {loading ? <RefreshCw size={16} className="animate-spin"/> : <Wand2 size={16} strokeWidth={2.5}/>}
              {loading ? 'Menulis ulang...' : 'Rewrite Prompt'}
            </button>
            {results[activeBab] && (
              <button onClick={copyAll} className="w-full bg-white border border-slate-200 text-slate-700 font-extrabold rounded-xl px-4 py-3 flex items-center justify-center gap-2 btn-press text-[13px] hover:border-purple-300 hover:text-purple-700">
                <Copy size={14}/> Salin Semua
              </button>
            )}
            {Object.keys(results).length > 0 && (
              <button onClick={()=>setCurrentView('step8')} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl px-4 py-3 flex items-center justify-center gap-2 btn-press btn-glow-blue text-[13px]">
                Export & Tools <ArrowRight size={14}/>
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
              <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6 pulse-ring">
                <Wand2 size={32} className="text-purple-600"/>
              </div>
              <p className="font-extrabold text-[18px] text-slate-800 mb-2">Menulis ulang prompt sinematik...</p>
              <p className="text-slate-500 text-[14px]">AI sedang memproses setiap scene dengan master prompt</p>
            </div>
          ) : results[activeBab] ? (
            <div className="space-y-4 fade-slide">
              {parseBlocks(results[activeBab]).map((block, i) => {
                const lines     = block.trim().split('\n');
                const header    = lines[0];
                const negIdx    = lines.findIndex(l=>l.toLowerCase().startsWith('negative prompt'));
                const visual    = lines.slice(1, negIdx>0?negIdx:undefined).join(' ').trim();
                const negative  = negIdx>0 ? lines.slice(negIdx).join(' ').replace(/^negative prompt:\s*/i,'').trim() : '';
                const typeMatch = header.match(/\[(Reenactment|Real Asset|Motion Graphic)\]/i);
                const sceneType = typeMatch?typeMatch[1]:'Reenactment';
                const badgeC    = sceneType==='Real Asset'?'bg-rose-50 border-rose-200 text-rose-700':sceneType==='Motion Graphic'?'bg-indigo-50 border-indigo-200 text-indigo-700':'bg-emerald-50 border-emerald-200 text-emerald-700';
                return (
                  <div key={i} className="glass-card rounded-2xl overflow-hidden border border-slate-100 hover:border-purple-200 transition-colors card-hover">
                    <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-extrabold text-slate-800 text-[13px]">{header.split(':')[0]}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg border ${badgeC}`}>{sceneType}</span>
                      </div>
                      <button onClick={()=>copy(block)} className="text-slate-400 hover:text-purple-600 p-1.5 hover:bg-purple-50 rounded-lg transition-colors btn-press"><Copy size={13}/></button>
                    </div>
                    <div className="p-5 space-y-3">
                      {visual && <p className="text-slate-700 text-[13.5px] font-medium leading-relaxed">{visual}</p>}
                      {negative && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                          <p className="text-[10px] font-extrabold uppercase tracking-widest text-red-400 mb-1">Negative Prompt</p>
                          <p className="text-red-700 text-[12.5px] font-medium">{negative}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass-card rounded-3xl h-80 flex flex-col items-center justify-center text-slate-400 border border-dashed border-slate-200">
              <Wand2 size={36} className="mb-4 text-slate-300 float" strokeWidth={1.5}/>
              <p className="font-semibold text-[15px]">Pilih bab dan klik Rewrite Prompt.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ── Step 8: Export & Tools ────────────────── */
const ExportTools = ({ topic, scriptData, characterPrompt, visualData, thumbnailData, seoData, productionData }) => {

  const downloadTxt = () => {
    let c = `=========================================\n         NARRATIVE STUDIO PROJECT        \n=========================================\n\n`;
    if (topic) c += `--- [1] TOPIK & DATA UTAMA ---\n\nJudul: ${topic.title}\nProtagonist: ${topic.protagonist}\nAntagonist: ${topic.antagonist}\nLokasi: ${topic.location}\nTahun: ${topic.year}\nRingkasan: ${topic.shortSummary}\n\n=========================================\n\n`;
    if (scriptData) { c += `--- [2] SKRIP IMERSIF (POV) ---\n\n`; scriptData.forEach(ch=>{ c += `BAB ${ch.chapterNumber}: ${ch.chapterTitle} (${ch.wordCount} Kata)\n\n${ch.content}\n\n-----------------------------------------\n\n`; }); c += `=========================================\n\n`; }
    if (characterPrompt) c += `--- [3] PROMPT DESAIN KARAKTER ---\n\n${characterPrompt}\n\n=========================================\n\n`;
    if (visualData) { c += `--- [4] TABEL SCENE & VISUAL ---\n\n`; visualData.forEach((vs,i)=>{ if(vs){ c+=`>> VISUAL BAB ${i+1}\n\n`; vs.forEach(sc=>{ c+=`[Adegan ${String(sc.sceneNo).padStart(2,'0')}]\nTipe: ${sc.visualType}\nNarasi IND: ${sc.simpleIndonesian}\nSCRIPT: ${sc.narration}\nVISUAL SUGGESTION: ${sc.visualSuggestion}\n\n`; }); c+=`-----------------------------------------\n\n`; } }); c+=`=========================================\n\n`; }
    if (productionData && Object.keys(productionData).length>0) { c+=`--- [5] PROMPT PRODUKSI SINEMATIK ---\n\n`; Object.entries(productionData).forEach(([i,txt])=>{ c+=`>> BAB ${Number(i)+1}\n\n${txt}\n\n-----------------------------------------\n\n`; }); c+=`=========================================\n\n`; }
    if (thumbnailData) c += `--- [6] DESAIN THUMBNAIL ---\n\nTeks: ${thumbnailData.selectedText||'Belum dipilih'}\n\nPrompt:\n${thumbnailData.prompt||'Belum di-generate'}\n\n=========================================\n\n`;
    if (seoData) { c+=`--- [7] SEO & METADATA ---\n\nJudul:\n`; seoData.titles?.forEach((t,i)=>{ const txt=typeof t==='object'?`${t.text}${t.rating?` (${t.rating}/10)`:''}`:`${t}`; c+=`${i+1}. ${txt}\n`; }); c+=`\nDeskripsi:\n${seoData.description}\n\nTags: ${seoData.tags?.join(', ')}\n\nHashtags: ${seoData.hashtags?.join(' ')}\n\n=========================================\n`; }
    const blob = new Blob([c], {type:'text/plain;charset=utf-8'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `${topic?.title?.replace(/[^a-z0-9]/gi,'_').toLowerCase()||'project'}_narrava.txt`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const downloadExcel = () => {
    // Collect all script sentences from visualData
    const rows = [];
    if (visualData) {
      visualData.forEach(vs => {
        if (vs) vs.forEach(sc => { rows.push(sc.narration || sc.simpleIndonesian || ''); });
      });
    } else if (scriptData) {
      // fallback: split scripts by sentence
      scriptData.forEach(ch => {
        const sentences = (ch.content||'').split(/(?<=[.!?])\s+/).filter(s=>s.trim().length>10);
        sentences.forEach(s => rows.push(s.trim()));
      });
    }
    if (rows.length === 0) { alert('Tidak ada data scene. Selesaikan Tabel Scene terlebih dahulu.'); return; }

    // Generate Excel HTML table (compatible with Excel)
    const header = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="UTF-8"><style>
th { background:#1e293b; color:white; font-weight:bold; padding:10px 14px; border:1px solid #334155; }
td { padding:8px 14px; border:1px solid #e2e8f0; vertical-align:top; }
tr:nth-child(even) td { background:#f8fafc; }
</style></head><body><table>
<tr><th>SCRIP</th><th>NAMA GAMBAR</th></tr>`;
    const body = rows.map((r,i) => `<tr><td>${r.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</td><td>Gambar_yang_dihasilkan_${String(i+1).padStart(3,'0')}</td></tr>`).join('');
    const footer = `</table></body></html>`;
    const blob = new Blob([header+body+footer], {type:'application/vnd.ms-excel;charset=utf-8'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `SCRIPT_NAMA_GAMBAR_${rows.length}_SCENE.xls`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const voiceTools = [
    { name:'Cartesia AI', desc:'Text-to-speech premium dengan berbagai karakter suara sinematik.', url:'https://play.cartesia.ai/dashboard', color:'blue', icon:'🎙️' },
    { name:'KikiVoice AI', desc:'AI voice generator untuk narasi video dokumenter Indonesia.', url:'https://kikivoice.ai/', color:'violet', icon:'🔊' },
  ];
  const genTools = [
    { name:'Google Flow', desc:'Generate gambar massal dari prompt list.', url:'https://flow.google.com/shared/tool/dfe84d08-f52b-449e-b4ec-4b9b808151da', color:'emerald', icon:'🖼️' },
  ];

  if (!topic) return <EmptyState icon={Download} text="Tidak ada proyek aktif untuk diekspor."/>;

  const hasProduction = productionData && Object.keys(productionData).length > 0;
  const sceneCount = visualData ? visualData.flatMap(v=>v||[]).length : 0;

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto fade-slide">
      <div className="mb-8">
        <h2 className="text-[32px] font-extrabold tracking-tight text-slate-900">Export & Tools</h2>
        <p className="text-slate-500 font-medium text-[15px] mt-1">Download hasil proyek dan akses tools produksi video kamu.</p>
      </div>

      {/* Status badges */}
      <div className="glass-card p-5 rounded-2xl mb-6 flex flex-wrap gap-2.5">
        <span className="text-[11px] font-extrabold text-slate-700 self-center mr-2">Status Proyek:</span>
        {topic      && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-extrabold text-[11px]">✓ Topik</span>}
        {scriptData && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-extrabold text-[11px]">✓ Skrip</span>}
        {visualData && <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-xl font-extrabold text-[11px]">✓ Visual ({sceneCount} scene)</span>}
        {hasProduction && <span className="bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl font-extrabold text-[11px]">✓ Prompt Produksi</span>}
        {seoData    && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-xl font-extrabold text-[11px]">✓ SEO</span>}
      </div>

      {/* Download section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
        {/* TXT */}
        <div className="glass-card p-7 rounded-3xl card-hover border border-transparent">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-5 border border-blue-100">
            <FileText size={22} className="text-blue-600"/>
          </div>
          <h3 className="font-extrabold text-[16px] text-slate-900 mb-2">{topic.title}</h3>
          <p className="text-slate-500 text-[13px] font-medium mb-6 leading-relaxed">Semua data proyek: skrip, visual table, prompt produksi, thumbnail, dan SEO dalam satu file .txt.</p>
          <button onClick={downloadTxt} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3.5 rounded-xl btn-press btn-glow-blue flex items-center justify-center gap-2 text-[14px]">
            <Download size={16}/> Unduh Semua Data (.txt)
          </button>
        </div>

        {/* Excel */}
        <div className="glass-card p-7 rounded-3xl card-hover border border-transparent">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100">
            <FileSpreadsheet size={22} className="text-emerald-600"/>
          </div>
          <h3 className="font-extrabold text-[16px] text-slate-900 mb-2">Export Excel</h3>
          <p className="text-slate-500 text-[13px] font-medium mb-2 leading-relaxed">Format SCRIP | NAMA GAMBAR siap digunakan untuk generate massal di Google Flow.</p>
          {sceneCount > 0 && <p className="text-emerald-600 font-extrabold text-[12px] mb-5">✓ {sceneCount} scene terdeteksi → {sceneCount} baris excel</p>}
          <button onClick={downloadExcel} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl btn-press flex items-center justify-center gap-2 text-[14px] shadow-[0_6px_20px_-4px_rgba(16,185,129,0.4)]">
            <FileSpreadsheet size={16}/> Download Excel (.xls)
          </button>
        </div>
      </div>

      {/* Voice Over Tools */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-violet-100 rounded-xl flex items-center justify-center"><Mic2 size={16} className="text-violet-600"/></div>
          <h3 className="font-extrabold text-[16px] text-slate-900">Voice Over Tools</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {voiceTools.map(t=>(
            <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
              className="glass-card p-6 rounded-2xl card-hover border border-transparent flex items-start gap-4 group">
              <div className="text-2xl">{t.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-extrabold text-slate-800 text-[14px]">{t.name}</h4>
                  <ExternalLink size={13} className="text-slate-400 group-hover:text-blue-500 transition-colors"/>
                </div>
                <p className="text-slate-500 text-[12.5px] font-medium leading-snug">{t.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Generator Tools */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center"><ImageIcon size={16} className="text-emerald-600"/></div>
          <h3 className="font-extrabold text-[16px] text-slate-900">Image Generator</h3>
        </div>
        {genTools.map(t=>(
          <a key={t.name} href={t.url} target="_blank" rel="noopener noreferrer"
            className="glass-card p-6 rounded-2xl card-hover border border-transparent flex items-start gap-4 group block">
            <div className="text-2xl">{t.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-extrabold text-slate-800 text-[14px]">{t.name}</h4>
                <ExternalLink size={13} className="text-slate-400 group-hover:text-blue-500 transition-colors"/>
              </div>
              <p className="text-slate-500 text-[12.5px] font-medium">{t.desc}</p>
              <p className="text-emerald-600 text-[11px] font-extrabold mt-2">→ Upload file Excel SCRIP_NAMA_GAMBAR di sini untuk generate massal</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

/* ── Main App ──────────────────────────────── */
export default function App() {
  const [sidebarOpen, setSidebarOpen]       = useState(false);
  const [view, setView]                     = useState('dashboard');
  const [activeNiche, setActiveNiche]       = useState('true_crime');
  const [activeVisualStyle, setActiveVisualStyle] = useState('cinematic');
  const [selectedTopic, setSelectedTopic]   = useState(null);
  const [scriptData, setScriptData]         = useState(null);
  const [characterPrompt, setCharacterPrompt] = useState('');
  const [visualData, setVisualData]         = useState(null);
  const [thumbnailData, setThumbnailData]   = useState(null);
  const [seoData, setSeoData]               = useState(null);
  const [productionData, setProductionData] = useState(null);

  const handleSelectTopic = (t) => {
    setSelectedTopic(t); setScriptData(null); setCharacterPrompt('');
    setVisualData(null); setThumbnailData(null); setSeoData(null); setProductionData(null);
    setView('step2');
  };

  const viewToStep = { step1:1, step2:2, step3:3, step4:4, step5:5, step6:6, step7:7, step8:8 };
  const currentStep = viewToStep[view] || 0;

  useEffect(() => { window.scrollTo({ top:0, behavior:'smooth' }); }, [view]);

  return (
    <div className="flex h-screen w-full bg-[#F4F7FF] bg-dots font-sans text-slate-900 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/4 blur-[100px] pointer-events-none z-0"/>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-500/4 blur-[100px] pointer-events-none z-0"/>

      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} currentView={view} setCurrentView={setView}/>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile header */}
        <div className="lg:hidden bg-white/90 backdrop-blur-xl border-b border-slate-100 p-4 flex items-center justify-between sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={()=>setSidebarOpen(true)} className="text-slate-600 hover:text-blue-600 transition-colors"><Menu size={22}/></button>
            <span className="font-extrabold text-[15px] text-slate-900">Narrava <span className="text-blue-600 font-bold">Pro</span></span>
          </div>
        </div>
        {/* Progress bar */}
        {currentStep > 0 && <div className="hidden lg:block"><ProgressBar currentStep={currentStep}/></div>}
        {/* Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
          {view==='dashboard' && <Dashboard setCurrentView={setView}/>}
          {view==='step1'     && <TopicResearch onSelectTopic={handleSelectTopic} activeNiche={activeNiche} setActiveNiche={setActiveNiche}/>}
          {view==='step2'     && <ScriptGenerator topic={selectedTopic} niche={activeNiche} setCurrentView={setView} scriptData={scriptData} setScriptData={setScriptData}/>}
          {view==='step3'     && <CharacterDesign topic={selectedTopic} setCurrentView={setView} characterPrompt={characterPrompt} setCharacterPrompt={setCharacterPrompt}/>}
          {view==='step4'     && <VisualResearch scriptData={scriptData} visualData={visualData} setVisualData={setVisualData} characterPrompt={characterPrompt} setCurrentView={setView} topic={selectedTopic}/>}
          {view==='step5'     && <ThumbnailGenerator topic={selectedTopic} setCurrentView={setView} thumbnailData={thumbnailData} setThumbnailData={setThumbnailData} characterPrompt={characterPrompt}/>}
          {view==='step6'     && <SEOPackage topic={selectedTopic} scriptData={scriptData} seoData={seoData} setSeoData={setSeoData} setCurrentView={setView}/>}
          {view==='step7'     && <PromptProduction visualData={visualData} scriptData={scriptData} characterPrompt={characterPrompt} activeVisualStyle={activeVisualStyle} productionData={productionData} setProductionData={setProductionData} setCurrentView={setView}/>}
          {view==='step8'     && <ExportTools topic={selectedTopic} scriptData={scriptData} characterPrompt={characterPrompt} visualData={visualData} thumbnailData={thumbnailData} seoData={seoData} productionData={productionData}/>}
        </main>
      </div>
    </div>
  );
}
