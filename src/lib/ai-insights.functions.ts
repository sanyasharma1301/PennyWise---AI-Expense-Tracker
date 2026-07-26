import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `You are a personal finance analyst helping an Indian college student understand their spending.

Analyze the following expense data from the current month.

Identify:
1. The top 3 money leaks or spending patterns that could be reduced.
2. 3 realistic, specific saving tips suitable for an Indian college student.
3. One habit to change that could have the biggest impact on monthly spending.

Be practical and non-judgmental. Base every insight on the actual expense data. Do not invent spending patterns that are not supported by the data.

Return strict JSON only in this format:
{
  "moneyLeaks": [
    { "title": "Short title", "description": "Specific explanation based on the data", "amount": 0 }
  ],
  "savingTips": [
    "Specific realistic saving tip 1",
    "Specific realistic saving tip 2",
    "Specific realistic saving tip 3"
  ],
  "habitToChange": {
    "title": "Short habit title",
    "description": "One practical habit change based on the user's spending"
  }
}

The currency is Indian Rupees (₹).`;

export type MoneyLeak = { title: string; description: string; amount: number | null };
export type MonthlyInsights = {
  moneyLeaks: MoneyLeak[];
  savingTips: string[];
  habitToChange: { title: string; description: string };
};

type ExpenseInput = {
  amount: number;
  category: string;
  merchant: string;
  note: string;
  date: string;
};

export const generateInsightsAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    const list = (input as { expenses?: unknown })?.expenses;
    if (!Array.isArray(list) || list.length < 3) {
      throw new Error("At least 3 expenses are required");
    }
    const expenses: ExpenseInput[] = list.slice(0, 300).map((e) => {
      const x = e as Record<string, unknown>;
      return {
        amount: Number(x.amount) || 0,
        category: String(x.category ?? "Other"),
        merchant: String(x.merchant ?? ""),
        note: String(x.note ?? ""),
        date: String(x.date ?? ""),
      };
    });
    return { expenses };
  })
  .handler(async ({ data }): Promise<MonthlyInsights> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Current month expenses (JSON):\n${JSON.stringify(data.expenses)}`,
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402)
        throw new Error("AI credits exhausted. Please add credits in workspace billing.");
      const errText = await res.text().catch(() => "");
      throw new Error(`AI request failed (${res.status}): ${errText.slice(0, 200)}`);
    }

    const body = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = body.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty AI response");

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("AI returned invalid JSON");
      parsed = JSON.parse(match[0]);
    }

    const p = parsed as Record<string, unknown>;
    const rawLeaks = Array.isArray(p.moneyLeaks) ? p.moneyLeaks : [];
    const moneyLeaks: MoneyLeak[] = rawLeaks
      .slice(0, 3)
      .map((l) => {
        const o = (l ?? {}) as Record<string, unknown>;
        const amt = typeof o.amount === "number" && Number.isFinite(o.amount) && o.amount > 0 ? o.amount : null;
        return {
          title: typeof o.title === "string" ? o.title.trim() : "",
          description: typeof o.description === "string" ? o.description.trim() : "",
          amount: amt,
        };
      })
      .filter((l) => l.title || l.description);

    const savingTips = (Array.isArray(p.savingTips) ? p.savingTips : [])
      .filter((t): t is string => typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim())
      .slice(0, 3);

    const h = (p.habitToChange ?? {}) as Record<string, unknown>;
    const habitToChange = {
      title: typeof h.title === "string" ? h.title.trim() : "",
      description: typeof h.description === "string" ? h.description.trim() : "",
    };

    if (!moneyLeaks.length || !savingTips.length || !habitToChange.description) {
      throw new Error("AI returned an incomplete response");
    }

    return { moneyLeaks, savingTips, habitToChange };
  });
