import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
};

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    const fetchGallery = async () => {
      const { data, error } = await supabase.from("gallery").select("*");
      if (error) console.error(error);
      else setItems(data || []);
    };

    fetchGallery();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-center">Chocolate Gallery</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {items.map(item => (
          <div key={item.id} className="shadow-md rounded-lg overflow-hidden">
            <img src={item.image_url} alt={item.title} className="w-full h-60 object-cover" />
            <div className="p-4 text-center">
              <p className="font-medium">{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryPage;
