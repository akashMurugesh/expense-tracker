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
  DialogTrigger,
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
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddTransactionDialogProps {
  onSuccess: () => void;
}

export function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [account, setAccount] = useState("");
  const [date, setDate] = useState(formatToday());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [subcategory, setSubcategory] = useState("");

  const { data: catData } = useCategories();
  const { data: accData } = useAccounts();

  // Filter subcategories by type
  const filteredCategories =
    catData?.categories.filter((c) => c.categoryType === type) ?? [];

  function resetForm() {
    setAccount("");
    setDate(formatToday());
    setDescription("");
    setAmount("");
    setType("Expense");
    setSubcategory("");
  }

  async function handleSubmit() {
    if (!account || !date || !description || !amount || !subcategory) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account,
          date,
          description,
          amount: parseFloat(amount),
          type,
          subcategory,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add transaction");
      }

      toast.success("Transaction added");
      resetForm();
      setOpen(false);
      onSuccess();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus data-icon="inline-start" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
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
              placeholder="18/04/2026"
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Grocery shopping"
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
              placeholder="0.00"
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper: today as DD/MM/YYYY
function formatToday(): string {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}