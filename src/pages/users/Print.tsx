import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Candy, Printer, Home, CheckCircle } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  pincode: string;
  subtotal: number;
  delivery_charge: number;
  total_amount: number;
  status: string;
  created_at: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  size_name: string;
  price: number;
  quantity: number;
  total_price: number;
  products: {
    name: string;
    description: string;
  };
}

interface State {
  name: string;
}

const Print = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [state, setState] = useState<State | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      // Fetch order details
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          states (name)
        `)
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;
      
      setOrder(orderData);
      setState(orderData.states);

      // Fetch order items with product details
      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select(`
          *,
          products (name, description)
        `)
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;
      
      setOrderItems(itemsData || []);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Candy className="h-12 w-12 mx-auto text-chocolate-primary animate-spin mb-4" />
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl mb-4">Order not found</p>
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Hidden in print */}
      <header className="bg-white shadow-sm border-b print:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Candy className="h-8 w-8 text-chocolate-primary" />
              <h1 className="text-2xl font-bold text-chocolate-dark">ChocoKroko</h1>
            </Link>
            <div className="flex space-x-4">
              <Button onClick={handlePrint} variant="outline">
                <Printer className="mr-2 h-4 w-4" />
                Print Order
              </Button>
              <Link to="/">
                <Button className="chocolate-gradient text-white">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Success Message - Hidden in print */}
        <div className="text-center mb-8 print:hidden">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-chocolate-dark mb-2">Order Placed Successfully!</h2>
          <p className="text-muted-foreground">Your chocolate customization order has been confirmed.</p>
        </div>

        {/* Order Details Card */}
        <Card className="max-w-4xl mx-auto print:shadow-none print:border-none">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Candy className="h-8 w-8 text-chocolate-primary" />
              <h1 className="text-2xl font-bold text-chocolate-dark">ChocoKroko</h1>
            </div>
            <CardTitle className="text-2xl">Order Confirmation</CardTitle>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <span>Order ID: {order.id.substring(0, 8)}</span>
              <span>•</span>
              <span>Date: {new Date(order.created_at).toLocaleDateString('en-IN')}</span>
              <span>•</span>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {order.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Customer Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-chocolate-dark">Customer Details</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Name:</strong> {order.customer_name}</p>
                  <p><strong>Email:</strong> {order.customer_email}</p>
                  <p><strong>Phone:</strong> {order.customer_phone}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-3 text-chocolate-dark">Delivery Address</h3>
                <div className="text-sm">
                  <p>{order.address_line_1}</p>
                  {order.address_line_2 && <p>{order.address_line_2}</p>}
                  <p>{order.city}, {state?.name} - {order.pincode}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h3 className="font-semibold text-lg mb-4 text-chocolate-dark">Order Items</h3>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg bg-muted/20">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.products.name}</h4>
                      <p className="text-sm text-muted-foreground">{item.products.description}</p>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <Badge variant="secondary">{item.size_name}</Badge>
                        <span>Quantity: {item.quantity}</span>
                        <span>Price: ₹{item.price} each</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-lg">₹{item.total_price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="bg-chocolate-light/10 p-6 rounded-lg">
              <h3 className="font-semibold text-lg mb-4 text-chocolate-dark">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge ({state?.name}):</span>
                  <span>₹{order.delivery_charge}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-xl font-bold text-chocolate-dark">
                  <span>Total Amount:</span>
                  <span>₹{order.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="text-center pt-6 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                Thank you for choosing ChocoKroko! Your custom chocolates will be prepared with care.
              </p>
              <p className="text-xs text-muted-foreground">
                For any queries, contact us at hello@chocokroko.com or +91 12345 67890
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Print Actions - Hidden in print */}
        <div className="text-center mt-8 print:hidden">
          <div className="flex justify-center space-x-4">
            <Button onClick={handlePrint} size="lg" className="chocolate-gradient text-white">
              <Printer className="mr-2 h-5 w-5" />
              Print Order Summary
            </Button>
            <Link to="/">
              <Button size="lg" variant="outline">
                <Home className="mr-2 h-5 w-5" />
                Place Another Order
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Print;