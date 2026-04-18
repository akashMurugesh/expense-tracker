"use client";

import { useState } from "react";
import { useTransactions } from "@/lib/hooks";
import { MONTH_NAMES } from "@/lib/constants";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Search,
  Pencil,
  Trash2,
} from "lucide-react";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { EditTransactionDialog } from "@/components/transactions/edit-transaction-dialog";
import { DeleteTransactionDialog } from "@/components/transactions/delete-transaction-dialog";
import type { Transaction } from "@/lib/types";

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function toMonthTab(date: Date): string {
  return `${MONTH_NAMES[date.getMonth()]} ${date.getFullYear()}`;
}

export default function TransactionsPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const month = toMonthTab(currentDate);
  const { data, error, isLoading, mutate } = useTransactions(month);

  const [search, setSearch] = useState("");
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);

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

  // Filter by search text
  const transactions = (data?.transactions ?? []).filter((t) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.subcategory.toLowerCase().includes(q) ||
      t.account.toLowerCase().includes(q)
    );
  });

  // Totals for filtered view
  const totalIncome = transactions
    .filter((t) => t.categoryType === "Income")
    .reduce((sum, t) => sum + t.incomeExpense, 0);
  const totalExpenses = transactions
    .filter((t) => t.categoryType === "Expense")
    .reduce((sum, t) => sum + Math.abs(t.incomeExpense), 0);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">
          Failed to load transactions. Check your Google Sheets connection.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View, add, and manage your transactions
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
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

          {/* Add Button */}
          <AddTransactionDialog onSuccess={() => mutate()} />
        </div>
      </div>

      {/* ── Summary Bar ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-1.5">
          <span className="text-muted-foreground">Income:</span>
          <span className="font-semibold text-emerald-500">
            {currency.format(totalIncome)}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-1.5">
          <span className="text-muted-foreground">Expenses:</span>
          <span className="font-semibold text-red-500">
            {currency.format(totalExpenses)}
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-1.5">
          <span className="text-muted-foreground">Count:</span>
          <span className="font-semibold text-primary">
            {transactions.length}
          </span>
        </div>
      </div>

      {/* ── Search + Table ───────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">
            All Transactions
          </CardTitle>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Account</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={`${t.rowIndex}-${t.date}`}>
                    <TableCell className="text-muted-foreground">
                      {t.date}
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {t.description}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {t.account}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{t.subcategory}</Badge>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        t.categoryType === "Income"
                          ? "text-emerald-500"
                          : "text-red-500"
                      }`}
                    >
                      {t.categoryType === "Income" ? "+" : "-"}
                      {currency.format(Math.abs(t.incomeExpense))}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setEditTx(t)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteTx(t)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-12">
              {search
                ? "No transactions match your search"
                : "No transactions this month"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* ── Edit Dialog ──────────────────────────────────────── */}
      {editTx && (
        <EditTransactionDialog
          key={editTx.rowIndex}
          transaction={editTx}
          month={month}
          open={!!editTx}
          onOpenChange={(open) => !open && setEditTx(null)}
          onSuccess={() => mutate()}
        />
      )}

      {/* ── Delete Dialog ────────────────────────────────────── */}
      {deleteTx && (
        <DeleteTransactionDialog
          transaction={deleteTx}
          month={month}
          open={!!deleteTx}
          onOpenChange={(open) => !open && setDeleteTx(null)}
          onSuccess={() => mutate()}
        />
      )}
    </div>
  );
}