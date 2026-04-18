/* global process */

function normalizeUrl(input = "") {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol");
    }
    return url.toString();
  } catch {
    throw new Error("Invalid website URL");
  }
}

function decodeHtmlEntities(value = "") {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, "\"")
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(value = "") {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
      .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  );
}

function extractMatches(html = "", pattern, limit = 8) {
  const matches = [];
  const regex = new RegExp(pattern, "gi");
  let match = regex.exec(html);

  while (match && matches.length < limit) {
    const text = stripHtml(match[1] || "");
    if (text) matches.push(text);
    match = regex.exec(html);
  }

  return matches;
}

function summarizeHtml(html = "", url = "") {
  const title = extractMatches(html, "<title[^>]*>([\\s\\S]*?)<\\/title>", 1)[0] || "";
  const metaDescription =
    extractMatches(html, '<meta[^>]+name=["\']description["\'][^>]+content=["\']([\\s\\S]*?)["\'][^>]*>', 1)[0] ||
    extractMatches(html, '<meta[^>]+content=["\']([\\s\\S]*?)["\'][^>]+name=["\']description["\'][^>]*>', 1)[0] ||
    "";
  const headings = [
    ...extractMatches(html, "<h1[^>]*>([\\s\\S]*?)<\\/h1>", 4),
    ...extractMatches(html, "<h2[^>]*>([\\s\\S]*?)<\\/h2>", 6),
  ].slice(0, 8);
  const paragraphs = extractMatches(html, "<p[^>]*>([\\s\\S]*?)<\\/p>", 12);
  const rawText = stripHtml(html).slice(0, 12000);

  return {
    normalizedUrl: url,
    title,
    metaDescription,
    headings,
    paragraphs,
    rawText,
  };
}

async function requestOpenAi(openAiKey, openAiModel, input) {
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
    throw new Error(data?.error?.message || "OpenAI website analysis failed");
  }

  return data;
}

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
      }
    });
  });

  return parts.join("\n\n").trim();
}

function parseJson(text = "", fallback = {}) {
  try {
    const fenced = String(text).match(/```json\s*([\s\S]*?)```/i);
    return JSON.parse(fenced ? fenced[1] : text);
  } catch {
    return fallback;
  }
}

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

  try {
    const normalizedUrl = normalizeUrl(req.body?.url || "");
    if (!normalizedUrl) {
      return res.status(400).json({ error: "Missing website URL" });
    }

    const response = await fetch(normalizedUrl, {
      headers: {
        "User-Agent": "LoopMVPBot/1.0 (+https://loop.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return res.status(400).json({ error: `Could not fetch website: ${response.status}` });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return res.status(400).json({ error: "Website URL must return an HTML page" });
    }

    const html = await response.text();
    const extracted = summarizeHtml(html, normalizedUrl);

    const prompt = `You are analyzing a company's public website copy for product marketing context.
Return ONLY valid JSON with this exact shape:
{
  "url": "string",
  "pageTitle": "string",
  "metaDescription": "string",
  "siteSummary": "string",
  "audienceSignals": ["string"],
  "productSignals": ["string"],
  "proofSignals": ["string"],
  "extractedMessaging": ["string"],
  "recommendedContext": {
    "productCategory": "string",
    "targetAudience": "string",
    "coreUseCase": "string",
    "marketType": "string",
    "assumptions": ["string"]
  }
}

Rules:
- Base your answer on the website content provided, not generic SaaS assumptions.
- Be conservative when inferring; put uncertain ideas in assumptions.
- Assumptions must start with "Assumption:".
- extractedMessaging should capture actual message themes implied by the page.
- proofSignals should only include concrete signs of proof if present.

Website data:
${JSON.stringify(extracted, null, 2)}`;

    const openAiData = await requestOpenAi(openAiKey, openAiModel, prompt);
    const parsed = parseJson(extractResponseText(openAiData), {
      url: normalizedUrl,
      pageTitle: extracted.title,
      metaDescription: extracted.metaDescription,
      siteSummary: [extracted.title, extracted.metaDescription, ...extracted.headings.slice(0, 2)].filter(Boolean).join(" | "),
      audienceSignals: [],
      productSignals: extracted.headings.slice(0, 4),
      proofSignals: [],
      extractedMessaging: extracted.headings.slice(0, 4),
      recommendedContext: {
        productCategory: "",
        targetAudience: "",
        coreUseCase: "",
        marketType: "",
        assumptions: [],
      },
    });

    return res.status(200).json({
      ...parsed,
      url: parsed.url || normalizedUrl,
      pageTitle: parsed.pageTitle || extracted.title,
      metaDescription: parsed.metaDescription || extracted.metaDescription,
      extracted,
    });
  } catch (error) {
    const status = String(error?.message || "").includes("Invalid website URL") ? 400 : 500;
    return res.status(status).json({
      error: error?.message || "Unexpected website analysis error",
    });
  }
}
