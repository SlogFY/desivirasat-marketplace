import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Loader2, X, Check } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Category {
  id: string;
  name: string;
  name_hindi: string | null;
  description: string | null;
  image_url: string | null;
}

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", name_hindi: "", description: "" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        name_hindi: form.name_hindi || null,
        description: form.description || null,
      };
      if (editing) {
        const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: editing ? "Category updated!" : "Category created!" });
      setDialogOpen(false);
      setEditing(null);
      setForm({ name: "", name_hindi: "", description: "" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast({ title: "Category deleted" });
      setDeleteId(null);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({ name: cat.name, name_hindi: cat.name_hindi || "", description: cat.description || "" });
    setDialogOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", name_hindi: "", description: "" });
    setDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage product categories</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add Category</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories?.map((cat) => (
            <div key={cat.id} className="bg-card p-4 rounded-xl border border-border">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold capitalize">{cat.name}</h3>
                  {cat.name_hindi && <p className="text-sm text-muted-foreground">{cat.name_hindi}</p>}
                  {cat.description && <p className="text-sm text-muted-foreground mt-1">{cat.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => setDeleteId(cat.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit Category" : "New Category"}</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Name (Hindi)</Label>
              <Input value={form.name_hindi} onChange={(e) => setForm({ ...form, name_hindi: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editing ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete this category.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCategories;
