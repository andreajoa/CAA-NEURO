export const runtime = "nodejs";

const VOICES = {
  "pt-BR": { languageCode: "pt-BR", name: "pt-BR-Standard-C", ssmlGender: "FEMALE" },
  "pt-PT": { languageCode: "pt-PT", name: "pt-PT-Standard-A", ssmlGender: "FEMALE" },
  "en-US": { languageCode: "en-US", name: "en-US-Standard-F", ssmlGender: "FEMALE" },
  "es-ES": { languageCode: "es-ES", name: "es-ES-Standard-A", ssmlGender: "FEMALE" },
  "fr-FR": { languageCode: "fr-FR", name: "fr-FR-Standard-A", ssmlGender: "FEMALE" },
  "de-DE": { languageCode: "de-DE", name: "de-DE-Standard-A", ssmlGender: "FEMALE" },
};

export async function POST(request) {
  try {
    const { text, lang = "pt-BR" } = await request.json();
    if (!text?.trim()) return Response.json({ error: "Texto obrigatório" }, { status: 400 });

    const voice = VOICES[lang] || VOICES["pt-BR"];
    const apiKey = process.env.GOOGLE_TTS_API_KEY;

    if (!apiKey) return Response.json({ error: "TTS não configurado" }, { status: 500 });

    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { text: text.slice(0, 500) },
          voice,
          audioConfig: { audioEncoding: "MP3", speakingRate: 0.9, pitch: 0 },
        }),
      }
    );

    const data = await res.json();
    if (!res.ok || data.error) {
      return Response.json({ error: data.error?.message || "Erro TTS" }, { status: 500 });
    }

    return Response.json({ audio: data.audioContent });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
