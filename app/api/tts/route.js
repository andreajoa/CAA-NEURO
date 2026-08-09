export const runtime = "nodejs";

import { auth } from "@clerk/nextjs/server";
import { checkRateLimit } from "../../../lib/rateLimit";

const VOICES = {
  "pt-BR": {
    FEMALE:  { languageCode: "pt-BR", name: "pt-BR-Neural2-C", ssmlGender: "FEMALE" },
    MALE:    { languageCode: "pt-BR", name: "pt-BR-Neural2-B", ssmlGender: "MALE" },
    NEUTRAL: { languageCode: "pt-BR", name: "pt-BR-Neural2-A", ssmlGender: "FEMALE" },
    CHILD:   { languageCode: "pt-BR", name: "pt-BR-Standard-C", ssmlGender: "FEMALE" },
  },
  "pt-PT": {
    FEMALE:  { languageCode: "pt-PT", name: "pt-PT-Neural2-A", ssmlGender: "FEMALE" },
    MALE:    { languageCode: "pt-PT", name: "pt-PT-Neural2-B", ssmlGender: "MALE" },
    NEUTRAL: { languageCode: "pt-PT", name: "pt-PT-Neural2-A", ssmlGender: "FEMALE" },
    CHILD:   { languageCode: "pt-PT", name: "pt-PT-Standard-A", ssmlGender: "FEMALE" },
  },
  "en-US": {
    FEMALE:  { languageCode: "en-US", name: "en-US-Neural2-F", ssmlGender: "FEMALE" },
    MALE:    { languageCode: "en-US", name: "en-US-Neural2-D", ssmlGender: "MALE" },
    NEUTRAL: { languageCode: "en-US", name: "en-US-Neural2-A", ssmlGender: "MALE" },
    CHILD:   { languageCode: "en-US", name: "en-US-Neural2-F", ssmlGender: "FEMALE" },
  },
  "es-ES": {
    FEMALE:  { languageCode: "es-ES", name: "es-ES-Neural2-A", ssmlGender: "FEMALE" },
    MALE:    { languageCode: "es-ES", name: "es-ES-Neural2-B", ssmlGender: "MALE" },
    NEUTRAL: { languageCode: "es-ES", name: "es-ES-Neural2-A", ssmlGender: "FEMALE" },
    CHILD:   { languageCode: "es-ES", name: "es-ES-Neural2-A", ssmlGender: "FEMALE" },
  },
  "fr-FR": {
    FEMALE:  { languageCode: "fr-FR", name: "fr-FR-Neural2-A", ssmlGender: "FEMALE" },
    MALE:    { languageCode: "fr-FR", name: "fr-FR-Neural2-B", ssmlGender: "MALE" },
    NEUTRAL: { languageCode: "fr-FR", name: "fr-FR-Neural2-A", ssmlGender: "FEMALE" },
    CHILD:   { languageCode: "fr-FR", name: "fr-FR-Neural2-A", ssmlGender: "FEMALE" },
  },
  "de-DE": {
    FEMALE:  { languageCode: "de-DE", name: "de-DE-Neural2-A", ssmlGender: "FEMALE" },
    MALE:    { languageCode: "de-DE", name: "de-DE-Neural2-B", ssmlGender: "MALE" },
    NEUTRAL: { languageCode: "de-DE", name: "de-DE-Neural2-A", ssmlGender: "FEMALE" },
    CHILD:   { languageCode: "de-DE", name: "de-DE-Neural2-A", ssmlGender: "FEMALE" },
  },
};

// Mapeamento lang code → código da Translate API
const LANG_TO_TRANSLATE = {
  "pt-BR": "pt", "pt-PT": "pt", "en-US": "en",
  "es-ES": "es", "fr-FR": "fr", "de-DE": "de",
};

// Traduz texto usando Google Translate API
async function translateText(text, targetLang, apiKey) {
  if (targetLang === "pt") return text; // já está em PT, não traduz
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: "pt", target: targetLang, format: "text" }),
      }
    );
    const data = await res.json();
    return data?.data?.translations?.[0]?.translatedText || text;
  } catch {
    return text; // fallback: usa o texto original se tradução falhar
  }
}

function profileToGender(profile, age) {
  if (age && Number(age) < 16) return "CHILD";
  if (profile === "infantil" || profile === "escolar") return "CHILD";
  if (profile === "idoso") return "NEUTRAL";
  return "NEUTRAL";
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
    const requester = userId || `public:${forwardedFor || "unknown"}`;
    const rateLimit = await checkRateLimit(requester, "tts");
    if (!rateLimit.allowed) {
      return Response.json({ error: rateLimit.message }, { status: 429 });
    }

    const { text, lang = "pt-BR", gender = "NEUTRAL", profile, age, rate = 0.9 } = await request.json();
    if (!text?.trim()) return Response.json({ error: "Texto obrigatório" }, { status: 400 });

    const textToSpeak = text.trim().slice(0, 500);
    const speakingRate = Math.min(1.3, Math.max(0.6, Number(rate) || 0.9));

    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    if (!apiKey) {
      return Response.json({ fallback: true, lang, text, translatedText: textToSpeak });
    }

    // ── TRADUÇÃO: se o idioma não for PT, traduz antes de falar ──
    const translateTarget = LANG_TO_TRANSLATE[lang] || "pt";
    const translatedText = await translateText(textToSpeak, translateTarget, apiKey);

    const resolvedGender = gender !== "NEUTRAL" ? gender : profileToGender(profile, age);
    const langVoices = VOICES[lang] || VOICES["pt-BR"];
    const voice = langVoices[resolvedGender] || langVoices["NEUTRAL"];

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: translatedText },
          voice,
          audioConfig: {
            audioEncoding: "MP3",
            speakingRate,
            pitch: resolvedGender === "CHILD" ? 2 : 0,
            effectsProfileId: ["handset-class-device"],
          },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok || data.error) {
      console.error("TTS neural falhou:", data.error?.message, "— tentando Standard");
      const fallbackVoice = {
        languageCode: voice.languageCode,
        name: voice.name.replace("Neural2", "Standard").replace("Neural", "Standard"),
        ssmlGender: voice.ssmlGender,
      };
      const res2 = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text: translatedText },
            voice: fallbackVoice,
            audioConfig: { audioEncoding: "MP3", speakingRate, pitch: 0 },
          }),
        }
      );
      const data2 = await res2.json();
      if (!res2.ok || data2.error) {
        return Response.json({ fallback: true, lang, text, translatedText });
      }
      return Response.json({ audio: data2.audioContent, voice: fallbackVoice.name, quality: "standard" });
    }

    return Response.json({ audio: data.audioContent, voice: voice.name, quality: "neural" });
  } catch (e) {
    return Response.json({ fallback: true, error: e.message });
  }
}
