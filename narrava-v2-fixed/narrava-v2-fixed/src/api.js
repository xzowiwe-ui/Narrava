// Narrava API — semua request lewat Netlify proxy (/api/ai)
// TIDAK ada direct call ke AI server dari browser (mencegah CORS error)
const AI_PROXY = '/api/ai';

const MASTER_PROMPT = `You are NARRAVA — a world-class YouTube content production system.
RULES:
1. ACCURACY over creativity — rules always win.
2. ALL content output MUST be in ENGLISH.
3. Return ONLY valid JSON, no text outside JSON.
4. Every output MUST include validationChecklist property.
5. Character, location, visual style references MUST be consistent.`;

function getCfg() {
  return {
    apiKey:    localStorage.getItem('nrv2_api_key')   || '',
    model:     localStorage.getItem('nrv2_model')     || 'deepseek-v4-flash',
    provider:  localStorage.getItem('nrv2_provider')  || 'geraikita',
    targetUrl: localStorage.getItem('nrv2_target_url')|| '',
  };
}

export async function callHermes({ systemPrompt, userMessage, jsonMode = false }) {
  const cfg = getCfg();
  if (!cfg.apiKey) {
    throw new Error('API Key belum diisi. Buka ⚙️ Settings dan masukkan API key Geraikita atau 9Router.');
  }

  const sysContent = jsonMode
    ? systemPrompt + '\n\nCRITICAL: Your ENTIRE response must be a single valid JSON object. No markdown, no explanation, no text before or after the JSON. Start with { and end with }.'
    : systemPrompt;
  const userContent = jsonMode
    ? userMessage + '\n\nREMINDER: Respond with ONLY valid JSON. No markdown fences, no explanation.'
    : userMessage;

  const messages = [
    { role: 'system', content: sysContent },
    { role: 'user',   content: userContent }
  ];

  const body = {
    apiKey: cfg.apiKey,
    model:  cfg.model,
    provider: cfg.provider,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
  };
  if (cfg.provider === '9router' && cfg.targetUrl) {
    body.targetUrl = cfg.targetUrl;
  }

  const res = await fetch(AI_PROXY, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: 'Server error ' + res.status } }));
    throw new Error(err?.error?.message || 'API Error ' + res.status);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content ?? '';

  if (jsonMode) {
    try { return JSON.parse(text); } catch {}
    try { const m = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/); if (m) return JSON.parse(m[0]); } catch {}
    try { return JSON.parse(text.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim()); } catch {}
    return text;
  }
  return text;
}

export async function generateTopicsAPI(niche, origin, category, count) {
  const nicheInstructions = niche === 'true_crime'
    ? 'Must be real True Crime or Historical mysteries. Properties: title, protagonist, antagonist, location, year, shortSummary, overallScore.'
    : 'Must be realistic Betrayal/Revenge/Reddit-style stories. Same properties.';
  const systemPrompt = `${MASTER_PROMPT}\n\nTASK - TOPIC RESEARCH:\nGenerate ${count} viral topics for niche: ${niche}.\n${nicheInstructions}\nReturn ONLY valid JSON: {"topics":[...]}. overallScore is virality 1-100.`;
  const result = await callHermes({ systemPrompt, userMessage: `Generate ${count} topics. Category: ${category}. Origin: ${origin}.`, jsonMode: true });
  return result?.topics ?? (Array.isArray(result) ? result : null);
}

export async function generateScriptAPI(topic, duration, niche, currentScriptData) {
  const totalWords      = duration * 140;
  const wordsPerChapter = Math.round(totalWords / 4);
  const minWords        = Math.floor(wordsPerChapter * 0.95);
  const maxWords        = Math.ceil(wordsPerChapter * 1.05);
  const context         = currentScriptData ? `\n\nExisting script to fix:\n${JSON.stringify(currentScriptData)}` : '';
  const systemPrompt    = `${MASTER_PROMPT}\n\nTASK - SCRIPT:\nWrite immersive 4-chapter script SECOND PERSON POV ("You").\nTotal: ${totalWords} words. Per chapter: ${wordsPerChapter} words (tolerance: ${minWords}-${maxWords}).\nReturn JSON: {"validationChecklist":"...","chapters":[{"chapterNumber":1,"chapterTitle":"...","content":"...","wordCount":0}]}`;
  const result = await callHermes({ systemPrompt, userMessage: `Title: ${topic.title}. Protagonist: ${topic.protagonist}. Antagonist: ${topic.antagonist}. Location: ${topic.location}. Summary: ${topic.shortSummary}.${context}`, jsonMode: true });
  if (typeof result === 'string' && result.length > 0) {
    const chunkSize = Math.ceil(result.length / 4);
    return { validationChecklist: 'auto-converted', chapters: [1,2,3,4].map(n => ({ chapterNumber: n, chapterTitle: `Chapter ${n}`, content: result.substring((n-1)*chunkSize, n*chunkSize).trim(), wordCount: 0 })) };
  }
  return result;
}

export async function generateCharacterAPI(topic, styleObj) {
  const systemPrompt = `${MASTER_PROMPT}\n\nTASK - CHARACTER: Create detailed consistent physical description for Protagonist. Visual style: ${styleObj.label}. Return ONLY plain text prompt in ENGLISH. Max 40 words. No JSON.`;
  return callHermes({ systemPrompt, userMessage: `Protagonist: ${topic.protagonist}. Context: ${topic.shortSummary}`, jsonMode: false });
}

export async function generateVisualTableAPI(chapterContent, visualStyleObj, characterPrompt) {
  const systemPrompt = `You are a film director assistant. For each sentence in the script, create one scene entry with: sceneNo, simpleIndonesian, narration, visualType (Reenactment/Motion Graphic/Real Asset), visualSuggestion. Style: ${visualStyleObj.prompt}. Character: ${characterPrompt}\nReturn ONLY valid JSON: {"validationChecklist":"ok","scenes":[...]}`;
  const result = await callHermes({ systemPrompt, userMessage: `Convert each sentence into one scene entry:\n\n${chapterContent}`, jsonMode: true });
  if (typeof result === 'string') {
    const lines = result.split('\n').filter(l => l.trim());
    return { validationChecklist: 'auto-converted', scenes: lines.map((line, i) => ({ sceneNo: i+1, simpleIndonesian: line.substring(0,80), narration: line, visualType: 'Reenactment', visualSuggestion: `${visualStyleObj.prompt} — ${line.substring(0,60)}` })) };
  }
  return result;
}

export async function generateProductionPromptsAPI(scenesText, characterPrompt, visualStyleLabel) {
  const systemPrompt = `You are an AI visual prompt rewriter for documentary/true crime reenactment videos.\nTASK: Rewrite each scene into a production-ready cinematic prompt.\nRULES:\n1. Include: shot type, lens, lighting, film texture, color mood.\n2. Negative prompt per scene.\n3. Style: ${visualStyleLabel}. Character: ${characterPrompt}\n4. NO bold, NO markdown, NO intro text.`;
  return callHermes({ systemPrompt, userMessage: `Rewrite these scenes into production prompts:\n\n${scenesText}`, jsonMode: false });
}

export async function generateThumbnailTextsAPI(topic) {
  const systemPrompt = `${MASTER_PROMPT}\n\nTASK - THUMBNAIL TEXTS: Generate EXACTLY 10 clickable thumbnail texts. Max 4-5 words. ENGLISH ONLY.\nReturn JSON: {"texts":["text1","text2"]}`;
  const result = await callHermes({ systemPrompt, userMessage: `Case: ${topic?.title}. Protagonist: ${topic?.protagonist}. Antagonist: ${topic?.antagonist}.`, jsonMode: true });
  return result?.texts ?? (Array.isArray(result) ? result : null);
}

export async function generateThumbnailPromptAPI(topic, selectedText, characterPrompt) {
  const systemPrompt = `${MASTER_PROMPT}\n\nTASK - THUMBNAIL PROMPT: Detailed AI image prompt for YouTube horror thumbnail. Character: ${characterPrompt}. Dark eerie background, horror lighting, bold typography. Netflix horror style. Return ONLY plain English prompt text, no JSON.`;
  return callHermes({ systemPrompt, userMessage: `Topic: ${topic?.title}. Selected text: ${selectedText}. Protagonist: ${topic?.protagonist}.`, jsonMode: false });
}

export async function generateSEOAPI(topic, scriptData) {
  const scriptContext = scriptData ? scriptData.map(ch => ch.content).join('\n').substring(0, 5000) : '';
  const systemPrompt  = `${MASTER_PROMPT}\n\nTASK - SEO: Generate YouTube SEO metadata in ENGLISH.\n- 5 title options (50-60 chars, virality rating 1-10)\n- Description 300-500 chars\n- 5-15 tags broad-to-specific\n- 3-5 hashtags\nReturn JSON: {"validationChecklist":"...","titles":[{"no":1,"text":"...","charCount":0,"rating":0,"ratingReason":"..."}],"titleRecommendation":"...","description":"...","tags":["..."],"hashtags":["..."]}`;
  return callHermes({ systemPrompt, userMessage: `Case: ${topic.title}\n\nScript:\n${scriptContext}`, jsonMode: true });
}
