import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Category {
  id: number;
  name: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Fetch error:", error);
    else setCategories(data || []);
  };

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const { error } = await supabase
      .from("categories")
      .insert({ name: newCategory });
    if (error) console.error("Insert error:", error);
    setNewCategory("");
    fetchCategories();
  };

  const deleteCategory = async (id: number) => {
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) console.error("Delete error:", error);
    fetchCategories();
  };

  const startEdit = (id: number, name: string) => {
    setEditingId(id);
    setEditingName(name);
  };

  const updateCategory = async () => {
    if (!editingName.trim()) return;
    const { error } = await supabase
      .from("categories")
      .update({ name: editingName })
      .eq("id", editingId);
    if (error) console.error("Update error:", error);
    setEditingId(null);
    setEditingName("");
    fetchCategories();
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Manage Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Add Category */}
            <div>
              <Label htmlFor="new-category" className="mb-1 block">New Category</Label>
              <div className="flex gap-3">
                <Input
                  id="new-category"
                  placeholder="Enter category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                />
                <Button onClick={addCategory}>Add</Button>
              </div>
            </div>

            {/* List */}
            <ul className="divide-y border rounded-md">
              {categories.map((cat) => (
                <li key={cat.id} className="flex justify-between items-center px-4 py-3">
                  {editingId === cat.id ? (
                    <div className="flex w-full items-center gap-3">
                      <Input
                        className="flex-1"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                      />
                      <Button size="sm" onClick={updateCategory}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-gray-800 font-medium">{cat.name}</span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(cat.id, cat.name)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </>
                  )}
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-center text-gray-500 py-4">No categories yet.</li>
              )}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Categories;
