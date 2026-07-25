import { useState } from "react";
import {
  deleteExpense,
  updateExpense,
  formatINR,
  formatDatePretty,
  CATEGORIES,
  type Expense,
  type Category,
} from "@/lib/expenses";
import { CategoryChip } from "./CategoryChip";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { toast } from "sonner";

export function ExpenseItem({ expense }: { expense: Expense }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    amount: String(expense.amount),
    merchant: expense.merchant,
    note: expense.note,
    category: expense.category as Category,
    date: expense.date,
  });

  function save() {
    const amt = parseFloat(draft.amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    updateExpense(expense.id, {
      amount: amt,
      merchant: draft.merchant.trim() || "Misc",
      note: draft.note.trim(),
      category: draft.category,
      date: draft.date,
    });
    setEditing(false);
    toast.success("Expense updated");
  }

  function remove() {
    deleteExpense(expense.id);
    toast.success("Deleted");
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <div className="grid gap-2.5 sm:grid-cols-2">
          <label className="text-xs font-medium text-muted-foreground">
            Amount
            <Input
              type="number"
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
              className="mt-1"
            />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Merchant
            <Input
              value={draft.merchant}
              onChange={(e) => setDraft({ ...draft, merchant: e.target.value })}
              className="mt-1"
            />
          </label>
          <label className="text-xs font-medium text-muted-foreground sm:col-span-2">
            Note
            <Input
              value={draft.note}
              onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              className="mt-1"
            />
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Category
            <Select
              value={draft.category}
              onValueChange={(v) => setDraft({ ...draft, category: v as Category })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="text-xs font-medium text-muted-foreground">
            Date
            <Input
              type="date"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
              className="mt-1"
            />
          </label>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button size="sm" onClick={save}>
            <Check className="h-4 w-4" /> Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-soft transition-shadow hover:shadow-glow">
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="font-semibold text-lg text-foreground">
            {formatINR(expense.amount)}
          </span>
          <span className="font-medium text-foreground truncate">
            {expense.merchant}
          </span>
        </div>
        {expense.note && (
          <p className="mt-0.5 text-sm text-muted-foreground truncate">
            {expense.note}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <CategoryChip category={expense.category} />
          <span className="text-xs text-muted-foreground">
            {formatDatePretty(expense.date)}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setEditing(true)}
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={remove}
          aria-label="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
