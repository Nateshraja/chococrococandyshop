import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const SUPABASE_URL = "https://fjgddraevrkrrfouphhb.supabase.co";
const STORAGE_BUCKET = "product-images";

const Products = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    id: null as number | null,
    name: "",
    category_id: "",
    price: "",
    image: null as File | null,
    image_url: "",
  });
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) console.error("Fetch products error:", error);
    else setProducts(data || []);
  };

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*");
    if (error) console.error("Fetch categories error:", error);
    else setCategories(data || []);
  };

  const handleUploadImage = async (file: File) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, file);
    if (error) throw error;
    return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${data.path}`;
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      let image_url = form.image_url;

      if (form.image) {
        image_url = await handleUploadImage(form.image);
      }

      if (isEditing && form.id !== null) {
        const { error } = await supabase
          .from("products")
          .update({
            name: form.name,
            category_id: form.category_id,
            price: parseFloat(form.price),
            image_url,
          })
          .eq("id", form.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert([
          {
            name: form.name,
            category_id: form.category_id,
            price: parseFloat(form.price),
            image_url,
          },
        ]);
        if (error) throw error;
      }

      resetForm();
      fetchProducts();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: "",
      category_id: "",
      price: "",
      image: null,
      image_url: "",
    });
    setIsEditing(false);
  };

  const handleEdit = (product: any) => {
    setForm({
      id: product.id,
      name: product.name,
      category_id: product.category_id,
      price: product.price,
      image: null,
      image_url: product.image_url,
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {isEditing ? "Edit Product" : "Add Product"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="block mb-1">Product Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>
            <div>
              <Label className="block mb-1">Category</Label>
              <Select
                value={form.category_id}
                onValueChange={(value) =>
                  setForm({ ...form, category_id: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block mb-1">Price</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) =>
                  setForm({ ...form, price: e.target.value })
                }
                placeholder="Enter price"
              />
            </div>
            <div>
              <Label className="block mb-1">Upload Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files?.[0] || null })
                }
              />
            </div>
          </div>
          <div className="flex gap-4">
            <Button onClick={handleSubmit} disabled={uploading}>
              {uploading
                ? "Saving..."
                : isEditing
                ? "Update Product"
                : "Add Product"}
            </Button>
            {isEditing && (
              <Button variant="outline" onClick={resetForm}>
                Cancel Edit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Product List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border text-sm text-left">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Image</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Category</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p: any) => (
                <tr key={p.id}>
                  <td className="border px-4 py-2">
                    {p.image_url && (
                      <img
                        src={p.image_url}
                        alt="img"
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="border px-4 py-2">{p.name}</td>
                  <td className="border px-4 py-2">
                    {categories.find((c) => c.id === p.category_id)?.name}
                  </td>
                  <td className="border px-4 py-2">₹{p.price}</td>
                  <td className="border px-4 py-2">
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(p)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No products found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Products;
