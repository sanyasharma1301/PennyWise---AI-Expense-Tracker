import { useSyncExternalStore } from "react";

export type Category =
  | "Food"
  | "Travel"
  | "Education"
  | "Entertainment"
  | "Shopping"
  | "Bills"
  | "Other";

export const CATEGORIES: Category[] = [
  "Food",
  "Travel",
  "Education",
  "Entertainment",
  "Shopping",
  "Bills",
  "Other",
];

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  merchant: string;
  note: string;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
}

const STORAGE_KEY = "paisawise.expenses.v1";

// --- storage ---
function read(): Expense[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Expense[]) : [];
  } catch {
    return [];
  }
}

function write(next: Expense[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  listeners.forEach((l) => l());
}

const listeners = new Set<() => void>();
function subscribe(fn: () => void) {
  listeners.add(fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) fn();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: Expense[] = [];
export function useExpenses(): Expense[] {
  return useSyncExternalStore(
    subscribe,
    () => {
      // cache-stable snapshot
      const raw =
        typeof window !== "undefined"
          ? window.localStorage.getItem(STORAGE_KEY)
          : null;
      return raw ?? "__empty__";
    },
    () => "__empty__",
  ) === "__empty__"
    ? readOrEmpty()
    : readOrEmpty();
}

function readOrEmpty() {
  const list = read();
  return list.length ? list : EMPTY;
}

export function addExpense(input: Omit<Expense, "id" | "createdAt">): Expense {
  const now = new Date();
  const exp: Expense = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Math.random()).slice(2),
    createdAt: now.toISOString(),
  };
  write([exp, ...read()]);
  return exp;
}

export function updateExpense(id: string, patch: Partial<Expense>) {
  write(read().map((e) => (e.id === id ? { ...e, ...patch } : e)));
}

export function deleteExpense(id: string) {
  write(read().filter((e) => e.id !== id));
}

// --- parser: plain language -> structured ---
const MERCHANT_TO_CATEGORY: Record<string, Category> = {
  zomato: "Food",
  swiggy: "Food",
  dominos: "Food",
  mcd: "Food",
  mcdonalds: "Food",
  kfc: "Food",
  starbucks: "Food",
  cafe: "Food",
  canteen: "Food",
  mess: "Food",
  chai: "Food",
  tea: "Food",
  dinner: "Food",
  lunch: "Food",
  breakfast: "Food",
  snacks: "Food",
  auto: "Travel",
  ola: "Travel",
  uber: "Travel",
  rapido: "Travel",
  metro: "Travel",
  bus: "Travel",
  train: "Travel",
  irctc: "Travel",
  petrol: "Travel",
  fuel: "Travel",
  cab: "Travel",
  books: "Education",
  book: "Education",
  stationery: "Education",
  course: "Education",
  udemy: "Education",
  coursera: "Education",
  tuition: "Education",
  exam: "Education",
  fees: "Education",
  netflix: "Entertainment",
  spotify: "Entertainment",
  prime: "Entertainment",
  hotstar: "Entertainment",
  movie: "Entertainment",
  bookmyshow: "Entertainment",
  pvr: "Entertainment",
  game: "Entertainment",
  amazon: "Shopping",
  flipkart: "Shopping",
  myntra: "Shopping",
  meesho: "Shopping",
  ajio: "Shopping",
  clothes: "Shopping",
  shoes: "Shopping",
  recharge: "Bills",
  jio: "Bills",
  airtel: "Bills",
  vi: "Bills",
  electricity: "Bills",
  wifi: "Bills",
  rent: "Bills",
  bill: "Bills",
};

const STOP_WORDS = new Set([
  "for",
  "on",
  "at",
  "to",
  "the",
  "a",
  "an",
  "with",
  "and",
  "of",
  "in",
  "my",
  "from",
]);

export interface ParsedExpense {
  amount: number;
  category: Category;
  merchant: string;
  note: string;
}

export function parseExpense(input: string): ParsedExpense | null {
  const text = input.trim();
  if (!text) return null;

  // amount: first number found (₹ optional, rs/rupees optional)
  const cleaned = text.replace(/[₹,]/g, " ").replace(/\brs\.?\b|rupees?/gi, " ");
  const numMatch = cleaned.match(/\d+(?:\.\d+)?/);
  if (!numMatch) return null;
  const amount = parseFloat(numMatch[0]);
  if (!Number.isFinite(amount) || amount <= 0) return null;

  // remaining tokens
  const withoutNum = cleaned.replace(numMatch[0], " ");
  const tokens = withoutNum
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let category: Category = "Other";
  let merchant = "";
  const noteParts: string[] = [];

  for (const tok of tokens) {
    const low = tok.toLowerCase();
    if (MERCHANT_TO_CATEGORY[low]) {
      if (!merchant) merchant = capitalize(tok);
      category = MERCHANT_TO_CATEGORY[low];
    } else if (!STOP_WORDS.has(low)) {
      if (!merchant) merchant = capitalize(tok);
      else noteParts.push(tok);
    } else {
      noteParts.push(tok);
    }
  }

  const note = noteParts.filter((t) => !STOP_WORDS.has(t.toLowerCase())).join(" ");

  return {
    amount,
    category,
    merchant: merchant || "Misc",
    note: note.trim(),
  };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

// --- formatting ---
export function formatINR(n: number): string {
  return "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

export function todayISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDatePretty(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
