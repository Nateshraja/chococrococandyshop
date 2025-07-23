import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ArrowRight, Plus, Minus, Trash2, ShoppingCart, Candy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Category {
  id: string;
  name: string;
  description: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  image_url?: string;
}

interface ProductSize {
  id: string;
  product_id: string;
  size_name: string;
  price: number;
}

interface State {
  id: string;
  name: string;
  delivery_charge: number;
}

interface CartItem {
  product: Product;
  size: ProductSize;
  quantity: number;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_id: string;
  pincode: string;
}

const Order = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productSizes, setProductSizes] = useState<ProductSize[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address_line_1: "",
    address_line_2: "",
    city: "",
    state_id: "",
    pincode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchStates();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(selectedCategory);
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedProduct) {
      fetchProductSizes(selectedProduct.id);
    }
  }, [selectedProduct]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: "Error",
        description: "Failed to load categories",
        variant: "destructive",
      });
    }
  };

  const fetchProducts = async (categoryId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryId)
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
      setSelectedProduct(null);
      setSelectedSize(null);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive",
      });
    }
  };

  const fetchProductSizes = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('product_sizes')
        .select('*')
        .eq('product_id', productId)
        .order('price');
      
      if (error) throw error;
      setProductSizes(data || []);
      setSelectedSize(null);
    } catch (error) {
      console.error('Error fetching product sizes:', error);
      toast({
        title: "Error",
        description: "Failed to load product sizes",
        variant: "destructive",
      });
    }
  };

  const fetchStates = async () => {
    try {
      const { data, error } = await supabase
        .from('states')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setStates(data || []);
    } catch (error) {
      console.error('Error fetching states:', error);
      toast({
        title: "Error",
        description: "Failed to load states",
        variant: "destructive",
      });
    }
  };

  const addToCart = () => {
    if (!selectedProduct || !selectedSize) {
      toast({
        title: "Selection Required",
        description: "Please select a product and size",
        variant: "destructive",
      });
      return;
    }

    const existingItemIndex = cart.findIndex(
      item => item.product.id === selectedProduct.id && item.size.id === selectedSize.id
    );

    if (existingItemIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      setCart(updatedCart);
    } else {
      setCart([...cart, { product: selectedProduct, size: selectedSize, quantity }]);
    }

    toast({
      title: "Added to Cart",
      description: `${quantity}x ${selectedProduct.name} (${selectedSize.size_name}) added to cart`,
    });

    setQuantity(1);
    setSelectedProduct(null);
    setSelectedSize(null);
  };

  const removeFromCart = (index: number) => {
    const updatedCart = cart.filter((_, i) => i !== index);
    setCart(updatedCart);
    toast({
      title: "Removed from Cart",
      description: "Item removed from cart",
    });
  };

  const updateCartQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedCart = [...cart];
    updatedCart[index].quantity = newQuantity;
    setCart(updatedCart);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.size.price * item.quantity), 0);
  };

  const getDeliveryCharge = () => {
    if (!customerDetails.state_id) return 0;
    const selectedState = states.find(state => state.id === customerDetails.state_id);
    return selectedState?.delivery_charge || 0;
  };

  const getTotal = () => {
    return getSubtotal() + getDeliveryCharge();
  };

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before placing order",
        variant: "destructive",
      });
      return;
    }

    // Validate customer details
    const requiredFields = ['name', 'email', 'phone', 'address_line_1', 'city', 'state_id', 'pincode'];
    const missingFields = requiredFields.filter(field => !customerDetails[field as keyof CustomerDetails]);
    
    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: customerDetails.name,
          customer_email: customerDetails.email,
          customer_phone: customerDetails.phone,
          address_line_1: customerDetails.address_line_1,
          address_line_2: customerDetails.address_line_2,
          city: customerDetails.city,
          state_id: customerDetails.state_id,
          pincode: customerDetails.pincode,
          subtotal: getSubtotal(),
          delivery_charge: getDeliveryCharge(),
          total_amount: getTotal(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        product_id: item.product.id,
        size_name: item.size.size_name,
        price: item.size.price,
        quantity: item.quantity,
        total_price: item.size.price * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast({
        title: "Order Placed Successfully!",
        description: "Redirecting to order summary...",
      });

      navigate(`/print/${order.id}`);
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Order Failed",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate customer details
      const requiredFields = ['name', 'email', 'phone', 'address_line_1', 'city', 'state_id', 'pincode'];
      const missingFields = requiredFields.filter(field => !customerDetails[field as keyof CustomerDetails]);
      
      if (missingFields.length > 0) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2">
              <Candy className="h-8 w-8 text-chocolate-primary" />
              <h1 className="text-2xl font-bold text-chocolate-dark">ChocoKroko</h1>
            </Link>
            <Badge variant="outline" className="text-chocolate-primary border-chocolate-primary">
              Step {currentStep} of 3
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-chocolate-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-chocolate-primary text-white' : 'bg-gray-200'}`}>
                1
              </div>
              <span className="font-medium">Customer Details</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-chocolate-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-chocolate-primary text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="font-medium">Product Selection</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-chocolate-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-chocolate-primary text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">Order Summary</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
              <CardDescription>Please provide your details for delivery</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={customerDetails.name}
                    onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerDetails.email}
                    onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={customerDetails.phone}
                    onChange={(e) => setCustomerDetails({...customerDetails, phone: e.target.value})}
                    placeholder="+91 12345 67890"
                  />
                </div>
                <div>
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={customerDetails.pincode}
                    onChange={(e) => setCustomerDetails({...customerDetails, pincode: e.target.value})}
                    placeholder="600001"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address1">Address Line 1 *</Label>
                <Input
                  id="address1"
                  value={customerDetails.address_line_1}
                  onChange={(e) => setCustomerDetails({...customerDetails, address_line_1: e.target.value})}
                  placeholder="Street address"
                />
              </div>
              
              <div>
                <Label htmlFor="address2">Address Line 2</Label>
                <Input
                  id="address2"
                  value={customerDetails.address_line_2}
                  onChange={(e) => setCustomerDetails({...customerDetails, address_line_2: e.target.value})}
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={customerDetails.city}
                    onChange={(e) => setCustomerDetails({...customerDetails, city: e.target.value})}
                    placeholder="City"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Select
                    value={customerDetails.state_id}
                    onValueChange={(value) => setCustomerDetails({...customerDetails, state_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {states.map((state) => (
                        <SelectItem key={state.id} value={state.id}>
                          {state.name} (₹{state.delivery_charge} delivery)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button onClick={nextStep} className="chocolate-gradient text-white">
                  Next: Product Selection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Category Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "outline"}
                        className={selectedCategory === category.id ? "chocolate-gradient text-white" : ""}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Product Selection */}
              {selectedCategory && (
                <Card>
                  <CardHeader>
                    <CardTitle>Select Product</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((product) => (
                        <Button
                          key={product.id}
                          variant={selectedProduct?.id === product.id ? "default" : "outline"}
                          className={`h-auto p-4 ${selectedProduct?.id === product.id ? "chocolate-gradient text-white" : ""}`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <div className="text-left">
                            <div className="font-semibold">{product.name}</div>
                            {product.description && (
                              <div className="text-sm opacity-70">{product.description}</div>
                            )}
                          </div>
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Size & Quantity Selection */}
              {selectedProduct && productSizes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Size & Quantity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Size</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {productSizes.map((size) => (
                          <Button
                            key={size.id}
                            variant={selectedSize?.id === size.id ? "default" : "outline"}
                            className={selectedSize?.id === size.id ? "chocolate-gradient text-white" : ""}
                            onClick={() => setSelectedSize(size)}
                          >
                            <div className="text-center">
                              <div className="font-semibold">{size.size_name}</div>
                              <div className="text-sm">₹{size.price}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <Label>Quantity</Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Button onClick={addToCart} className="w-full chocolate-gradient text-white">
                      <Plus className="mr-2 h-4 w-4" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Cart */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Cart ({cart.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cart.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">Your cart is empty</p>
                  ) : (
                    <div className="space-y-3">
                      {cart.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.product.name}</div>
                            <div className="text-xs text-muted-foreground">{item.size.size_name} - ₹{item.size.price}</div>
                            <div className="flex items-center space-x-2 mt-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={() => updateCartQuantity(index, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="text-xs w-6 text-center">{item.quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                onClick={() => updateCartQuantity(index, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-sm">₹{item.size.price * item.quantity}</div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0 text-red-500"
                              onClick={() => removeFromCart(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button 
                      onClick={nextStep} 
                      disabled={cart.length === 0}
                      className="chocolate-gradient text-white"
                    >
                      Review Order
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Review your order before placing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Details */}
              <div>
                <h3 className="font-semibold mb-2">Delivery Details</h3>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p><strong>Name:</strong> {customerDetails.name}</p>
                  <p><strong>Email:</strong> {customerDetails.email}</p>
                  <p><strong>Phone:</strong> {customerDetails.phone}</p>
                  <p><strong>Address:</strong> {customerDetails.address_line_1}{customerDetails.address_line_2 && `, ${customerDetails.address_line_2}`}</p>
                  <p><strong>City:</strong> {customerDetails.city}, {states.find(s => s.id === customerDetails.state_id)?.name} - {customerDetails.pincode}</p>
                </div>
              </div>

              <Separator />

              {/* Order Items */}
              <div>
                <h3 className="font-semibold mb-2">Order Items</h3>
                <div className="space-y-2">
                  {cart.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.size.size_name} × {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold">₹{item.size.price * item.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Order Total */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₹{getSubtotal()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charge:</span>
                  <span>₹{getDeliveryCharge()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span>₹{getTotal()}</span>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button 
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting}
                  className="chocolate-gradient text-white"
                >
                  {isSubmitting ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Order;