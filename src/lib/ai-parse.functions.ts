import { createServerFn } from "@tanstack/react-start";

const SYSTEM_PROMPT = `You are an expense parser for an Indian expense tracker app. Given a plain-language expense line, extract structured data and return STRICT JSON only — no markdown, no explanation, no code fences, just the raw JSON object.

OUTPUT FORMAT:
{
  "amount": <number or null>,
  "category": "<one of: Food, Travel, Education, Entertainment, Shopping, Bills, Other>",
  "merchant": "<string or null>",
  "note": "<string or null>"
}

RULES:
1. AMOUNT: Extract numeric value only. No currency symbols/commas. If absent, null. Ignore "rs", "rupees", "inr", "₹".
2. CATEGORY: Exactly one of Food, Travel, Education, Entertainment, Shopping, Bills, Other. Use Indian context.
   Food: zomato, swiggy, mess, tiffin, canteen, dhaba, restaurant, groceries, zepto, blinkit, instamart, chai, food delivery.
   Travel: auto, rickshaw, ola, uber, metro, bus, train, irctc, petrol, fuel, cab, flight, toll, fastag.
   Education: fees, tuition, coaching, books, stationery, course, exam fee.
   Entertainment: movie, netflix, bookmyshow, concert, gaming, outing, party.
   Shopping: amazon, flipkart, myntra, clothes, electronics, mall.
   Bills: electricity, recharge, wifi, rent, emi, insurance, dth, gas cylinder, utilities.
   Other: anything else.
3. MERCHANT: Extract vendor/platform/person if mentioned. Transport modes (Auto, Rickshaw, Bus, Metro, Train, Cab, Ola, Uber) are valid merchants in Title Case. Title Case normalization. Else null.
4. NOTE: Short human context. Don't repeat merchant. Else null. E.g. "dinner with friends", "to college", "for semester".
5. GENERAL: Handle Hinglish. Never invent data. Return only valid JSON.

EXAMPLES:
Input: "250 zomato dinner with friends"
Output: {"amount":250,"category":"Food","merchant":"Zomato","note":"dinner with friends"}

Input: "80 auto to college"
Output: {"amount":80,"category":"Travel","merchant":"Auto","note":"to college"}

Input: "300 rickshaw to college"
Output: {"amount":300,"category":"Travel","merchant":"Rickshaw","note":"to college"}

Input: "mess fee this month"
Output: {"amount":null,"category":"Food","merchant":"Mess","note":"this month's fee"}

Input: "UPI 1200 rent"
Output: {"amount":1200,"category":"Bills","merchant":null,"note":"rent"}

Now parse the user's expense input and return only the JSON object.`;

const CATEGORIES = ["Food", "Travel", "Education", "Entertainment", "Shopping", "Bills", "Other"] as const;

export type ParsedAIExpense = {
  amount: number | null;
  category: (typeof CATEGORIES)[number];
  merchant: string | null;
  note: string | null;
};

export const parseExpenseAI = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    if (!input || typeof input !== "object" || typeof (input as { text?: unknown }).text !== "string") {
      throw new Error("text is required");
    }
    const text = (input as { text: string }).text.trim();
    if (!text) throw new Error("text is required");
    return { text };
  })
  .handler(async ({ data }): Promise<ParsedAIExpense> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI is not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": apiKey,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: data.text },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted. Please add credits in workspace billing.");
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
    const amount =
      p.amount === null || p.amount === undefined
        ? null
        : typeof p.amount === "number" && Number.isFinite(p.amount) && p.amount > 0
          ? p.amount
          : null;
    const category = (CATEGORIES as readonly string[]).includes(p.category as string)
      ? (p.category as ParsedAIExpense["category"])
      : "Other";
    const merchant =
      typeof p.merchant === "string" && p.merchant.trim() ? p.merchant.trim() : null;
    const note = typeof p.note === "string" && p.note.trim() ? p.note.trim() : null;

    return { amount, category, merchant, note };
  });
