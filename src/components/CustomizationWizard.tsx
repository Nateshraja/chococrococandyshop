import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "../../supabase/client";
import html2pdf from "html2pdf.js";

const chocolateTypes = [
  { label: "Dark Chocolate", value: "dark", basePrice: 20 },
  { label: "Milk Chocolate", value: "milk", basePrice: 15 },
  { label: "White Chocolate", value: "white", basePrice: 18 },
];

async function generateNextOrderId(): Promise<string> {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");

  const { data, error } = await supabase
    .from("orders")
    .select("orderid")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0 || !data[0].orderid) {
    return `ORD-${today}-000001`;
  }

  const lastOrderId = data[0].orderid;
  const lastNumberMatch = lastOrderId.match(/-(\d+)$/);
  const lastNumber = lastNumberMatch ? parseInt(lastNumberMatch[1]) : 0;

  const nextNumber = (lastNumber + 1).toString().padStart(6, "0");
  return `ORD-${today}-${nextNumber}`;
}

export default function OrderForm() {
  const [orderData, setOrderData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    chocolateType: "",
    quantity: 1,
    uploadedImage: null,
    purpose: "",
    customPurpose: "",
    remarks: "",
  });

  const [totalAmount, setTotalAmount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null);

  const handleInputChange = (field: string, value: any) => {
    setOrderData((prev) => ({ ...prev, [field]: value }));
  };

  const calculateEstimatedCost = () => {
    const selected = chocolateTypes.find((c) => c.value === orderData.chocolateType);
    if (!selected) return 0;
    let cost = selected.basePrice * orderData.quantity;
    if (orderData.uploadedImage) cost += 5;
    return cost;
  };

  useEffect(() => {
    setTotalAmount(calculateEstimatedCost());
  }, [orderData.chocolateType, orderData.quantity, orderData.uploadedImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleInputChange("uploadedImage", e.target.files[0]);
    }
  };

  const handleDownloadPDF = () => {
    if (!popupRef.current) return;
    html2pdf().from(popupRef.current).save(`${orderId}_OrderDetails.pdf`);
  };

  const handleSubmit = async () => {
    if (!orderData.customerName || !orderData.customerPhone || !orderData.chocolateType) {
      alert("Please fill all required fields.");
      return;
    }

    setUploading(true);

    let imageUrl: string | null = null;

    if (orderData.uploadedImage) {
      const file = orderData.uploadedImage;
      const { data, error } = await supabase.storage
        .from("orderimages")
        .upload(`images/${Date.now()}_${file.name}`, file);

      if (error) {
        alert("Image upload failed.");
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("orderimages")
        .getPublicUrl(data.path);
      imageUrl = urlData.publicUrl;
    }

    const newOrderId = await generateNextOrderId();
    setOrderId(newOrderId);

    const { error } = await supabase.from("orders").insert([
      {
        customer_name: orderData.customerName,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        shipping_address: orderData.shippingAddress,
        chocolate_type: orderData.chocolateType,
        quantity: orderData.quantity,
        purpose: orderData.purpose === "Other" ? orderData.customPurpose : orderData.purpose,
        remarks: orderData.remarks,
        image_url: imageUrl,
        total_amount: totalAmount,
        orderid: newOrderId,
        status: "Pending",
      },
    ]);

    if (error) {
      alert("Order failed to submit.");
      console.error(error);
    } else {
      // Store data in localStorage for /print page
      localStorage.setItem("printData", JSON.stringify({
        orderId: newOrderId,
        name: orderData.customerName,
        phone: orderData.customerPhone,
        chocolateType: orderData.chocolateType,
        quantity: orderData.quantity,
        total: totalAmount,
        purpose: orderData.purpose === "Other" ? orderData.customPurpose : orderData.purpose,
        remarks: orderData.remarks,
      }));

      // Open new tab to print
      window.open("/OrderConfirmation", "_blank");

      // Optionally show confirmation popup here too
      setShowPopup(true);
    }

    setUploading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Place Your Chocolate Order 🍫
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label>Full Name *</Label>
            <Input
              placeholder="Your name"
              value={orderData.customerName}
              onChange={(e) => handleInputChange("customerName", e.target.value)}
            />
            <Label>Email</Label>
            <Input
              placeholder="your@email.com"
              value={orderData.customerEmail}
              onChange={(e) => handleInputChange("customerEmail", e.target.value)}
            />
            <Label>Phone Number *</Label>
            <Input
              placeholder="+91-XXXXXXXXXX"
              value={orderData.customerPhone}
              onChange={(e) => handleInputChange("customerPhone", e.target.value)}
            />
            <Label>Shipping Address</Label>
            <Textarea
              placeholder="Enter full address"
              value={orderData.shippingAddress}
              onChange={(e) => handleInputChange("shippingAddress", e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <Label>Chocolate Type *</Label>
            <Select
              value={orderData.chocolateType}
              onValueChange={(value) => handleInputChange("chocolateType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {chocolateTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label} (₹{type.basePrice})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Label>Quantity *</Label>
            <Input
              type="number"
              min={1}
              value={orderData.quantity}
              onChange={(e) =>
                handleInputChange("quantity", parseInt(e.target.value))
              }
            />
          </div>

          <div className="space-y-4">
            <Label>Purpose</Label>
            <Select
              value={orderData.purpose}
              onValueChange={(value) => handleInputChange("purpose", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Birthday">Birthday</SelectItem>
                <SelectItem value="Anniversary">Anniversary</SelectItem>
                <SelectItem value="Thank You">Thank You</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            {orderData.purpose === "Other" && (
              <>
                <Label>Custom Purpose</Label>
                <Input
                  placeholder="e.g. Graduation"
                  value={orderData.customPurpose}
                  onChange={(e) => handleInputChange("customPurpose", e.target.value)}
                />
              </>
            )}
          </div>

          <div className="space-y-2">
            <Label>Upload Image (Optional)</Label>
            <Input type="file" onChange={handleFileChange} />
            {orderData.uploadedImage && (
              <p className="text-sm text-muted-foreground">
                {orderData.uploadedImage.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Remarks</Label>
            <Textarea
              placeholder="Any special instructions?"
              value={orderData.remarks}
              onChange={(e) => handleInputChange("remarks", e.target.value)}
            />
          </div>

          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center">
              <p className="text-lg font-medium">Estimated Total:</p>
              <p className="text-xl font-bold text-green-600">₹{totalAmount}</p>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full mt-4"
              disabled={uploading}
            >
              {uploading ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div ref={popupRef} className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-bold mb-4">Order Confirmation</h2>
            <p><strong>Order ID:</strong> {orderId}</p>
            <p><strong>Name:</strong> {orderData.customerName}</p>
            <p><strong>Phone:</strong> {orderData.customerPhone}</p>
            <p><strong>Chocolate Type:</strong> {orderData.chocolateType}</p>
            <p><strong>Quantity:</strong> {orderData.quantity}</p>
            <p><strong>Total:</strong> ₹{totalAmount}</p>
            <p><strong>Purpose:</strong> {orderData.purpose === "Other" ? orderData.customPurpose : orderData.purpose}</p>
            <p><strong>Remarks:</strong> {orderData.remarks}</p>
            <div className="mt-4 flex gap-4">
              <Button onClick={handleDownloadPDF}>Download PDF</Button>
              <Button variant="outline" onClick={() => setShowPopup(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
