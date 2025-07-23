-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create states table for delivery charges
CREATE TABLE public.states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  delivery_charge DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product sizes table
CREATE TABLE public.product_sizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size_name TEXT NOT NULL, -- Small, Medium, Large
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(product_id, size_name)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  state_id UUID NOT NULL REFERENCES public.states(id),
  pincode TEXT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  delivery_charge DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  size_name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create gallery table (optional)
CREATE TABLE public.gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table (optional)
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Create storage policies for product images
CREATE POLICY "Product images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update product images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete product images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery-images', 'gallery-images', true);
-- Create storage bucket for gallery images
CREATE POLICY "Gallery images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'gallery-images');

CREATE POLICY "Authenticated users can upload gallery images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update gallery images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete gallery images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'gallery-images' AND auth.role() = 'authenticated');

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (customers can view)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories FOR SELECT USING (true);

CREATE POLICY "States are viewable by everyone" 
ON public.states FOR SELECT USING (true);

CREATE POLICY "Products are viewable by everyone" 
ON public.products FOR SELECT USING (true);

CREATE POLICY "Product sizes are viewable by everyone" 
ON public.product_sizes FOR SELECT USING (true);

CREATE POLICY "Gallery is viewable by everyone" 
ON public.gallery FOR SELECT USING (is_active = true);

CREATE POLICY "Approved reviews are viewable by everyone" 
ON public.reviews FOR SELECT USING (is_approved = true);

-- Create policies for orders (customers can insert their own orders)
CREATE POLICY "Anyone can insert orders" 
ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert order items" 
ON public.order_items FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can insert reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users can manage everything)
CREATE POLICY "Authenticated users can manage categories" 
ON public.categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage states" 
ON public.states FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage products" 
ON public.products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage product sizes" 
ON public.product_sizes FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all orders" 
ON public.orders FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view all order items" 
ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage gallery" 
ON public.gallery FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage reviews" 
ON public.reviews FOR ALL USING (auth.role() = 'authenticated');

-- Insert default states with delivery charges
INSERT INTO public.states (name, delivery_charge) VALUES 
('Tamil Nadu', 60.00),
('Andhra Pradesh', 100.00),
('Karnataka', 100.00),
('Kerala', 100.00),
('Telangana', 100.00),
('Maharashtra', 100.00),
('Gujarat', 100.00),
('Rajasthan', 100.00),
('Punjab', 100.00),
('Haryana', 100.00),
('Uttar Pradesh', 100.00),
('Madhya Pradesh', 100.00),
('Bihar', 100.00),
('West Bengal', 100.00),
('Odisha', 100.00),
('Jharkhand', 100.00),
('Chhattisgarh', 100.00),
('Delhi', 100.00),
('Goa', 100.00),
('Himachal Pradesh', 100.00),
('Jammu and Kashmir', 100.00),
('Uttarakhand', 100.00),
('Assam', 100.00),
('Manipur', 100.00),
('Meghalaya', 100.00),
('Mizoram', 100.00),
('Nagaland', 100.00),
('Sikkim', 100.00),
('Tripura', 100.00),
('Arunachal Pradesh', 100.00),
('Ladakh', 100.00);

-- Insert sample categories
INSERT INTO public.categories (name, description) VALUES 
('Chocolate', 'Premium chocolate products'),
('Burpy', 'Burpy chocolate varieties'),
('Special Edition', 'Limited edition chocolates');

-- Insert sample products
INSERT INTO public.products (name, category_id, description) 
SELECT 'KitKat', id, 'Crispy wafer chocolate bar' FROM public.categories WHERE name = 'Chocolate'
UNION ALL
SELECT 'Dairy Milk', id, 'Smooth milk chocolate' FROM public.categories WHERE name = 'Chocolate'
UNION ALL
SELECT 'Snickers', id, 'Chocolate bar with peanuts' FROM public.categories WHERE name = 'Chocolate';

-- Insert sample product sizes
INSERT INTO public.product_sizes (product_id, size_name, price)
SELECT p.id, 'Small', 25.00 FROM public.products p WHERE p.name = 'KitKat'
UNION ALL
SELECT p.id, 'Medium', 45.00 FROM public.products p WHERE p.name = 'KitKat'
UNION ALL
SELECT p.id, 'Large', 65.00 FROM public.products p WHERE p.name = 'KitKat'
UNION ALL
SELECT p.id, 'Small', 30.00 FROM public.products p WHERE p.name = 'Dairy Milk'
UNION ALL
SELECT p.id, 'Medium', 50.00 FROM public.products p WHERE p.name = 'Dairy Milk'
UNION ALL
SELECT p.id, 'Large', 70.00 FROM public.products p WHERE p.name = 'Dairy Milk'
UNION ALL
SELECT p.id, 'Small', 35.00 FROM public.products p WHERE p.name = 'Snickers'
UNION ALL
SELECT p.id, 'Medium', 55.00 FROM public.products p WHERE p.name = 'Snickers'
UNION ALL
SELECT p.id, 'Large', 75.00 FROM public.products p WHERE p.name = 'Snickers';

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_states_updated_at
    BEFORE UPDATE ON public.states
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gallery_updated_at
    BEFORE UPDATE ON public.gallery
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();