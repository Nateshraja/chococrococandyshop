import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/Index";
import Print from "./pages/users/Print";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import NotFound from "./pages/NotFound";
import GalleryPage from "@/pages/admin/Gallery";
import CataloguePage from "@/pages/admin/CataloguePage";
import Products from "@/pages/admin/Products";
import Categories from "@/pages/admin/Categories";
import States from "@/pages/admin/States";
import Reviews from "@/pages/admin/Reviews"; 
import  Order  from "@/pages/users/Order"; 
import Orderlist from "@/pages/admin/orderlist"; 
import UserGalleryPage from "@/pages/users/UserGallery"; 
import UserCataloguePage from "@/pages/users/UserCataloguePage"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/print/:orderId" element={<Print />} />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/gallery" element={<GalleryPage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/admin/products" element={<Products />} />
          <Route path="/admin/categories" element={<Categories />} />
          <Route path="/admin/states" element={<States />} />
          <Route path="/admin/reviews" element={<Reviews />} />
          <Route path="/orders" element={<Order />} />
          <Route path="/admin/orders" element={<Orderlist />} /> 
          <Route path="/user-gallery" element={<UserGalleryPage />} />
          <Route path="/user-catalogue" element={<UserCataloguePage />} />
          {/* Assuming you have an Orders
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;