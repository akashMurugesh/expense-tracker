"use client";

import { useState } from "react";
import { useSummary } from "@/lib/hooks";
import { toMonthTab } from "@/lib/utils";
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
import { CategoryBadge } from "@/components/ui/category-badge";
import { usePreferences } from "@/lib/preferences";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

const CHART_COLORS = [
  "#7C3AED", "#22C55E", "#EAB308", "#EF4444", "#A78BFA",
  "#06B6D4", "#F97316", "#EC4899", "#14B8A6", "#8B5CF6",
];


export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = toMonthTab(currentDate);
  const { data, error, isLoading } = useSummary(month);
  const { formatCurrency } = usePreferences();

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
        <p className="text-destructive">Failed to load dashboard data. Check your Google Sheets connection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header + Month Selector ──────────────────────── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Your financial overview at a glance
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-border bg-card px-1 py-1 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={goToPrevMonth}
          >
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

      {/* ── Summary Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          title="Total Income"
          value={data ? formatCurrency(data.totalIncome) : undefined}
          icon={<TrendingUp className="h-5 w-5 text-emerald-500" />}
          loading={isLoading}
        />
        <SummaryCard
          title="Total Expenses"
          value={data ? formatCurrency(data.totalExpenses) : undefined}
          icon={<TrendingDown className="h-5 w-5 text-red-500" />}
          loading={isLoading}
        />
        <SummaryCard
          title="Net Balance"
          value={data ? formatCurrency(data.netBalance) : undefined}
          icon={<Wallet className="h-5 w-5 text-primary" />}
          loading={isLoading}
          valueClass={data && data.netBalance >= 0 ? "text-emerald-500" : "text-red-500"}
        />
        <SummaryCard
          title="Transactions"
          value={data ? String(data.transactionCount) : undefined}
          icon={<ArrowLeftRight className="h-5 w-5 text-muted-foreground" />}
          loading={isLoading}
        />
      </div>

      {/* ── Charts + Recent Transactions ─────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Spending by Category — Pie Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Spending by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : data && data.byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.byCategory}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={50}
                    paddingAngle={2}
                    label={({ name }) => name}
                  >
                    {data.byCategory.map((_, index) => (
                      <Cell
                        key={index}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{
                      backgroundColor: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      color: "var(--popover-foreground)",
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No expense data this month
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-lg font-semibold tracking-tight">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data && data.recentTransactions.length > 0 ? (
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
                  {data.recentTransactions.map((t) => (
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
                      <TableCell
                        className={`text-right font-semibold ${
                          t.categoryType === "Income"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {t.categoryType === "Income" ? "+" : "-"}
                        {formatCurrency(Math.abs(t.incomeExpense))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">
                No transactions this month
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Summary Card Component ─────────────────────────────────────
function SummaryCard({
  title,
  value,
  icon,
  loading,
  valueClass,
}: {
  title: string;
  value?: string;
  icon: React.ReactNode;
  loading: boolean;
  valueClass?: string;
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
          <p className={`text-2xl font-bold tracking-tight ${valueClass ?? ""}`}>
            {value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}