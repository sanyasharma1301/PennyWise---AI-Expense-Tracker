import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CategoryChip } from "@/components/CategoryChip";
import { CATEGORIES, formatINR, useExpenses, type Category } from "@/lib/expenses";
import { CATEGORY_STYLES } from "@/lib/categories";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Calendar, Trophy, Flame } from "lucide-react";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · PaisaWise" },
      {
        name: "description",
        content:
          "See where your money went this month with category breakdowns and weekly spending charts.",
      },
      { property: "og:title", content: "PaisaWise Dashboard" },
      {
        property: "og:description",
        content: "Monthly totals, top categories, and weekly spend at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function startOfWeek(d: Date) {
  // Monday-based week
  const day = (d.getDay() + 6) % 7;
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  s.setDate(s.getDate() - day);
  return s;
}

function Dashboard() {
  const expenses = useExpenses();

  const stats = useMemo(() => {
    const now = new Date();
    const yr = now.getFullYear();
    const mo = now.getMonth();
    const weekStart = startOfWeek(now);

    let monthTotal = 0;
    let weekTotal = 0;
    let biggest: (typeof expenses)[number] | null = null;
    const byCategory: Record<Category, number> = {
      Food: 0,
      Travel: 0,
      Education: 0,
      Entertainment: 0,
      Shopping: 0,
      Bills: 0,
      Other: 0,
    };

    // Weekly bars: last 6 weeks (Mon-based)
    const weekBuckets: { label: string; total: number; start: Date }[] = [];
    for (let i = 5; i >= 0; i--) {
      const s = new Date(weekStart);
      s.setDate(s.getDate() - i * 7);
      weekBuckets.push({
        label: s.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
        total: 0,
        start: s,
      });
    }

    for (const e of expenses) {
      const [y, m, d] = e.date.split("-").map(Number);
      const date = new Date(y, m - 1, d);
      if (y === yr && m - 1 === mo) {
        monthTotal += e.amount;
        byCategory[e.category] += e.amount;
        if (!biggest || e.amount > biggest.amount) biggest = e;
      }
      if (date >= weekStart) weekTotal += e.amount;
      for (let i = 0; i < weekBuckets.length; i++) {
        const s = weekBuckets[i].start;
        const end = new Date(s);
        end.setDate(end.getDate() + 7);
        if (date >= s && date < end) weekBuckets[i].total += e.amount;
      }
    }

    let topCategory: Category | null = null;
    let topCategoryAmount = 0;
    for (const c of CATEGORIES) {
      if (byCategory[c] > topCategoryAmount) {
        topCategoryAmount = byCategory[c];
        topCategory = c;
      }
    }

    const pieData = CATEGORIES.filter((c) => byCategory[c] > 0).map((c) => ({
      name: c,
      value: byCategory[c],
    }));

    return {
      monthTotal,
      weekTotal,
      biggest,
      topCategory,
      topCategoryAmount,
      pieData,
      weekBuckets,
    };
  }, [expenses]);

  const monthName = new Date().toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="font-display text-4xl">Dashboard</h1>
        <p className="text-muted-foreground">{monthName}</p>
      </div>

      {expenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">
          Add expenses on the home page to see your dashboard come to life.
        </div>
      ) : (
        <>
          {/* KPI grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi
              icon={<Calendar className="h-4 w-4" />}
              label="This month"
              value={formatINR(stats.monthTotal)}
              accent
            />
            <Kpi
              icon={<TrendingUp className="h-4 w-4" />}
              label="This week"
              value={formatINR(stats.weekTotal)}
            />
            <Kpi
              icon={<Flame className="h-4 w-4" />}
              label="Biggest expense"
              value={stats.biggest ? formatINR(stats.biggest.amount) : "—"}
              hint={stats.biggest ? stats.biggest.merchant : "None yet"}
            />
            <Kpi
              icon={<Trophy className="h-4 w-4" />}
              label="Top category"
              value={stats.topCategory ?? "—"}
              hint={
                stats.topCategory ? formatINR(stats.topCategoryAmount) : "No spends"
              }
            />
          </div>

          {/* Charts */}
          <div className="mt-6 grid gap-4 lg:grid-cols-5">
            <Card title="Spending by category" className="lg:col-span-2">
              {stats.pieData.length === 0 ? (
                <EmptyChart />
              ) : (
                <>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={stats.pieData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={2}
                          stroke="var(--card)"
                          strokeWidth={2}
                        >
                          {stats.pieData.map((d) => (
                            <Cell
                              key={d.name}
                              fill={CATEGORY_STYLES[d.name as Category].hex}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "var(--card)",
                            border: "1px solid var(--border)",
                            borderRadius: 12,
                            fontSize: 12,
                          }}
                          formatter={(v: number) => formatINR(v)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {stats.pieData.map((d) => (
                      <div
                        key={d.name}
                        className="flex items-center gap-2 rounded-full bg-muted/60 px-2.5 py-1 text-xs"
                      >
                        <CategoryChip category={d.name as Category} size="sm" />
                        <span className="font-medium">{formatINR(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            <Card title="Weekly spending" className="lg:col-span-3">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.weekBuckets}
                    margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="var(--border)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : v)}
                    />
                    <Tooltip
                      cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                      contentStyle={{
                        background: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                      formatter={(v: number) => [formatINR(v), "Spent"]}
                    />
                    <Bar
                      dataKey="total"
                      fill="var(--primary)"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </>
      )}
    </AppShell>
  );
}

function Kpi({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={
        "rounded-2xl border border-border bg-card p-4 shadow-soft " +
        (accent ? "bg-gradient-primary text-primary-foreground border-transparent" : "")
      }
    >
      <div
        className={
          "flex items-center gap-1.5 text-xs uppercase tracking-wide " +
          (accent ? "text-primary-foreground/80" : "text-muted-foreground")
        }
      >
        {icon}
        {label}
      </div>
      <div className="mt-2 font-display text-3xl">{value}</div>
      {hint && (
        <div
          className={
            "mt-1 text-xs " +
            (accent ? "text-primary-foreground/80" : "text-muted-foreground")
          }
        >
          {hint}
        </div>
      )}
    </div>
  );
}

function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={"rounded-2xl border border-border bg-card p-5 shadow-soft " + className}
    >
      <h2 className="mb-3 text-sm font-semibold text-foreground">{title}</h2>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="grid h-56 place-items-center text-sm text-muted-foreground">
      No data for this month yet.
    </div>
  );
}
