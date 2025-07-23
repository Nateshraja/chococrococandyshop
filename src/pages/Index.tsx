import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Gift, ImageIcon, ShoppingCart, Heart, Instagram, Facebook, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const HomePage = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="bg-gradient-to-b from-rose-50 via-white to-pink-50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative flex flex-col md:flex-row items-center justify-between px-6 py-20 max-w-7xl mx-auto min-h-[80vh]">
        {/* Floating decorative elements */}
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-pink-100 opacity-30 blur-xl"></div>
        <div className="absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-rose-100 opacity-20 blur-xl"></div>
        
        <motion.div 
          className="md:w-1/2 text-center md:text-left z-10"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-extrabold text-rose-800 mb-6 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-pink-600">
              Handcrafted Chocolates
            </span><br />
            Made With Love
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-lg">
            Create unforgettable moments with our premium, customizable chocolates. Perfect for gifts, celebrations, or treating yourself.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button 
              onClick={() => navigate("/user-catalogue")}
              className="px-8 py-6 text-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
            >
              Browse Catalogue
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/user-gallery")}
              className="px-8 py-6 text-lg border-rose-600 text-rose-600 hover:bg-rose-50"
            >
              View Gallery
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
            className="md:w-1/2 w-full max-w-md mt-10 md:mt-0 relative z-10 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img
              src="images/logo.png"
              alt="Custom Chocolate"
              className="h-[30rem]  rounded-full object-cover shadow-2xl transform hover:rotate-1 transition-transform duration-300"
            />
          <motion.div 
            className="absolute -bottom-5 -right-5 bg-white px-4 py-2 rounded-full shadow-md flex items-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Heart className="text-rose-600 mr-2" size={20} />
            <span className="font-medium text-rose-800">100% Handmade</span>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 text-center bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-rose-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Create Your Perfect Chocolate Gift
          </motion.h2>
          <motion.p 
            className="text-xl text-gray-600 mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Just three simple steps to chocolate happiness
          </motion.p>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={item} className="p-6 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Gift className="text-rose-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-rose-800">Choose Your Base</h3>
              <p className="text-gray-600">
                Select from our premium dark, milk, or white chocolate bases
              </p>
              <div className="mt-4 text-rose-600 font-medium">Step 1</div>
            </motion.div>
            
            <motion.div variants={item} className="p-6 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Sparkles className="text-rose-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-rose-800">Personalize It</h3>
              <p className="text-gray-600">
                Add flavors, decorations, and custom messages to make it unique
              </p>
              <div className="mt-4 text-rose-600 font-medium">Step 2</div>
            </motion.div>
            
            <motion.div variants={item} className="p-6 rounded-xl bg-rose-50 hover:bg-rose-100 transition-colors">
              <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ShoppingCart className="text-rose-600" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-rose-800">Enjoy!</h3>
              <p className="text-gray-600">
                We handcraft your creation and deliver it fresh to your doorstep
              </p>
              <div className="mt-4 text-rose-600 font-medium">Step 3</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center text-rose-800 mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Our Signature Creations
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Heart Box", price: "₹899", image: "images/a1.jpeg" },
              { name: "Truffle Collection", price: "₹1,299", image: "images/a2.jpeg" },
              { name: "Personalized Bar", price: "₹599", image: "images/a3.jpeg" },
              { name: "Festive Assortment", price: "₹1,599", image: "images/a4.jpeg" },
            ].map((product, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="h-64 overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-rose-600 font-bold">{product.price}</span>
                    <Button 
                      variant="ghost" 
                      className="text-rose-600 hover:bg-rose-50"
                      onClick={() => navigate("/user-catalogue")}
                    >
                      Customize
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button 
              onClick={() => navigate("/user-catalogue")}
              className="px-8 py-6 text-lg bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg"
            >
              View Full Collection
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h2 
            className="text-4xl font-bold text-center text-rose-800 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Sweet Words From Our Customers
          </motion.h2>
          <motion.p 
            className="text-xl text-center text-gray-600 mb-16 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Don't just take our word for it - here's what our customers say
          </motion.p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "The personalized chocolate box was the highlight of our anniversary. My wife was moved to tears!",
                author: "Arjun P.",
                rating: "★★★★★"
              },
              {
                quote: "Delicious and beautifully presented. The customization options are endless!",
                author: "Meera R.",
                rating: "★★★★★"
              },
              {
                quote: "Fast delivery and exceptional quality. Will definitely order again for all special occasions.",
                author: "Dinesh K.",
                rating: "★★★★☆"
              }
            ].map((testimonial, index) => (
              <motion.div 
                key={index}
                className="bg-rose-50 p-8 rounded-xl relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
              >
                <div className="text-rose-600 text-2xl mb-4">{testimonial.rating}</div>
                <p className="text-gray-700 text-lg italic mb-6">"{testimonial.quote}"</p>
                <div className="font-semibold text-rose-800">{testimonial.author}</div>
                <div className="absolute -top-4 -left-4 w-10 h-10 rounded-full bg-rose-200 flex items-center justify-center">
                  <Heart className="text-rose-600" size={16} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram Gallery */}
      <section className="py-16 bg-rose-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-rose-800 mb-2">#ChocoHolicMoments</h2>
              <p className="text-gray-600">Follow us on Instagram for daily inspiration</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Button 
                variant="outline" 
                className="border-rose-600 text-rose-600 hover:bg-rose-100 gap-2"
                onClick={() => window.open("https://instagram.com", "_blank")}
              >
                <Instagram size={18} /> Follow Us
              </Button>
            </motion.div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[1,2,3,4,5,6].map((item) => (
              <motion.div 
                key={item}
                className="aspect-square overflow-hidden rounded-lg relative group"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: item * 0.1 }}
              >
                <img 
                  src={`/gallery-${item}.jpg`} // Replace with your gallery images
                  alt="Instagram post"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                  <Instagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-rose-600 to-pink-600 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2 
            className="text-3xl md:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Ready to Create Something Sweet?
          </motion.h2>
          <motion.p 
            className="text-xl text-rose-100 mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Design your perfect chocolate gift today - it's easier than you think!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Button 
              size="lg" 
              className="px-12 py-7 text-lg bg-white text-rose-600 hover:bg-rose-50 shadow-xl hover:shadow-2xl"
              onClick={() => navigate("/orders")}
            >
              Start Designing Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-rose-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ChocoHolic</h3>
              <p className="text-rose-200">
                Crafting memorable chocolate experiences since 2015. Each piece made with love and the finest ingredients.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/" className="text-rose-200 hover:text-white transition-colors">Home</a></li>
                <li><a href="/orders" className="text-rose-200 hover:text-white transition-colors">Shop</a></li>
                <li><a href="/user-gallery" className="text-rose-200 hover:text-white transition-colors">Gallery</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Customer Service</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-rose-200 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-rose-200 hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="text-rose-200 hover:text-white transition-colors">Shipping</a></li>
                <li><a href="#" className="text-rose-200 hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex gap-4 mb-4">
                <a href="#" className="bg-rose-800 hover:bg-rose-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="#" className="bg-rose-800 hover:bg-rose-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="#" className="bg-rose-800 hover:bg-rose-700 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <Twitter size={18} />
                </a>
              </div>
              <p className="text-rose-200">Subscribe to our newsletter for sweet deals!</p>
            </div>
          </div>
          <div className="pt-8 border-t border-rose-800 text-center text-rose-300">
            © {new Date().getFullYear()} ChocoHolic. All rights reserved. | Crafted with <Heart className="inline text-rose-400" size={16} /> in India
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;