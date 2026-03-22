/* global process */

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const openAiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;
  const openAiModel = process.env.OPENAI_MODEL || process.env.VITE_OPENAI_MODEL || "gpt-5-mini";

  if (!openAiKey) {
    return res.status(500).json({ error: "Missing OpenAI API key on server" });
  }

  const input = req.body?.input;
  if (!input) {
    return res.status(400).json({ error: "Missing OpenAI input" });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: openAiModel,
        reasoning: { effort: "medium" },
        text: {
          format: {
            type: "text",
          },
        },
        input,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "OpenAI request failed",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({
      error: error?.message || "Unexpected OpenAI server error",
    });
  }
}
