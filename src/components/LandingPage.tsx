
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Gift, Heart, Star, Users } from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const features = [
    {
      icon: Gift,
      title: "Custom Designs",
      description: "Upload your own images and create unique wrapping designs"
    },
    {
      icon: Heart,
      title: "Every Occasion",
      description: "Perfect for birthdays, weddings, corporate events, and more"
    },
    {
      icon: Star,
      title: "Premium Quality",
      description: "High-quality materials and professional printing"
    },
    {
      icon: Users,
      title: "Personal Touch",
      description: "Make every chocolate gift memorable and special"
    }
  ];

  const exampleImages = [
    "/images/a1.jpeg",
    "/images/a2.jpeg",
    "/images/a3.jpeg",
    "/images/a4.jpeg",
    "/images/a5.jpeg",
    "/images/a6.jpeg",
    "/images/a7.jpeg",
    "/images/a8.jpeg"
  ];

  const chocolateTypes = [
    { value: "standard-bar", label: "Standard Bar", basePrice: 15 },
    { value: "artisan-truffles", label: "Artisan Truffles", basePrice: 25 },
    { value: "chocolate-box-small", label: "Chocolate Box - Small", basePrice: 35 },
    { value: "chocolate-box-medium", label: "Chocolate Box - Medium", basePrice: 50 },
    { value: "chocolate-bar-large", label: "Chocolate Bar - Large", basePrice: 30 },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-red-600 rounded-lg flex items-center justify-center">
              <Gift className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent">
              ChocoWrap
            </h1>
          </div>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Admin Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-amber-800 via-red-700 to-orange-700 bg-clip-text text-transparent">
            Custom Chocolate Wrapping
          </h2>
          <h3 className="text-2xl md:text-3xl font-semibold mb-8 text-amber-900">
            For Every Occasion
          </h3>
          <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your chocolate gifts into memorable experiences with our premium custom wrapping service. 
            Upload your designs, choose your style, and create something truly special.
          </p>
          <Link to="/customize">
            <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 text-white px-8 py-4 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
              Start Your Customization! ✨
            </Button>
          </Link>
        </div>
      </section>

      {/* Examples Gallery */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-amber-900">
            Our Wrapping Designs
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {exampleImages.map((src, index) => (
              <div key={index} className="relative group overflow-hidden rounded-lg shadow-lg">
                <img 
                  src={src} 
                  alt={`Example wrapping design ${index + 1}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 text-amber-900">
            Why Choose ChocoWrap?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold mb-2 text-amber-900">{feature.title}</h4>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
{/* Pricing Section */}
<section className="py-16 px-4 bg-white/80 backdrop-blur-sm">
  <div className="container mx-auto max-w-4xl">
    <h3 className="text-3xl font-bold text-center mb-12 text-amber-900">
      Our Product Pricing
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {chocolateTypes.map((type) => (
        <div
          key={type.value}
          className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-center space-x-4">
            <img
              src={`/images/${type.value}.jpg`}
              alt={type.label}
              className="w-20 h-20 object-cover rounded-md border"
              onError={e => (e.currentTarget.src = "/images/a1.jpeg")}
            />
            <span className="text-lg font-semibold text-amber-800">{type.label}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-2xl font-bold text-amber-700 mb-1">
              ₹{type.basePrice}
            </span>
            <span className="text-sm text-gray-600 mb-2">/piece</span>
            {/* <Button className="bg-amber-600 text-white px-4 py-2">Order Now</Button> */}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>


      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-amber-600 to-red-600">
        <div className="container mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6 text-white">
            Ready to Create Your Dream Wrap?
          </h3>
          <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have made their chocolate gifts unforgettable.
          </p>
          <Link to="/customize">
            <Button className="bg-white text-amber-700 hover:bg-gray-50 px-8 py-4 text-lg rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 font-semibold">
              Design Your Dream Wrap! 🍫
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-amber-900 text-white py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-red-500 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <h4 className="text-xl font-bold">ChocoWrap</h4>
          </div>
          <p className="text-amber-200">
            Custom Chocolate Wrapping • Making Every Gift Special
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
