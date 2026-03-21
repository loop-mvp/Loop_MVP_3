const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;
const openAiModel = import.meta.env.VITE_OPENAI_MODEL || "gpt-5-mini";

function extractResponseText(data) {
  if (typeof data?.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const output = Array.isArray(data?.output) ? data.output : [];
  const parts = [];

  output.forEach(item => {
    const content = Array.isArray(item?.content) ? item.content : [];
    content.forEach(entry => {
      if (typeof entry?.text === "string" && entry.text.trim()) {
        parts.push(entry.text.trim());
        return;
      }

      if (entry?.type === "output_text" && typeof entry?.text === "string" && entry.text.trim()) {
        parts.push(entry.text.trim());
      }
    });
  });

  return parts.join("\n\n").trim();
}

async function openAiRequest(input) {
  if (!openAiKey) {
    throw new Error("Missing OpenAI API key");
  }

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

  if (!response.ok) {
    throw new Error(`OpenAI request failed: ${response.status}`);
  }

  const data = await response.json();
  return extractResponseText(data);
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  return JSON.parse(candidate);
}

export async function generateOpenAiText(prompt) {
  return openAiRequest(prompt);
}

export async function generateNarrativeInsights(context) {
  const prompt = `You are a B2B product marketing strategist. Analyze the following Loop project context and return ONLY valid JSON with this exact shape:
{
  "summary": "string",
  "alignmentSummary": "string",
  "narrativeRisks": ["string", "string", "string"],
  "suggestedImprovements": ["string", "string", "string"],
  "positioningImprovements": ["string", "string", "string"]
}

Context:
${JSON.stringify(context, null, 2)}
`;

  const text = await openAiRequest(prompt);
  return extractJson(text);
}
