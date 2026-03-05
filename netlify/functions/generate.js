import OpenAI from "openai";

export default async (req) => {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const { tab, keyword } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    let prompt = "";

    if (tab === "kerze") {
      prompt = `
Schreibe 3 würdige Texte für eine Gedenkkerze.
Maximal 120 Zeichen pro Text.

Name oder Stichwort: ${keyword || "allgemein"}

Antwort nur als JSON:
{"texts":["...","...","..."]}
`;
    } else if (tab === "kondolenzbuch") {
      prompt = `
Schreibe 3 würdevolle Einträge für ein Kondolenzbuch.

Name oder Stichwort: ${keyword || "allgemein"}

Antwort nur als JSON:
{"texts":["...","...","..."]}
`;
    } else {
      prompt = `
Schreibe 3 persönliche Trauertexte.

Name oder Stichwort: ${keyword || "allgemein"}

Antwort nur als JSON:
{"texts":["...","...","..."]}
`;
    }

    const response = await client.responses.create({
      model: "gpt-5",
      input: prompt
    });

    const text = response.output_text;

    let result;

    try {
      result = JSON.parse(text);
    } catch {
      result = { texts: [text] };
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {

    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500 }
    );

  }
};
