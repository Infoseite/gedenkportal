import { GoogleGenAI } from "@google/genai";

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { tab, keyword, max, maxChars } = JSON.parse(event.body || "{}");

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    const n = Math.min(Number(max || 3), 3);

    const kind =
      tab === "kerze" ? "Gedenkkerze" :
      tab === "kondolenzbuch" ? "Kondolenzbuch-Eintrag" :
      "persönliche Worte";

    const limitLine =
      tab === "kerze"
        ? `Jeder Vorschlag MUSS maximal ${Number(maxChars || 120)} Zeichen (inkl. Leerzeichen) haben.`
        : `Würdevoll, warm, nicht kitschig, neutral formuliert (keine Religion erzwingen).`;

    const prompt =
`Du schreibst würdige, einfühlsame Trauertexte auf Deutsch (Österreich passt).
Gib GENAU ${n} Vorschläge als JSON zurück.
Keine Emojis. Keine Nummerierung im Text.
${limitLine}

Antwortformat (nur JSON):
{ "texts": ["...", "...", "..."] }

Erstelle ${n} Vorschläge für: ${kind}.
Name/Stichwort: "${(keyword || "").trim() || "—"}"`;

    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const out = resp.text || "";
    let parsed;
    try { parsed = JSON.parse(out); }
    catch { parsed = { texts: [out].filter(Boolean) }; }

    const texts = Array.isArray(parsed.texts) ? parsed.texts.slice(0, 3) : [];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server error", details: String(err?.message || err) }),
    };
  }
};
