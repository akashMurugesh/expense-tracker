"use client";

import { useState } from "react";
import { useCategories, useAccounts, useMembers } from "@/lib/hooks";
import { usePreferences, CURRENCIES } from "@/lib/preferences";
import { ThemeToggle } from "@/components/layout/theme/theme-toggle";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Plus, Pencil, Trash2, Loader2, Settings2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Category, Account, Member } from "@/lib/types";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your preferences and data
        </p>
      </div>

      {/* ── Preferences ─────────────────────────────────────── */}
      <PreferencesSection />

      {/* ── Data Management ──────────────────────────────────── */}
      <div>
        <h2 className="text-xl font-semibold tracking-tight mb-4">Data Management</h2>
        <Tabs defaultValue="accounts">
          <TabsList>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          <TabsContent value="accounts" className="mt-6">
            <AccountsManager />
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <CategoriesManager />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <MembersManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  PREFERENCES SECTION
// ═══════════════════════════════════════════════════════════════════

function PreferencesSection() {
  const { prefs, updatePrefs } = usePreferences();
  const { data: accData } = useAccounts();
  const { data: memData } = useMembers();

  const sheetsUrl = prefs.sheetsId
    ? `https://docs.google.com/spreadsheets/d/${prefs.sheetsId}`
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold tracking-tight">
          Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Appearance */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Appearance</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Switch between light and dark mode</p>
          </div>
          <ThemeToggle />
        </div>

        <Separator />

        {/* Currency */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Currency</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Used for formatting amounts across the app</p>
          </div>
          <Select value={prefs.currency} onValueChange={(v) => updatePrefs({ currency: v as typeof prefs.currency })}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.symbol} {c.code} — {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Default Account */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Default Account</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Pre-selected when adding transactions</p>
          </div>
          <Select value={prefs.defaultAccount} onValueChange={(v) => updatePrefs({ defaultAccount: v })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {accData?.accounts.map((a) => (
                <SelectItem key={a.rowIndex} value={a.name}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Default Member */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Default Member</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Pre-selected when adding transactions</p>
          </div>
          <Select value={prefs.defaultMember} onValueChange={(v) => updatePrefs({ defaultMember: v })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {memData?.members.map((m) => (
                <SelectItem key={m.rowIndex} value={m.name}>
                  {m.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Google Sheet Link */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Google Sheet</Label>
            <p className="text-xs text-muted-foreground mt-0.5">Open the source spreadsheet directly</p>
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="w-48 text-xs"
              placeholder="Paste Sheet ID"
              value={prefs.sheetsId}
              onChange={(e) => updatePrefs({ sheetsId: e.target.value.trim() })}
            />
            {sheetsUrl && (
              <Button variant="outline" size="icon" asChild>
                <a href={sheetsUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  ACCOUNTS MANAGER
// ═══════════════════════════════════════════════════════════════════

function AccountsManager() {
  const { data, isLoading, mutate } = useAccounts();
  const [addOpen, setAddOpen] = useState(false);
  const [editAcc, setEditAcc] = useState<Account | null>(null);
  const [deleteAcc, setDeleteAcc] = useState<Account | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Accounts
          </CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Add Account
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data && data.accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Name</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.accounts.map((acc) => (
                  <TableRow key={acc.rowIndex}>
                    <TableCell className="font-medium">{acc.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditAcc(acc)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteAcc(acc)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Settings2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No accounts yet. Add your first account to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <AddAccountDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={() => mutate()} />

      {/* Edit Account Dialog */}
      {editAcc && (
        <EditAccountDialog
          key={editAcc.rowIndex}
          account={editAcc}
          open={!!editAcc}
          onOpenChange={(open) => !open && setEditAcc(null)}
          onSuccess={() => mutate()}
        />
      )}

      {/* Delete Account Dialog */}
      {deleteAcc && (
        <DeleteConfirmDialog
          open={!!deleteAcc}
          onOpenChange={(open) => !open && setDeleteAcc(null)}
          title="Delete Account"
          description={`Are you sure you want to delete "${deleteAcc.name}"? This won't delete existing transactions using this account.`}
          onConfirm={async () => {
            const res = await fetch(`/api/accounts/${deleteAcc.rowIndex}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete account");
            toast.success("Account deleted");
            setDeleteAcc(null);
            mutate();
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  CATEGORIES MANAGER
// ═══════════════════════════════════════════════════════════════════

function CategoriesManager() {
  const { data, isLoading, mutate } = useCategories();
  const [addOpen, setAddOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Categories
          </CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Add Category
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data && data.categories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.categories.map((cat) => (
                  <TableRow key={cat.rowIndex}>
                    <TableCell className="text-muted-foreground">{cat.category}</TableCell>
                    <TableCell className="font-medium">{cat.subcategory}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        cat.categoryType === "Income"
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                          : "bg-red-500/15 text-red-700 dark:text-red-400"
                      }`}>
                        {cat.categoryType}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditCat(cat)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteCat(cat)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Settings2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No categories yet. Add your first category to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Category Dialog */}
      <AddCategoryDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={() => mutate()} />

      {/* Edit Category Dialog */}
      {editCat && (
        <EditCategoryDialog
          key={editCat.rowIndex}
          category={editCat}
          open={!!editCat}
          onOpenChange={(open) => !open && setEditCat(null)}
          onSuccess={() => mutate()}
        />
      )}

      {/* Delete Category Dialog */}
      {deleteCat && (
        <DeleteConfirmDialog
          open={!!deleteCat}
          onOpenChange={(open) => !open && setDeleteCat(null)}
          title="Delete Category"
          description={`Are you sure you want to delete "${deleteCat.category} → ${deleteCat.subcategory}"? Existing transactions with this category won't be affected.`}
          onConfirm={async () => {
            const res = await fetch(`/api/categories/${deleteCat.rowIndex}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete category");
            toast.success("Category deleted");
            setDeleteCat(null);
            mutate();
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MEMBERS MANAGER
// ═══════════════════════════════════════════════════════════════════

function MembersManager() {
  const { data, isLoading, mutate } = useMembers();
  const [addOpen, setAddOpen] = useState(false);
  const [editMem, setEditMem] = useState<Member | null>(null);
  const [deleteMem, setDeleteMem] = useState<Member | null>(null);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Family Members
          </CardTitle>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus data-icon="inline-start" />
            Add Member
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : data && data.members.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member Name</TableHead>
                  <TableHead className="text-right w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.members.map((mem) => (
                  <TableRow key={mem.rowIndex}>
                    <TableCell className="font-medium">{mem.name}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" onClick={() => setEditMem(mem)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => setDeleteMem(mem)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Settings2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No members yet. Add family members to tag transactions.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <AddMemberDialog open={addOpen} onOpenChange={setAddOpen} onSuccess={() => mutate()} />

      {editMem && (
        <EditMemberDialog
          key={editMem.rowIndex}
          member={editMem}
          open={!!editMem}
          onOpenChange={(open) => !open && setEditMem(null)}
          onSuccess={() => mutate()}
        />
      )}

      {deleteMem && (
        <DeleteConfirmDialog
          open={!!deleteMem}
          onOpenChange={(open) => !open && setDeleteMem(null)}
          title="Delete Member"
          description={`Are you sure you want to delete "${deleteMem.name}"? Existing transactions tagged with this member won't be affected.`}
          onConfirm={async () => {
            const res = await fetch(`/api/members/${deleteMem.rowIndex}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete member");
            toast.success("Member deleted");
            setDeleteMem(null);
            mutate();
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SHARED DIALOGS
// ═══════════════════════════════════════════════════════════════════

// ── Add Account ─────────────────────────────────────────────────
function AddAccountDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add account");
      toast.success("Account added");
      setName("");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to add account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Account Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HDFC Bank"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Account ────────────────────────────────────────────────
function EditAccountDialog({
  account,
  open,
  onOpenChange,
  onSuccess,
}: {
  account: Account;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(account.name);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Account name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/accounts/${account.rowIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update account");
      toast.success("Account updated");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Account</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Account Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Category ────────────────────────────────────────────────
function AddCategoryDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [categoryType, setCategoryType] = useState<"Income" | "Expense">("Expense");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!category.trim() || !subcategory.trim()) {
      toast.error("Category and subcategory are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.trim(),
          subcategory: subcategory.trim(),
          categoryType,
        }),
      });
      if (!res.ok) throw new Error("Failed to add category");
      toast.success("Category added");
      setCategory("");
      setSubcategory("");
      setCategoryType("Expense");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to add category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={categoryType === "Expense" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setCategoryType("Expense")}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={categoryType === "Income" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setCategoryType("Income")}
              >
                Income
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Category (parent group)</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Food, Transport, Salary"
            />
          </div>
          <div className="grid gap-2">
            <Label>Subcategory</Label>
            <Input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Groceries, Uber, Monthly Salary"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Category ───────────────────────────────────────────────
function EditCategoryDialog({
  category: cat,
  open,
  onOpenChange,
  onSuccess,
}: {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [category, setCategory] = useState(cat.category);
  const [subcategory, setSubcategory] = useState(cat.subcategory);
  const [categoryType, setCategoryType] = useState<"Income" | "Expense">(cat.categoryType);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!category.trim() || !subcategory.trim()) {
      toast.error("Category and subcategory are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/categories/${cat.rowIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: category.trim(),
          subcategory: subcategory.trim(),
          categoryType,
        }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      toast.success("Category updated");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={categoryType === "Expense" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setCategoryType("Expense")}
              >
                Expense
              </Button>
              <Button
                type="button"
                variant={categoryType === "Income" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => setCategoryType("Income")}
              >
                Income
              </Button>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Category (parent group)</Label>
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Subcategory</Label>
            <Input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Add Member ──────────────────────────────────────────────────
function AddMemberDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Member name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to add member");
      toast.success("Member added");
      setName("");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to add member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Member Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Me, Wife, Joint"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Edit Member ─────────────────────────────────────────────────
function EditMemberDialog({
  member,
  open,
  onOpenChange,
  onSuccess,
}: {
  member: Member;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(member.name);
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!name.trim()) {
      toast.error("Member name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/members/${member.rowIndex}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (!res.ok) throw new Error("Failed to update member");
      toast.success("Member updated");
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Failed to update member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Member</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label>Member Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Generic Delete Confirm ──────────────────────────────────────
function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">{description}</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="h-4 w-4 animate-spin" data-icon="inline-start" />}
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}