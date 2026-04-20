/* global process */

const MAX_CRAWLED_PAGES = 6;
const MAX_PAGE_TEXT = 12000;
const MAX_SECTION_ITEMS = 12;
const REQUEST_TIMEOUT_MS = 12000;

function normalizeUrl(input = "") {
  const trimmed = String(input || "").trim();
  if (!trimmed) return "";

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(url.protocol)) {
      throw new Error("Unsupported protocol");
    }
    url.hash = "";
    return url.toString();
  } catch {
    throw new Error("Invalid website URL");
  }
}

function normalizeComparableUrl(input = "") {
  try {
    const url = new URL(input);
    url.hash = "";
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.replace(/\/+$/, "");
    }
    return url.toString();
  } catch {
    return input;
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

function compactTextList(items = [], limit = MAX_SECTION_ITEMS) {
  return items
    .map(item => String(item || "").trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index)
    .slice(0, limit);
}

function extractMatches(html = "", pattern, limit = MAX_SECTION_ITEMS) {
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

function extractAnchorLinks(html = "", baseUrl = "") {
  const links = [];
  const regex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match = regex.exec(html);

  while (match && links.length < 80) {
    try {
      const url = new URL(match[1], baseUrl);
      const text = stripHtml(match[2] || "");
      links.push({
        url: normalizeComparableUrl(url.toString()),
        text,
      });
    } catch {
      // Ignore malformed hrefs.
    }
    match = regex.exec(html);
  }

  return links;
}

function classifyPage(url = "", extracted = {}) {
  const pathname = (() => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  if (!pathname || pathname === "/") return "homepage";
  if (/(pricing|plans|plan)\b/.test(pathname)) return "pricing";
  if (/(customer|customers|case-study|case-studies|stories|testimonials)\b/.test(pathname)) return "proof";
  if (/(about|company|mission|team)\b/.test(pathname)) return "about";
  if (/(product|platform|features|solutions|solution|use-cases|use-case)\b/.test(pathname)) return "product";
  if (/(compare|comparison|alternatives|vs)\b/.test(pathname)) return "comparison";
  if (/(docs|documentation|help|guide)\b/.test(pathname)) return "docs";
  if (/(blog|news|press|events|webinar)\b/.test(pathname)) return "blog";
  if ((extracted.hero || []).length || (extracted.features || []).length) return "product";
  return "other";
}

function scoreCandidateLink(candidate, rootUrl) {
  const pathname = (() => {
    try {
      return new URL(candidate.url).pathname.toLowerCase();
    } catch {
      return "";
    }
  })();

  const rootOrigin = (() => {
    try {
      return new URL(rootUrl).origin;
    } catch {
      return "";
    }
  })();

  let score = 0;
  if (candidate.url.startsWith(rootOrigin)) score += 3;
  if (!pathname || pathname === "/") score += 10;
  if (/(product|platform|features|solutions|use-cases|use-case)/.test(pathname)) score += 9;
  if (/(pricing|plans)/.test(pathname)) score += 8;
  if (/(customer|case-study|case-studies|stories|testimonials)/.test(pathname)) score += 8;
  if (/(about|company|mission|team)/.test(pathname)) score += 5;
  if (/(compare|comparison|alternatives|vs)/.test(pathname)) score += 5;
  if (/(blog|news|press|events|webinar|careers|privacy|terms|legal)/.test(pathname)) score -= 8;
  if (candidate.text && candidate.text.length <= 40) score += 1;
  if (pathname.split("/").filter(Boolean).length <= 2) score += 1;
  return score;
}

function isCandidateUrlAllowed(url = "", rootUrl = "") {
  try {
    const parsed = new URL(url);
    const root = new URL(rootUrl);
    if (parsed.origin !== root.origin) return false;
    if (!["http:", "https:"].includes(parsed.protocol)) return false;

    const blockedExtensions = /\.(pdf|jpg|jpeg|png|gif|svg|webp|zip|doc|docx|xls|xlsx|ppt|pptx)$/i;
    if (blockedExtensions.test(parsed.pathname)) return false;

    const blockedPathFragments = /(privacy|terms|legal|careers|jobs|blog|news|press|events|webinar)/i;
    if (blockedPathFragments.test(parsed.pathname)) return false;

    return true;
  } catch {
    return false;
  }
}

function summarizeHtml(html = "", url = "") {
  const title = extractMatches(html, "<title[^>]*>([\\s\\S]*?)<\\/title>", 1)[0] || "";
  const metaDescription =
    extractMatches(html, '<meta[^>]+name=["\']description["\'][^>]+content=["\']([\\s\\S]*?)["\'][^>]*>', 1)[0] ||
    extractMatches(html, '<meta[^>]+content=["\']([\\s\\S]*?)["\'][^>]+name=["\']description["\'][^>]*>', 1)[0] ||
    "";
  const headings = compactTextList([
    ...extractMatches(html, "<h1[^>]*>([\\s\\S]*?)<\\/h1>", 4),
    ...extractMatches(html, "<h2[^>]*>([\\s\\S]*?)<\\/h2>", 8),
  ]);
  const paragraphs = compactTextList(extractMatches(html, "<p[^>]*>([\\s\\S]*?)<\\/p>", 18));
  const rawText = stripHtml(html).slice(0, MAX_PAGE_TEXT);
  const hero = compactTextList([...headings.slice(0, 3), ...paragraphs.slice(0, 3)], 6);
  const features = compactTextList([
    ...extractMatches(html, "<h3[^>]*>([\\s\\S]*?)<\\/h3>", 10),
    ...extractMatches(html, "<li[^>]*>([\\s\\S]*?)<\\/li>", 18),
  ]);
  const ctas = compactTextList([
    ...extractMatches(html, "<button[^>]*>([\\s\\S]*?)<\\/button>", 12),
    ...extractAnchorLinks(html, url).map(link => link.text),
  ], 12);
  const navLabels = compactTextList(
    extractAnchorLinks(html, url)
      .map(link => link.text)
      .filter(text => text && text.length <= 32),
    14
  );
  const proof = compactTextList(
    [
      ...paragraphs.filter(item => /\b(customer|customers|teams|companies|results|revenue|roi|faster|increase|improve|trusted by|used by)\b/i.test(item)),
      ...features.filter(item => /\b(customer|customers|teams|results|roi|revenue|proof|case study|testimonial)\b/i.test(item)),
    ],
    10
  );
  const links = extractAnchorLinks(html, url);

  return {
    normalizedUrl: normalizeComparableUrl(url),
    title,
    metaDescription,
    headings,
    paragraphs,
    hero,
    features,
    ctas,
    navLabels,
    proof,
    rawText,
    links,
  };
}

async function fetchHtml(url = "") {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  const timeoutId = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LoopMVPBot/1.0 (+https://loop.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller?.signal,
    });

    if (!response.ok) {
      throw new Error(`Could not fetch website: ${response.status}`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error("Website URL must return an HTML page");
    }

    const html = await response.text();
    const finalUrl = normalizeComparableUrl(response.url || url);
    return {
      url: finalUrl,
      html,
      extracted: summarizeHtml(html, finalUrl),
    };
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

async function buildWebsiteCorpus(rootUrl) {
  const homepage = await fetchHtml(rootUrl);
  const visited = new Set([homepage.url]);
  const pages = [
    {
      url: homepage.url,
      pageType: "homepage",
      ...homepage.extracted,
    },
  ];

  const rankedCandidates = homepage.extracted.links
    .filter(candidate => isCandidateUrlAllowed(candidate.url, homepage.url))
    .map(candidate => ({
      ...candidate,
      score: scoreCandidateLink(candidate, homepage.url),
    }))
    .sort((left, right) => right.score - left.score);

  for (const candidate of rankedCandidates) {
    if (pages.length >= MAX_CRAWLED_PAGES) break;
    if (visited.has(candidate.url)) continue;
    if (candidate.score < 3) continue;

    try {
      const page = await fetchHtml(candidate.url);
      if (visited.has(page.url)) continue;
      visited.add(page.url);
      pages.push({
        url: page.url,
        pageType: classifyPage(page.url, page.extracted),
        ...page.extracted,
      });
    } catch {
      // Skip failed secondary pages and continue with available evidence.
    }
  }

  return pages;
}

function aggregateWebsiteEvidence(pages = []) {
  const pageTitles = compactTextList(pages.flatMap(page => [page.title]));
  const headings = compactTextList(pages.flatMap(page => page.headings || []), 20);
  const hero = compactTextList(pages.flatMap(page => page.hero || []), 12);
  const features = compactTextList(pages.flatMap(page => page.features || []), 20);
  const proof = compactTextList(pages.flatMap(page => page.proof || []), 12);
  const ctas = compactTextList(pages.flatMap(page => page.ctas || []), 12);
  const pageTypes = compactTextList(pages.map(page => page.pageType));
  const siteSummary = compactTextList([
    hero[0],
    pages[0]?.metaDescription,
    headings[0],
    headings[1],
  ], 4).join(" | ");

  return {
    pageCount: pages.length,
    pageTypes,
    pageTitles,
    headings,
    hero,
    features,
    proof,
    ctas,
    siteSummary,
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

function buildFallbackResponse(normalizedUrl, pages, aggregate) {
  return {
    url: normalizedUrl,
    pageTitle: pages[0]?.title || "",
    metaDescription: pages[0]?.metaDescription || "",
    siteSummary: aggregate.siteSummary,
    audienceSignals: [],
    productSignals: compactTextList([...aggregate.hero, ...aggregate.features], 8),
    proofSignals: aggregate.proof,
    extractedMessaging: compactTextList([...aggregate.hero, ...aggregate.headings], 8),
    recommendedContext: {
      productCategory: "",
      targetAudience: "",
      coreUseCase: "",
      marketType: "",
      assumptions: [],
    },
    structuredContext: {
      productCategory: { value: "", confidence: "low", evidence: [] },
      targetAudience: { value: "", confidence: "low", evidence: [] },
      coreUseCase: { value: "", confidence: "low", evidence: [] },
      marketType: { value: "", confidence: "low", evidence: [] },
      differentiators: [],
      proofPoints: [],
      pricingModel: { value: "", confidence: "low", evidence: [] },
    },
    review: {
      narrativeStrengths: [],
      narrativeRisks: [],
      missingInformation: [],
      overallConfidence: "low",
    },
    crawlSummary: {
      analyzedPages: pages.map(page => ({ url: page.url, pageType: page.pageType, title: page.title || "" })),
      pageCount: pages.length,
      pageTypes: aggregate.pageTypes,
    },
  };
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

    const pages = await buildWebsiteCorpus(normalizedUrl);
    const aggregate = aggregateWebsiteEvidence(pages);
    const fallback = buildFallbackResponse(normalizedUrl, pages, aggregate);

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
  },
  "structuredContext": {
    "productCategory": { "value": "string", "confidence": "low|medium|high", "evidence": ["string"] },
    "targetAudience": { "value": "string", "confidence": "low|medium|high", "evidence": ["string"] },
    "coreUseCase": { "value": "string", "confidence": "low|medium|high", "evidence": ["string"] },
    "marketType": { "value": "string", "confidence": "low|medium|high", "evidence": ["string"] },
    "differentiators": [{ "value": "string", "confidence": "low|medium|high", "evidence": ["string"] }],
    "proofPoints": [{ "value": "string", "confidence": "low|medium|high", "evidence": ["string"] }],
    "pricingModel": { "value": "string", "confidence": "low|medium|high", "evidence": ["string"] }
  },
  "review": {
    "narrativeStrengths": ["string"],
    "narrativeRisks": ["string"],
    "missingInformation": ["string"],
    "overallConfidence": "low|medium|high"
  }
}

Rules:
- Base your answer only on the website evidence provided.
- Separate direct facts from weaker inference. If uncertain, lower confidence and put the uncertainty in assumptions or missingInformation.
- assumptions must start with "Assumption:".
- evidence must quote or closely paraphrase actual website content snippets.
- Do not invent proof points if they are not present.
- productSignals should focus on what the product does, who it is for, and why it is different.
- extractedMessaging should capture the strongest recurring message themes across the analyzed pages.
- overallConfidence should reflect evidence quality across pages, not your writing confidence.

Website crawl summary:
${JSON.stringify({
  url: normalizedUrl,
  pageCount: pages.length,
  pageTypes: aggregate.pageTypes,
  siteSummary: aggregate.siteSummary,
}, null, 2)}

Analyzed pages:
${JSON.stringify(
  pages.map(page => ({
    url: page.url,
    pageType: page.pageType,
    title: page.title,
    metaDescription: page.metaDescription,
    hero: page.hero,
    headings: page.headings,
    features: page.features,
    proof: page.proof,
    ctas: page.ctas,
    navLabels: page.navLabels,
    rawText: page.rawText,
  })),
  null,
  2
)}`;

    const openAiData = await requestOpenAi(openAiKey, openAiModel, prompt);
    const parsed = parseJson(extractResponseText(openAiData), fallback);

    return res.status(200).json({
      ...fallback,
      ...parsed,
      url: parsed.url || normalizedUrl,
      pageTitle: parsed.pageTitle || fallback.pageTitle,
      metaDescription: parsed.metaDescription || fallback.metaDescription,
      siteSummary: parsed.siteSummary || fallback.siteSummary,
      audienceSignals: Array.isArray(parsed.audienceSignals) ? parsed.audienceSignals : fallback.audienceSignals,
      productSignals: Array.isArray(parsed.productSignals) ? parsed.productSignals : fallback.productSignals,
      proofSignals: Array.isArray(parsed.proofSignals) ? parsed.proofSignals : fallback.proofSignals,
      extractedMessaging: Array.isArray(parsed.extractedMessaging) ? parsed.extractedMessaging : fallback.extractedMessaging,
      recommendedContext: {
        ...fallback.recommendedContext,
        ...(parsed.recommendedContext || {}),
        assumptions: Array.isArray(parsed?.recommendedContext?.assumptions)
          ? parsed.recommendedContext.assumptions
          : fallback.recommendedContext.assumptions,
      },
      structuredContext: {
        ...fallback.structuredContext,
        ...(parsed.structuredContext || {}),
      },
      review: {
        ...fallback.review,
        ...(parsed.review || {}),
      },
      crawlSummary: fallback.crawlSummary,
      extracted: {
        aggregate,
        pages: pages.map(page => ({
          url: page.url,
          pageType: page.pageType,
          title: page.title,
          metaDescription: page.metaDescription,
          hero: page.hero,
          headings: page.headings,
          features: page.features,
          proof: page.proof,
          ctas: page.ctas,
          navLabels: page.navLabels,
        })),
      },
    });
  } catch (error) {
    const status = String(error?.message || "").includes("Invalid website URL") ? 400 : 500;
    return res.status(status).json({
      error: error?.message || "Unexpected website analysis error",
    });
  }
}
