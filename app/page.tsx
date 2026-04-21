"use client";

import { useState } from "react";
import { useSummary, useMembers } from "@/lib/hooks";
import { toMonthTab } from "@/lib/utils";
import { usePreferences } from "@/lib/preferences";
import { CategoryBadge } from "@/components/ui/category-badge";
import { SpendingDonut } from "@/components/charts/spending-donut";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Receipt,
  PiggyBank,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Eye,
  EyeOff,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedMember, setSelectedMember] = useState("all");
  const month = toMonthTab(currentDate);

  const { data: membersData } = useMembers();
  const { data, error, isLoading } = useSummary(
    month,
    selectedMember === "all" ? undefined : selectedMember
  );
  const { prefs, updatePrefs, formatCurrency } = usePreferences();
  const hideValues = prefs.hideValues;

  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  function goToPrevMonth() {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  }

  function goToNextMonth() {
    if (!isCurrentMonth) {
      setCurrentDate((prev) => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + 1);
        return d;
      });
    }
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">
          Failed to load dashboard data. Check your Google Sheets connection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header + Filters ──────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Your financial overview at a glance
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => updatePrefs({ hideValues: !hideValues })}
            aria-label={hideValues ? "Show values" : "Hide values"}
          >
            {hideValues ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="w-40">
              <Users className="h-4 w-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              {membersData?.members.map((m) => (
                <SelectItem key={m.rowIndex} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-1 py-1 shadow-sm">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={goToPrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 px-3 min-w-[140px] justify-center">
              <CalendarDays className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">{month}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={goToNextMonth}
              disabled={isCurrentMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <SummaryCard
          title="Total Income"
          value={data ? formatCurrency(data.totalIncome) : undefined}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          loading={isLoading}
          hidden={hideValues}
        />
        <SummaryCard
          title="Investments"
          value={data ? formatCurrency(data.totalInvestments) : undefined}
          icon={<PiggyBank className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
          hidden={hideValues}
        />
        <SummaryCard
          title="Total Expenses"
          value={data ? formatCurrency(data.totalExpenses) : undefined}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          loading={isLoading}
          hidden={hideValues}
        />
        <SummaryCard
          title="Net Balance"
          value={data ? formatCurrency(data.netBalance) : undefined}
          icon={<Wallet className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
          valueClass={data && data.netBalance >= 0 ? "text-emerald-500" : "text-red-500"}
          hidden={hideValues}
        />
        <SummaryCard
          title="Expenses"
          value={data ? String(data.expenseCount) : undefined}
          icon={<Receipt className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
          hidden={hideValues}
        />
      </div>

      {/* ── Spending by Category: Chart + Table ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SpendingDonut
          byCategory={data?.byCategory}
          totalSpent={(data?.totalExpenses ?? 0) + (data?.totalInvestments ?? 0)}
          isLoading={isLoading}
          formatCurrency={formatCurrency}
          className="lg:col-span-3"
        />
        <CategoryBreakdownTable
          byCategory={data?.byCategory}
          totalExpenses={data?.totalExpenses ?? 0}
          isLoading={isLoading}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* ── Top 10 Expenses ──────────────────────────────────── */}
      <TopExpensesTable
        expenses={data?.topExpenses}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

// ── Summary Card ────────────────────────────────────────────────
function SummaryCard({
  title,
  value,
  icon,
  loading,
  valueClass,
  hidden,
}: {
  title: string;
  value?: string;
  icon: React.ReactNode;
  loading: boolean;
  valueClass?: string;
  hidden?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-28" />
        ) : (
          <p
            className={`text-2xl font-bold tracking-tight transition-all ${valueClass ?? ""} ${hidden ? "blur-md select-none" : ""}`}
          >
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}


// ── Spending by Category Table ──────────────────────────────────
function CategoryBreakdownTable({
  byCategory,
  totalExpenses,
  isLoading,
  formatCurrency,
}: {
  byCategory?: { category: string; amount: number }[];
  totalExpenses: number;
  isLoading: boolean;
  formatCurrency: (n: number) => string;
}) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Category Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : byCategory && byCategory.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right w-16">%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byCategory.map((cat) => {
                const pct = totalExpenses > 0
                  ? ((cat.amount / totalExpenses) * 100).toFixed(1)
                  : "0.0";
                return (
                  <TableRow key={cat.category}>
                    <TableCell>
                      <CategoryBadge category={cat.category} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(cat.amount)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {pct}%
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-12">
            No expense data this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// ── Top 10 Expenses Table ───────────────────────────────────────
function TopExpensesTable({
  expenses,
  isLoading,
  formatCurrency,
}: {
  expenses?: { rowIndex: number; date: string; description: string; member: string; subcategory: string; category: string; incomeExpense: number }[];
  isLoading: boolean;
  formatCurrency: (n: number) => string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Top 10 Expenses
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : expenses && expenses.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Member</TableHead>
                <TableHead className="hidden lg:table-cell">Subcategory</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses.map((t) => (
                <TableRow key={`${t.rowIndex}-${t.date}`}>
                  <TableCell className="text-muted-foreground">
                    {t.date}
                  </TableCell>
                  <TableCell className="font-medium">
                    {t.description}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {t.member && (
                      <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        @{t.member}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {t.subcategory}
                  </TableCell>
                  <TableCell>
                    <CategoryBadge category={t.category} />
                  </TableCell>
                  <TableCell className="text-right font-semibold text-red-500">
                    -{formatCurrency(Math.abs(t.incomeExpense))}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-12">
            No expenses this month
          </p>
        )}
      </CardContent>
    </Card>
  );
}
