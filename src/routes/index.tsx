import { useMemo, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { ExpenseItem } from "@/components/ExpenseItem";
import { CategoryChip } from "@/components/CategoryChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  addExpense,
  todayISO,
  useExpenses,
  formatINR,
  CATEGORIES,
} from "@/lib/expenses";
import { parseExpenseAI } from "@/lib/ai-parse.functions";
import { toast } from "sonner";
import { Plus, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PennyWise — Smart expense tracking for Indian students" },
      {
        name: "description",
        content:
          "Track daily expenses in plain Hindi-English. Just type '250 zomato dinner' — PennyWise handles the rest.",
      },
      { property: "og:title", content: "PennyWise — Track expenses in plain language" },
      {
        property: "og:description",
        content:
          "Type it, track it. A ₹-first expense tracker built for Indian college students.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const expenses = useExpenses();
  const parseAI = useServerFn(parseExpenseAI);

  const today = todayISO();
  const todays = useMemo(
    () => expenses.filter((e) => e.date === today),
    [expenses, today],
  );
  const todayTotal = todays.reduce((s, e) => s + e.amount, 0);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setLoading(true);
    try {
      const parsed = await parseAI({ data: { text } });
      if (parsed.amount === null) {
        toast.error("Please include an amount, e.g. '250 zomato dinner'");
        return;
      }
      addExpense({
        amount: parsed.amount,
        category: parsed.category,
        merchant: parsed.merchant ?? "Misc",
        note: parsed.note ?? "",
        date: todayISO(),
      });
      setInput("");
      toast.success(`Added ${formatINR(parsed.amount)} · ${parsed.merchant ?? parsed.category}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not parse expense");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      {/* Hero input */}
      <section className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Just type it. AI figures out the rest.
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-3 shadow-soft focus-within:shadow-glow transition-shadow">
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your expense... e.g. 250 zomato dinner"
              className="h-14 text-base border-0 shadow-none focus-visible:ring-0 bg-transparent px-3"
              autoFocus
              disabled={loading}
            />
            <Button
              type="submit"
              size="lg"
              className="h-14 px-6 shadow-glow bg-gradient-primary"
              disabled={loading || !input.trim()}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Parsing…
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add Expense
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Category legend */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} category={c} size="sm" />
          ))}
        </div>
      </section>

      {/* Today */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl">Today</h1>
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Spent today
            </div>
            <div className="font-display text-3xl text-primary">
              {formatINR(todayTotal)}
            </div>
          </div>
        </div>

        {todays.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-2.5">
            {todays.map((exp) => (
              <ExpenseItem key={exp.id} expense={exp} />
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="font-medium">No expenses yet today</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Try <span className="font-mono text-foreground">80 auto to college</span> or{" "}
        <span className="font-mono text-foreground">1200 books</span>
      </p>
    </div>
  );
}
