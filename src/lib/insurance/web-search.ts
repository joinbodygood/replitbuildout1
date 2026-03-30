import Anthropic from '@anthropic-ai/sdk';
import type { WebSearchData } from './confidence-engine';

const MODEL = 'claude-opus-4-5';

export async function runWebSearch(params: {
  insurerName: string;
  state: string;
  diagnoses: string[];
  employerSize: string;
}): Promise<WebSearchData | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const client = new Anthropic({ apiKey });

  const primaryDiagnosis = params.diagnoses.includes('t2d')
    ? 'Type 2 Diabetes'
    : params.diagnoses.includes('osa')
    ? 'Obstructive Sleep Apnea'
    : params.diagnoses.includes('cvd')
    ? 'cardiovascular disease'
    : 'obesity/weight management';

  const prompt = `You are a GLP-1 insurance coverage specialist. Search for and summarize the current (2025-2026) insurance coverage policy for GLP-1 weight loss medications (Wegovy, Zepbound, Mounjaro, Ozempic) at ${params.insurerName} in ${params.state}.

Patient diagnosis context: ${primaryDiagnosis}
Employer size: ${params.employerSize}

Search for:
1. ${params.insurerName} GLP-1 formulary 2025 2026
2. ${params.insurerName} Wegovy Zepbound prior authorization requirements
3. ${params.insurerName} ${params.state} obesity medication coverage

Respond in this exact JSON format:
{
  "summary": "2-3 sentence plain English summary of coverage status",
  "verdict": "eligible|pa_required|not_covered|inconclusive",
  "confidence": 45-85,
  "details": "specific policy details found, PA criteria if applicable"
}

Base your verdict on what you find. If uncertain, use "inconclusive" with confidence 40-50.`;

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 500,
      tools: [
        {
          type: 'web_search_20250305' as 'web_search_20250305',
          name: 'web_search',
          max_uses: 3,
        } as unknown as Anthropic.Tool,
      ],
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = response.content.find((c: Anthropic.ContentBlock) => c.type === 'text');
    if (!textContent || textContent.type !== 'text') return null;

    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]) as {
      summary: string;
      verdict: WebSearchData['verdict'];
      confidence: number;
      details: string;
    };

    return {
      summary: parsed.summary || '',
      verdict: (['eligible', 'pa_required', 'not_covered', 'inconclusive'].includes(parsed.verdict)
        ? parsed.verdict
        : 'inconclusive') as WebSearchData['verdict'],
      confidence: Math.min(85, Math.max(30, Number(parsed.confidence) || 50)),
      details: parsed.details || '',
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[web-search] Claude API error:', message);
    return null;
  }
}
