// admin/pages/Gallery.tsx
"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type GalleryItem = {
  id: number;
  title: string;
  description: string;
  image_url: string;
};

export default function GalleryPage() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchGallery = async () => {
    const { data } = await supabase.from("gallery").select("*").order("id", { ascending: false });
    if (data) setGallery(data);
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleUpload = async () => {
    if (!image || !title) return;
    const { data: uploadData, error } = await supabase.storage
      .from("gallery-images")
      .upload(`gallery/${Date.now()}-${image.name}`, image);
    if (error) return alert("Upload failed");

    const url = supabase.storage.from("gallery-images").getPublicUrl(uploadData.path).data.publicUrl;
    await supabase.from("gallery").insert({ title, description: desc, image_url: url });

    setTitle(""); setDesc(""); setImage(null);
    fetchGallery();
  };

  const handleDelete = async (id: number) => {
    await supabase.from("gallery").delete().eq("id", id);
    fetchGallery();
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDesc(item.description);
  };

  const handleUpdate = async (id: number) => {
    await supabase.from("gallery").update({ title: editTitle, description: editDesc }).eq("id", id);
    setEditingId(null);
    fetchGallery();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Gallery Manager</h2>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Image</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <Input type="file" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          <div className="md:col-span-3">
            <Button onClick={handleUpload}>Upload</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item) => (
          <Card key={item.id}>
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-48 object-cover rounded-t-md"
            />
            <CardContent className="space-y-2">
              {editingId === item.id ? (
                <>
                  <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
                  <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleUpdate(item.id)}>Save</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="font-semibold text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(item)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>Delete</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
