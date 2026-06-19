import { Router, type IRouter } from "express";
import Groq from "groq-sdk";
import {
  GenerateEmailsBody,
  EvaluateEmailBody,
} from "@workspace/api-zod";

const router: IRouter = Router();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL_A = "llama-3.3-70b-versatile";
const MODEL_B = "openai/gpt-oss-120b";

function buildAdvancedPrompt(
  intent: string,
  keyFacts: string,
  tone: string,
  businessName: string
) {
  return {
    messages: [
      {
        role: "system" as const,
        content: `You are an expert email copywriter with 15+ years of experience writing high-converting, professional business emails for Fortune 500 companies and startups alike. You understand tone, structure, and persuasion at a deep level. You always write clear subject lines and compelling email bodies that get responses.`,
      },
      {
        role: "user" as const,
        content: `Write a professional follow-up email for a sales opportunity. The business is "Acme Solutions", the tone should be Professional. Key facts: We met at TechConf last week, we offer cloud infrastructure at 40% lower cost, free migration support included.`,
      },
      {
        role: "assistant" as const,
        content: `Subject: Great Meeting You at TechConf — Let's Explore the Savings

Hi [Name],

It was a pleasure connecting with you at TechConf last week. I enjoyed our conversation about your infrastructure challenges.

As promised, I wanted to follow up on how Acme Solutions can help. Our cloud infrastructure platform consistently delivers 40% cost savings compared to traditional providers — and we back that up with free migration support so your team can make the switch without downtime or risk.

I'd love to schedule a quick 20-minute call to walk through a cost comparison tailored to your environment. Would Thursday or Friday this week work for you?

Looking forward to hearing from you.

Best regards,
[Your Name]
Acme Solutions`,
      },
      {
        role: "user" as const,
        content: `Write a professional job application email for a Senior Software Engineer position at Stripe. Key facts: 8 years experience in distributed systems, previously at Google and Netflix, open-source contributor to Kafka.`,
      },
      {
        role: "assistant" as const,
        content: `Subject: Application for Senior Software Engineer — Distributed Systems Expert

Dear Hiring Team,

I am writing to express my strong interest in the Senior Software Engineer position at Stripe. With 8 years of experience building distributed systems at Google and Netflix, I believe I can make a meaningful impact on your infrastructure.

During my time at Google, I worked on large-scale data pipelines, and at Netflix I led the redesign of our event streaming architecture. I am also an active contributor to the open-source Kafka project, where I've shipped several performance improvements used in production by hundreds of organizations.

Stripe's mission to increase the GDP of the internet resonates deeply with me. I would love the opportunity to bring my distributed systems expertise to your engineering team.

I've attached my resume and would welcome the chance to discuss how my background aligns with your needs.

Thank you for your consideration.

Best regards,
[Your Name]`,
      },
      {
        role: "user" as const,
        content: `Write a ${tone} email for ${businessName}. Intent: ${intent}. Key facts:\n${keyFacts}`,
      },
    ],
  };
}

function buildBasicPrompt(
  intent: string,
  keyFacts: string,
  tone: string,
  businessName: string
) {
  return {
    messages: [
      {
        role: "user" as const,
        content: `Write a ${tone} professional email for ${businessName}. Intent: ${intent}. Key facts: ${keyFacts}. Provide a subject line and full email body.`,
      },
    ],
  };
}

router.post("/generate-emails", async (req, res) => {
  const parseResult = GenerateEmailsBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { intent, keyFacts, tone, businessName } = parseResult.data;

  try {
    const [modelAResponse, modelBResponse] = await Promise.all([
      groq.chat.completions.create({
        model: MODEL_A,
        max_tokens: 1024,
        ...buildAdvancedPrompt(intent, keyFacts, tone, businessName),
      }),
      groq.chat.completions.create({
        model: MODEL_B,
        max_tokens: 1024,
        ...buildBasicPrompt(intent, keyFacts, tone, businessName),
      }),
    ]);

    const modelA = modelAResponse.choices[0]?.message?.content ?? "";
    const modelB = modelBResponse.choices[0]?.message?.content ?? "";

    res.json({ modelA, modelB });
  } catch (err) {
    req.log.error({ err }, "Error generating emails");
    res.status(500).json({ error: "Failed to generate emails" });
  }
});

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "it", "its", "this", "that", "we", "our", "your", "their", "my", "i",
  "you", "he", "she", "they", "not", "no", "so", "as", "if", "up", "out",
  "also", "can", "will", "would", "should", "could", "has", "have", "had",
]);

function computeFactRecallScore(emailText: string, keyFacts: string): number {
  const emailLower = emailText.toLowerCase();
  const lines = keyFacts.split("\n").filter((l) => l.trim().length > 0);
  if (lines.length === 0) return 10;

  let matched = 0;
  for (const line of lines) {
    const words = line
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    if (words.length === 0) {
      matched++;
      continue;
    }
    const wordsFound = words.filter((w) => emailLower.includes(w));
    if (wordsFound.length >= Math.ceil(words.length * 0.5)) {
      matched++;
    }
  }

  return Math.round((matched / lines.length) * 10 * 10) / 10;
}

router.post("/evaluate", async (req, res) => {
  const parseResult = EvaluateEmailBody.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { emailText, keyFacts, tone } = parseResult.data;

  const factRecallScore = computeFactRecallScore(emailText, keyFacts);

  try {
    const [toneResponse, qualityResponse] = await Promise.all([
      groq.chat.completions.create({
        model: MODEL_A,
        max_tokens: 64,
        messages: [
          {
            role: "user",
            content: `You are a professional email quality evaluator. Rate this email's tone accuracy on a scale of 0-10, where 10 means it perfectly matches the requested tone of "${tone}".

Email:
${emailText}

Respond with ONLY a JSON object: {"score": <number>}`,
          },
        ],
      }),
      groq.chat.completions.create({
        model: MODEL_A,
        max_tokens: 64,
        messages: [
          {
            role: "user",
            content: `You are a professional email quality evaluator. Rate this email's professional quality on a scale of 0-10, considering grammar, structure, clarity, and overall effectiveness.

Email:
${emailText}

Respond with ONLY a JSON object: {"score": <number>}`,
          },
        ],
      }),
    ]);

    function parseScore(content: string | null): number {
      if (!content) return 7;
      try {
        const match = content.match(/\{[^}]*"score"\s*:\s*(\d+(?:\.\d+)?)/);
        if (match) return Math.min(10, Math.max(0, parseFloat(match[1])));
        const jsonParsed = JSON.parse(content.trim());
        if (typeof jsonParsed.score === "number") {
          return Math.min(10, Math.max(0, jsonParsed.score));
        }
      } catch {
        // fallback
      }
      return 7;
    }

    const toneAccuracyScore = parseScore(
      toneResponse.choices[0]?.message?.content ?? null
    );
    const professionalQualityScore = parseScore(
      qualityResponse.choices[0]?.message?.content ?? null
    );

    const overallScore =
      Math.round(
        ((factRecallScore + toneAccuracyScore + professionalQualityScore) / 3) *
          10
      ) / 10;

    res.json({
      factRecallScore,
      toneAccuracyScore,
      professionalQualityScore,
      overallScore,
    });
  } catch (err) {
    req.log.error({ err }, "Error evaluating email");
    res.status(500).json({ error: "Failed to evaluate email" });
  }
});

export default router;
