import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft, ArrowRight, Upload, Gift, Calculator } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../../supabase/client";

interface OrderData {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  chocolateType: string;
  chocolateSize: string;
  quantity: number;
  uploadedImage: File | null;
  purpose: string;
  customPurpose: string;
  remarks: string;
}

const CustomizationWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderData, setOrderData] = useState<OrderData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    chocolateType: "",
    chocolateSize: "",
    quantity: 1,
    uploadedImage: null,
    purpose: "",
    customPurpose: "",
    remarks: "",
  });

  const navigate = useNavigate();
  const { toast } = useToast();

  const chocolateTypes = [
    { value: "standard-bar", label: "Standard Bar", basePrice: 15 },
    { value: "artisan-truffles", label: "Artisan Truffles", basePrice: 25 },
    { value: "chocolate-box-small", label: "Chocolate Box - Small", basePrice: 35 },
    { value: "chocolate-box-medium", label: "Chocolate Box - Medium", basePrice: 50 },
    { value: "chocolate-bar-large", label: "Chocolate Bar - Large", basePrice: 30 },
  ];

  const getSizeOptions = (chocolateType: string) => {
    const sizeMap: Record<string, Array<{ value: string; label: string; dimensions: string }>> = {
      "standard-bar": [
        { value: "small", label: "Small", dimensions: "10x5x1cm" },
        { value: "medium", label: "Medium", dimensions: "15x7x1.5cm" },
        { value: "large", label: "Large", dimensions: "20x10x2cm" },
      ],
      "artisan-truffles": [
        { value: "6-piece", label: "6-piece Box", dimensions: "12x8x3cm" },
        { value: "12-piece", label: "12-piece Box", dimensions: "18x12x3cm" },
        { value: "24-piece", label: "24-piece Box", dimensions: "25x15x4cm" },
      ],
      "chocolate-box-small": [
        { value: "square", label: "Square Box", dimensions: "15x15x5cm" },
        { value: "rectangular", label: "Rectangular Box", dimensions: "20x12x5cm" },
      ],
      "chocolate-box-medium": [
        { value: "standard", label: "Standard Box", dimensions: "25x18x6cm" },
        { value: "premium", label: "Premium Box", dimensions: "30x20x7cm" },
      ],
      "chocolate-bar-large": [
        { value: "xl", label: "Extra Large", dimensions: "30x15x2.5cm" },
        { value: "family", label: "Family Size", dimensions: "35x18x3cm" },
      ],
    };
    return sizeMap[chocolateType] || [];
  };

  const calculateEstimatedCost = () => {
    const chocolateTypeData = chocolateTypes.find(type => type.value === orderData.chocolateType);
    if (!chocolateTypeData) return 0;
    const basePrice = chocolateTypeData.basePrice;
    const imageSurcharge = orderData.uploadedImage ? 5 : 0;
    return (basePrice + imageSurcharge) * orderData.quantity;
  };

  const handleInputChange = (field: keyof OrderData, value: any) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a JPG or PNG image.",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB.",
          variant: "destructive",
        });
        return;
      }
      handleInputChange('uploadedImage', file);
      toast({
        title: "Image uploaded successfully!",
        description: `${file.name} has been selected for your wrapping design.`,
      });
    }
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        return orderData.customerName && orderData.customerEmail && orderData.customerPhone && orderData.shippingAddress;
      case 2:
        return orderData.chocolateType && orderData.chocolateSize && orderData.quantity > 0;
      case 3:
        return orderData.purpose;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    } else {
      toast({
        title: "Please complete all required fields",
        description: "Fill in all the required information before proceeding.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Store order in Supabase
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast({
        title: "Please review your information",
        description: "Make sure all required fields are completed.",
        variant: "destructive",
      });
      return;
    }

    let imageUrl = null;
    if (orderData.uploadedImage) {
      // Upload image to Supabase Storage (bucket: order-images)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("order-images")
        .upload(`orders/${Date.now()}_${orderData.uploadedImage.name}`, orderData.uploadedImage);

      if (uploadError) {
        toast({
          title: "Image upload failed",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      imageUrl = uploadData?.path
        ? supabase.storage.from("order-images").getPublicUrl(uploadData.path).data.publicUrl
        : null;
    }

    const totalAmount = calculateEstimatedCost();

    const { data, error } = await supabase.from("orders").insert([
      {
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        chocolate_type: orderData.chocolateType,
        chocolate_size: orderData.chocolateSize,
        quantity: orderData.quantity,
        purpose: orderData.purpose === "Other" ? orderData.customPurpose : orderData.purpose,
        remarks: orderData.remarks,
        image_url: imageUrl,
        total_amount: totalAmount,
      },
    ]).select();

    if (!error) {
      const orderId = data?.[0]?.id || `CW${Date.now().toString().slice(-6)}`;
      toast({
        title: "Order submitted successfully! 🎉",
        description: `Your order ${orderId} has been received and is being processed.`,
      });
      setTimeout(() => {
        navigate(`/confirmation/${orderId}`);
      }, 1500);
    } else {
      toast({
        title: "Order submission failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={orderData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  placeholder="Enter your full name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Email Address *</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={orderData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                value={orderData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="shippingAddress">Shipping Address *</Label>
              <Textarea
                id="shippingAddress"
                value={orderData.shippingAddress}
                onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                placeholder="Enter your complete shipping address"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Chocolate Type *</Label>
              <Select value={orderData.chocolateType} onValueChange={(value) => {
                handleInputChange('chocolateType', value);
                handleInputChange('chocolateSize', ''); // Reset size when type changes
              }}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select chocolate type" />
                </SelectTrigger>
                <SelectContent>
                  {chocolateTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} (${type.basePrice})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {orderData.chocolateType && (
              <div>
                <Label>Size & Dimensions *</Label>
                <RadioGroup
                  value={orderData.chocolateSize}
                  onValueChange={(value) => handleInputChange('chocolateSize', value)}
                  className="mt-2"
                >
                  {getSizeOptions(orderData.chocolateType).map((size) => (
                    <div key={size.value} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value={size.value} id={size.value} />
                      <Label htmlFor={size.value} className="flex-1 cursor-pointer">
                        <div className="font-medium">{size.label}</div>
                        <div className="text-sm text-gray-500">{size.dimensions}</div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={orderData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="mt-1 max-w-[150px]"
              />
            </div>

            {(orderData.chocolateType && orderData.chocolateSize && orderData.quantity > 0) && (
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Calculator className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">Estimated Total Cost:</span>
                    </div>
                    <span className="text-2xl font-bold text-green-700">
                      ${calculateEstimatedCost()}
                    </span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    {orderData.uploadedImage && "Includes $5 custom image surcharge"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="imageUpload">Upload Your Image/Logo</Label>
              <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-amber-400 transition-colors">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Label htmlFor="imageUpload" className="cursor-pointer">
                  <Button type="button" variant="outline" className="mb-2">
                    Choose Image File
                  </Button>
                  <p className="text-sm text-gray-500">
                    Upload JPG or PNG files (max 5MB) for optimal quality
                  </p>
                  {orderData.uploadedImage && (
                    <p className="text-green-600 font-medium mt-2">
                      ✓ {orderData.uploadedImage.name} selected
                    </p>
                  )}
                </Label>
              </div>
            </div>

            <div>
              <Label>Purpose/Occasion *</Label>
              <RadioGroup
                value={orderData.purpose}
                onValueChange={(value) => handleInputChange('purpose', value)}
                className="mt-2"
              >
                {[
                  'Birthday', 'Wedding', 'Anniversary', 'Corporate Event',
                  'Baby Shower', 'Graduation', 'Just Because', 'Other'
                ].map((purpose) => (
                  <div key={purpose} className="flex items-center space-x-2">
                    <RadioGroupItem value={purpose} id={purpose} />
                    <Label htmlFor={purpose}>{purpose}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {orderData.purpose === 'Other' && (
              <div>
                <Label htmlFor="customPurpose">Specify Occasion</Label>
                <Input
                  id="customPurpose"
                  value={orderData.customPurpose}
                  onChange={(e) => handleInputChange('customPurpose', e.target.value)}
                  placeholder="Please specify the occasion"
                  className="mt-1"
                />
              </div>
            )}

            <div>
              <Label htmlFor="remarks">Special Instructions/Remarks</Label>
              <Textarea
                id="remarks"
                value={orderData.remarks}
                onChange={(e) => handleInputChange('remarks', e.target.value)}
                placeholder="Any special instructions, color preferences, or text you'd like on the wrapping..."
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-amber-900 mb-2">Review Your Order</h3>
              <p className="text-gray-600">Please review all details before submitting your order</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Customer Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-amber-800">Customer Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Name:</strong> {orderData.customerName}</p>
                  <p><strong>Email:</strong> {orderData.customerEmail}</p>
                  <p><strong>Phone:</strong> {orderData.customerPhone}</p>
                  <p><strong>Address:</strong> {orderData.shippingAddress}</p>
                </CardContent>
              </Card>

              {/* Order Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-amber-800">Order Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p><strong>Chocolate:</strong> {chocolateTypes.find(t => t.value === orderData.chocolateType)?.label}</p>
                  <p><strong>Size:</strong> {getSizeOptions(orderData.chocolateType).find(s => s.value === orderData.chocolateSize)?.label} 
                     ({getSizeOptions(orderData.chocolateType).find(s => s.value === orderData.chocolateSize)?.dimensions})</p>
                  <p><strong>Quantity:</strong> {orderData.quantity}</p>
                  <p><strong>Purpose:</strong> {orderData.purpose === 'Other' ? orderData.customPurpose : orderData.purpose}</p>
                  {orderData.uploadedImage && <p><strong>Image:</strong> {orderData.uploadedImage.name}</p>}
                </CardContent>
              </Card>
            </div>

            {orderData.remarks && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg text-amber-800">Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{orderData.remarks}</p>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between text-xl">
                  <span className="font-semibold text-green-800">Total Estimated Cost:</span>
                  <span className="text-3xl font-bold text-green-700">${calculateEstimatedCost()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const steps = [
    { number: 1, title: "Customer Details", description: "Your contact information" },
    { number: 2, title: "Chocolate Selection", description: "Choose type, size & quantity" },
    { number: 3, title: "Customization", description: "Upload image & specify occasion" },
    { number: 4, title: "Review & Submit", description: "Confirm your order" },
  ];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-amber-700 hover:text-amber-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-800 to-red-700 bg-clip-text text-transparent mb-2">
            Customize Your Chocolate Wrapping
          </h1>
          <p className="text-gray-600">Create the perfect wrapping for your special occasion</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step) => (
              <div key={step.number} className="flex-1 relative">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${currentStep >= step.number 
                      ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }`}>
                    {step.number}
                  </div>
                  <div className="text-center mt-2">
                    <div className={`font-medium text-sm ${currentStep >= step.number ? 'text-amber-800' : 'text-gray-500'}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {step.number < steps.length && (
                  <div className={`absolute top-5 left-[60%] w-[80%] h-0.5 
                    ${currentStep > step.number ? 'bg-gradient-to-r from-amber-600 to-red-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-2xl text-amber-900">
              <Gift className="w-6 h-6" />
              <span>Step {currentStep}: {steps[currentStep - 1].title}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                onClick={handleBack}
                disabled={currentStep === 1}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center space-x-2"
                >
                  <span>Submit Order</span>
                  <Gift className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomizationWizard;