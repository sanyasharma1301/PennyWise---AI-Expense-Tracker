import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Sparkles,
  TrendingDown,
  PiggyBank,
  Repeat,
  RefreshCw,
  AlertTriangle,
  Loader2,
  LineChart,
} from "lucide-react";
import { useExpenses, formatINR } from "@/lib/expenses";
import {
  generateInsightsAI,
  type MonthlyInsights,
} from "@/lib/ai-insights.functions";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights · PaisaWise" },
      {
        name: "description",
        content:
          "AI-powered monthly insights: your top money leaks, personalised savings tips, and the one habit to change.",
      },
      { property: "og:title", content: "PaisaWise Insights" },
      {
        property: "og:description",
        content: "AI-generated monthly insights from your real expense data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Insights,
});

function Insights() {
  const expenses = useExpenses();
  const run = useServerFn(generateInsightsAI);

  const monthly = useMemo(() => {
    const now = new Date();
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    return expenses.filter((e) => e.date?.startsWith(prefix));
  }, [expenses]);

  const total = monthly.reduce((s, e) => s + e.amount, 0);
  const enough = monthly.length >= 3;

  const [data, setData] = useState<MonthlyInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const result = await run({
        data: {
          expenses: monthly.map((e) => ({
            amount: e.amount,
            category: e.category,
            merchant: e.merchant,
            note: e.note,
            date: e.date,
          })),
        },
      });
      setData(result);
    } catch (err) {
      setData(null);
      setError(
        err instanceof Error ? err.message : "Could not generate insights. Try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (enough && !data && !loading && !error) void generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enough]);

  return (
    <AppShell>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            AI powered
          </div>
          <h1 className="font-display text-4xl">Monthly Insights</h1>
          <p className="mt-1 max-w-xl text-muted-foreground">
            {monthly.length} expense{monthly.length === 1 ? "" : "s"} this month ·{" "}
            {formatINR(total)} spent. Insights are generated from your real data.
          </p>
        </div>
        {enough && (
          <button
            onClick={() => void generate()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium shadow-soft transition-colors hover:bg-accent disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Insights
          </button>
        )}
      </div>

      {!enough && (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
            <LineChart className="h-5 w-5" />
          </div>
          <h3 className="font-medium">
            Keep tracking your expenses to unlock meaningful AI insights.
          </h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            You've logged {monthly.length} expense{monthly.length === 1 ? "" : "s"} this
            month. Add at least 3 to get your personalised monthly analysis.
          </p>
        </div>
      )}

      {enough && loading && !data && (
        <div className="grid gap-4 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-border bg-muted/40"
            />
          ))}
        </div>
      )}

      {enough && error && (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <h3 className="font-medium text-destructive">Couldn't generate insights</h3>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => void generate()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        </div>
      )}

      {enough && data && !error && (
        <div className="space-y-10">
          <section>
            <SectionHeading
              icon={<TrendingDown className="h-4 w-4" />}
              title="Top money leaks"
              subtitle="Where your rupees are quietly going this month."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {data.moneyLeaks.map((leak, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-semibold">{leak.title}</h3>
                    {leak.amount != null && (
                      <span className="shrink-0 rounded-lg bg-destructive/10 px-2 py-1 text-xs font-semibold text-destructive">
                        {formatINR(leak.amount)}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{leak.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading
              icon={<PiggyBank className="h-4 w-4" />}
              title="Realistic saving tips"
              subtitle="Small swaps tuned to how you actually spend."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {data.savingTips.map((tip, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                >
                  <div className="mb-3 grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                    {i + 1}
                  </div>
                  <p className="text-sm">{tip}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <SectionHeading
              icon={<Repeat className="h-4 w-4" />}
              title="One habit to change"
              subtitle="The single change with the biggest impact."
            />
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                  <Repeat className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{data.habitToChange.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.habitToChange.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {loading && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Refreshing insights…
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}

function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </span>
        <h2 className="font-display text-2xl">{title}</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}
