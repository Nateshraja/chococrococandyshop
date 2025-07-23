import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Product = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category_id: string;
};

type Category = {
  id: string;
  name: string;
};

const CataloguePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: catData } = await supabase.from("categories").select("*");
      const { data: prodData } = await supabase.from("products").select("*");

      if (catData) setCategories(catData);
      if (prodData) setProducts(prodData);
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center text-rose-700 mb-12">🍫 Chocolate Catalogue</h1>

      {categories.map((cat) => {
        const catProducts = products.filter((p) => p.category_id === cat.id);
        return (
          <section key={cat.id} className="mb-14">
            <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-rose-400 pb-2 mb-6">
              {cat.name}
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {catProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-200"
                >
                  <img
                    src={prod.image_url}
                    alt={prod.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 truncate">{prod.name}</h3>
                    <p className="text-rose-600 font-semibold mt-1 text-md">₹{prod.price}</p>
                    
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default CataloguePage;
