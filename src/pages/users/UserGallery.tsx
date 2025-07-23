import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Instagram, ChevronDown,Home  } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";

// Fallback user context if UserContext is not available
const useUser = () => {
  return { user: null }; // Default fallback
};

const UserGallery = () => {
  const navigate = useNavigate();
  const { user } = useUser(); // Now this will work even if UserContext isn't properly imported
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState(['All', 'Wedding', 'Birthday', 'Anniversary', 'Corporate']);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: supabaseError } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setGalleryItems(data || []);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, []);

  const filteredItems = filter === 'All'
    ? galleryItems
    : galleryItems.filter(item => item.tags?.includes(filter.toLowerCase()));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center p-6 bg-rose-50 rounded-lg max-w-md">
          <h3 className="text-xl font-medium text-rose-800 mb-2">Error Loading Gallery</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-rose-600 hover:bg-rose-700"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header - Updated with Home button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/')}
            className="text-rose-600 hover:bg-rose-50"
            aria-label="Go to home"
          >
            <Home size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-rose-800">Inspiration Gallery</h1>
            <p className="text-gray-600 mt-2">
              Browse our collection of custom chocolate creations for inspiration
            </p>
          </div>
        </div>
        
        
        <div className="relative mt-4 md:mt-0">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            Filter
            <ChevronDown size={18} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 p-2"
            >
              {categories.map(category => (
                <button
                  key={category}
                  className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-rose-50 ${filter === category ? 'text-rose-600 font-medium' : 'text-gray-700'}`}
                  onClick={() => {
                    setFilter(category);
                    setShowFilters(false);
                  }}
                >
                  {category}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="relative group">
              <img
                src={item.image_url || '/placeholder-gallery.jpg'}
                alt={item.title || 'Chocolate creation'}
                className="w-full h-64 object-cover"
              />
              
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                <button
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 bg-white rounded-full shadow-md hover:bg-rose-50"
                  onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                >
                  <Heart
                    size={20}
                    className="text-rose-600"
                  />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{item.title || 'Custom Chocolate'}</h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-rose-100 text-rose-800 rounded-full capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="flex justify-between items-center">
                <Button
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => item.product_id && navigate(`/product/${item.product_id}`)}
                >
                  Customize This
                </Button>
                
                {item.instagram_url && (
                  <a
                    href={item.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-rose-600"
                  >
                    <Instagram size={18} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-gray-600">No gallery items found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters</p>
        </div>
      )}

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-rose-800 mb-4">Have a Special Request?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto mb-6">
          Our chocolatiers can create custom designs for your special occasion. 
          Share your vision with us and we'll bring it to life!
        </p>
        <Button
          className="bg-rose-600 hover:bg-rose-700 px-8"
          onClick={() => navigate('/contact')}
        >
          Contact Our Designers
        </Button>
      </div>
    </div>
  );
};

export default UserGallery;