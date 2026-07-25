import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Sparkles, TrendingDown, PiggyBank, Repeat, Lock } from "lucide-react";

export const Route = createFileRoute("/insights")({
  head: () => ({
    meta: [
      { title: "Insights · PaisaWise" },
      {
        name: "description",
        content:
          "AI-powered monthly insights: your top money leaks, personalised savings tips, and habits to change.",
      },
      { property: "og:title", content: "PaisaWise Insights" },
      {
        property: "og:description",
        content: "Coming soon: AI-generated monthly insights from your expense data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Insights,
});

function Insights() {
  return (
    <AppShell>
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          Coming soon
        </div>
        <h1 className="font-display text-4xl">Monthly Insights</h1>
        <p className="mt-1 max-w-xl text-muted-foreground">
          Once you've logged a few weeks of expenses, PaisaWise will read your data
          and share personalised, no-judgement insights — every month.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          icon={<TrendingDown className="h-5 w-5" />}
          title="Top 3 money leaks"
          description="The categories quietly eating your budget — with the exact rupees leaking each month."
          samples={[
            "Late-night Zomato orders — ₹1,240 this month",
            "Auto rides between hostel & campus — ₹680",
            "Impulse Amazon buys — ₹560",
          ]}
        />
        <InsightCard
          icon={<PiggyBank className="h-5 w-5" />}
          title="3 personalised saving tips"
          description="Small, doable swaps tuned to how you actually spend — not generic finance advice."
          samples={[
            "Cook one dinner a week — save ~₹400",
            "Share cabs on Fri nights — save ~₹250",
            "Use library reference copies — save ~₹800",
          ]}
        />
        <InsightCard
          icon={<Repeat className="h-5 w-5" />}
          title="One habit to change"
          description="The single behaviour with the biggest impact on your monthly total."
          samples={["Set a ₹150/day food budget — projected monthly save: ₹1,800"]}
        />
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="font-medium">AI insights unlock soon</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Keep logging your expenses from the home page. When the AI layer is
          switched on, your monthly report will appear here automatically — built
          from your real data, private to you.
        </p>
      </div>
    </AppShell>
  );
}

function InsightCard({
  icon,
  title,
  description,
  samples,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  samples: string[];
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <ul className="mt-4 space-y-2">
        {samples.map((s) => (
          <li
            key={s}
            className="rounded-lg border border-dashed border-border/70 bg-muted/40 px-3 py-2 text-xs text-muted-foreground blur-[1.5px] select-none"
          >
            {s}
          </li>
        ))}
      </ul>
      <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
        Sample preview
      </div>
    </div>
  );
}
