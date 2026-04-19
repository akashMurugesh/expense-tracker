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
import { DatePicker } from "@/components/ui/date-picker";
import { SubcategoryCombobox } from "@/components/transactions/subcategory-combobox";
import { useCategories, useAccounts, useMembers } from "@/lib/hooks";
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
  const [subcategory, setSubcategory] = useState(transaction.subcategory);
  const [member, setMember] = useState(transaction.member);

  const { data: catData } = useCategories();
  const { data: accData } = useAccounts();
  const { data: memData } = useMembers();

  // Derive type from selected subcategory
  const matchedCategory = catData?.categories.find((c) => c.subcategory === subcategory);
  const type = matchedCategory?.categoryType ?? transaction.categoryType;

  async function handleSubmit() {
    if (!account || !date || !description || !amount || !subcategory || !member) {
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
          member,
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
