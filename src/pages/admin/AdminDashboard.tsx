import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Candy, LogOut, Package, ShoppingCart, Users, TrendingUp, MapPin, Star, Camera, Plus } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCategories: number;
  pendingOrders: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

const AdminDashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCategories: 0,
    pendingOrders: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchDashboardData();
      } else {
        navigate('/admin');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchDashboardData();
      } else {
        setUser(null);
        navigate('/admin');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const { data: orders, error: ordersError } = await supabase.from('orders').select('total_amount, status');
      if (ordersError) throw ordersError;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;

      const { count: productsCount, error: productsError } = await supabase
        .from('products').select('*', { count: 'exact', head: true });
      if (productsError) throw productsError;

      const { count: categoriesCount, error: categoriesError } = await supabase
        .from('categories').select('*', { count: 'exact', head: true });
      if (categoriesError) throw categoriesError;

      const { data: recentOrdersData, error: recentOrdersError } = await supabase
        .from('orders').select('id, customer_name, total_amount, status, created_at')
        .order('created_at', { ascending: false }).limit(5);
      if (recentOrdersError) throw recentOrdersError;

      const { data: productsData, error: productsErr } = await supabase.from("products").select("*");
      if (productsErr) throw productsErr;

      const { data: categoriesData, error: categoriesErr } = await supabase.from("categories").select("*");
      if (categoriesErr) throw categoriesErr;

      const { data: statesData, error: statesErr } = await supabase.from("states").select("*");
      if (statesErr) throw statesErr;

      const { data: galleryData, error: galleryErr } = await supabase.from("gallery").select("*");
      if (galleryErr) throw galleryErr;

      const { data: reviewsData, error: reviewsErr } = await supabase.from("reviews").select("*");
      if (reviewsErr) throw reviewsErr;

      setStats({
        totalOrders,
        totalRevenue,
        totalProducts: productsCount || 0,
        totalCategories: categoriesCount || 0,
        pendingOrders,
      });

      setRecentOrders(recentOrdersData || []);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setStates(statesData || []);
      setGalleryImages(galleryData || []);
      setReviews(reviewsData || []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({ title: "Logged Out", description: "You have been successfully logged out" });
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
      toast({ title: "Error", description: "Failed to logout", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Candy className="h-12 w-12 mx-auto text-chocolate-primary animate-spin mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount?: number | null) => {
    if (typeof amount !== 'number') return '₹0.00'; // or 'N/A' if you prefer
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Candy className="h-8 w-8 text-chocolate-primary" />
            <h1 className="text-2xl font-bold text-chocolate-dark">ChocoKroko Admin</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">Welcome, {user?.email}</span>
            <Link to="/"><Button variant="outline">View Site</Button></Link>
            <Button onClick={handleLogout} variant="outline"><LogOut className="mr-2 h-4 w-4" />Logout</Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Cards (same as before) */}
          {/* ...keep the card code same... */}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="products" className="space-y-4">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
                <TabsTrigger value="states">States</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="products">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Products</CardTitle>
                    <Link to="/admin/products">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {products.length === 0 ? <p>No products found.</p> : products.map((p) => (
                      <div key={p.id} className="border p-3 rounded flex justify-between">
                        <div>
                          <div className="font-semibold">{p.name}</div>
                          <div className="text-sm text-muted-foreground">{p.description}</div>
                        </div>
                        <div className="text-right text-sm font-medium">{formatCurrency(p.price)}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="categories">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Categories</CardTitle>
                    <Link to="/admin/categories">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </Link>
                </CardHeader>
                  <CardContent className="space-y-3">
                    {categories.map((cat) => (
                      <div key={cat.id} className="border p-2 rounded">
                        <span className="font-medium">{cat.name}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="states">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Delivery States</CardTitle>
                    <Link to="/admin/states">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {states.map((s) => (
                      <div key={s.id} className="border p-2 rounded flex justify-between">
                        <span>{s.name}</span>
                        <span className="text-sm">₹{s.delivery_charge}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gallery">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Gallery</CardTitle>
                    <Link to="/admin/gallery">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {galleryImages.map((img) => (
                      <img key={img.id} src={img.image_url} alt="Gallery" className="rounded-lg w-full h-auto object-cover" />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Customer Reviews</CardTitle>
                    <Link to="/admin/reviews">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {reviews.map((review) => (
                      <div key={review.id} className="border p-3 rounded">
                        <div className="font-semibold">{review.name}</div>
                        <div className="text-sm text-muted-foreground">{review.message}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Recent Orders Section */}
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Recent Orders</CardTitle>
              <Link to="/admin/orders"><Button variant="outline" size="sm">View All</Button></Link>
            </CardHeader>
            <CardContent>
              {recentOrders.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No orders yet</p>
              ) : (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">{order.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-sm">{formatCurrency(order.total_amount)}</div>
                        <Badge variant={order.status === 'pending' ? 'default' : 'secondary'} className="text-xs">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
