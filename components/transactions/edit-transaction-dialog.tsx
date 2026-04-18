"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useAccounts } from "@/lib/hooks";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Transaction } from "@/lib/types";

interface EditTransactionDialogProps {
  transaction: Transaction;
  month: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function EditTransactionDialog({
  transaction,
  month,
  open,
  onOpenChange,
  onSuccess,
}: EditTransactionDialogProps) {
  const [saving, setSaving] = useState(false);

  const [account, setAccount] = useState(transaction.account);
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(Math.abs(transaction.incomeExpense)));
  const [type, setType] = useState<"Income" | "Expense">(transaction.categoryType);
  const [subcategory, setSubcategory] = useState(transaction.subcategory);

  const { data: catData } = useCategories();
  const { data: accData } = useAccounts();

  const filteredCategories =
    catData?.categories.filter((c) => c.categoryType === type) ?? [];

  async function handleSubmit() {
    if (!account || !date || !description || !amount || !subcategory) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/transactions/${transaction.rowIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account,
          date,
          description,
          amount: parseFloat(amount),
          type,
          subcategory,
          month,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update transaction");
      }

      toast.success("Transaction updated");
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Transaction</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Type */}
          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={type === "Expense" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setType("Expense");
                  setSubcategory("");
                }}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={type === "Income" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => {
                  setType("Income");
                  setSubcategory("");
                }}
              >
                Income
              </Button>
            </div>
          </div>

          {/* Account */}
          <div className="grid gap-2">
            <Label>Account</Label>
            <Select value={account} onValueChange={setAccount}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accData?.accounts.map((a) => (
                  <SelectItem key={a.rowIndex} value={a.name}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label>Date (DD/MM/YYYY)</Label>
            <Input
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Amount */}
          <div className="grid gap-2">
            <Label>Amount</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Subcategory */}
          <div className="grid gap-2">
            <Label>Category</Label>
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map((c) => (
                  <SelectItem key={c.rowIndex} value={c.subcategory}>
                    {c.category} → {c.subcategory}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}