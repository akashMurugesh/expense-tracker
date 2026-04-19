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
import { DatePicker } from "@/components/ui/date-picker";
import { SubcategoryCombobox } from "@/components/transactions/subcategory-combobox";
import { useCategories, useAccounts, useMembers } from "@/lib/hooks";
import { usePreferences } from "@/lib/preferences";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddTransactionDialogProps {
  onSuccess: () => void;
}

export function AddTransactionDialog({ onSuccess }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { prefs } = usePreferences();

  const [account, setAccount] = useState(prefs.defaultAccount);
  const [date, setDate] = useState(formatToday());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [member, setMember] = useState(prefs.defaultMember);

  const { data: catData } = useCategories();
  const { data: accData } = useAccounts();
  const { data: memData } = useMembers();

  // Derive type and category from selected subcategory
  const matchedCategory = catData?.categories.find((c) => c.subcategory === subcategory);
  const type = matchedCategory?.categoryType ?? "Expense";

  function resetForm() {
    setAccount(prefs.defaultAccount);
    setDate(formatToday());
    setDescription("");
    setAmount("");
    setSubcategory("");
    setMember(prefs.defaultMember);
  }

  async function handleSubmit() {
    if (!account || !date || !description || !amount || !subcategory || !member) {
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
          member,
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

          {/* Member */}
          <div className="grid gap-2">
            <Label>Member</Label>
            <Select value={member} onValueChange={setMember}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {memData?.members.map((m) => (
                  <SelectItem key={m.rowIndex} value={m.name}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="grid gap-2">
            <Label>Date</Label>
            <DatePicker value={date} onChange={setDate} />
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

          {/* Subcategory — auto-populates category and type */}
          <div className="grid gap-2">
            <Label>Subcategory</Label>
            <SubcategoryCombobox
              categories={catData?.categories ?? []}
              value={subcategory}
              onChange={setSubcategory}
            />
            {matchedCategory && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Category: <span className="font-medium text-foreground">{matchedCategory.category}</span></span>
                <span>·</span>
                <span>Type: <span className={matchedCategory.categoryType === "Income" ? "font-medium text-emerald-500" : "font-medium text-red-500"}>{matchedCategory.categoryType}</span></span>
              </div>
            )}
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
  return format(new Date(), "dd/MM/yyyy");
}
