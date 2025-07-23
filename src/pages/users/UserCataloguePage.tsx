import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const UserCatalogue = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOption, setSortOption] = useState('Popular');
  const [showFilters, setShowFilters] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData] = await Promise.all([
          supabase.getProducts(),
          supabase.getProductCategories()
        ]);

        setProducts(productsData);
        setCategories([{ id: 'all', name: 'All' }, ...categoriesData]);

        if (user) {
          const wishlistData = await supabase.getWishlist(user.id);
          setWishlist(wishlistData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleWishlistToggle = async (productId: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const success = await supabase.toggleWishlistItem(user.id, productId);
      if (success) {
        setWishlist([...wishlist, productId]);
      } else {
        setWishlist(wishlist.filter(id => id !== productId));
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(product => product.category_id === selectedCategory);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortOption) {
      case 'Price: Low to High':
        return a.price - b.price;
      case 'Price: High to Low':
        return b.price - a.price;
      case 'Newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'Rating':
        return b.rating - a.rating;
      default: // Popular
        return b.popularity_score - a.popularity_score;
    }
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold text-rose-800 mb-4 md:mb-0">Our Chocolate Collection</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={18} />
              Filters
              <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 p-4"
              >
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                  >
                    <option value="Popular">Popular</option>
                    <option value="Price: Low to High">Price: Low to High</option>
                    <option value="Price: High to Low">Price: High to Low</option>
                    <option value="Newest">Newest</option>
                    <option value="Rating">Rating</option>
                  </select>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map(product => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
              />
              
              <button
                className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-rose-50 transition-colors"
                onClick={() => handleWishlistToggle(product.id)}
              >
                <Heart
                  size={20}
                  className={wishlist.includes(product.id) ? 'text-rose-600 fill-rose-600' : 'text-gray-400'}
                />
              </button>
              
              {product.is_featured && (
                <div className="absolute top-3 left-3 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Featured
                </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{product.name}</h3>
                <span className="font-bold text-rose-600">₹{product.price}</span>
              </div>
              
              <div className="flex items-center mb-3">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating) ? 'fill-current' : ''}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 ml-1">({product.review_count})</span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              <Button
                className="w-full bg-rose-600 hover:bg-rose-700"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <ShoppingCart size={18} className="mr-2" />
                Customize & Order
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No products found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
};

export default UserCatalogue;