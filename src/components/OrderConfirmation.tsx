import { useRef, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Gift, Mail, Phone, Home, ArrowRight, Printer, FileDown } from "lucide-react";
import { supabase } from "../../supabase/client";
import html2pdf from "html2pdf.js";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const printRef = useRef<HTMLDivElement>(null);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()
        .then(({ data }) => setOrder(data));
    }
  }, [orderId]);

  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const win = window.open("", "Print", "width=800,height=600");
      if (win) {
        win.document.write(`
          <html>
            <head>
              <title>Order Confirmation</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                .order-id { font-size: 2rem; font-weight: bold; color: #059669; }
                .section { margin-bottom: 24px; }
                .label { font-weight: bold; color: #92400e; }
              </style>
            </head>
            <body>${printContents}</body>
          </html>
        `);
        win.document.close();
        win.focus();
        win.print();
        win.close();
      }
    }
  };

  const handleDownloadPDF = () => {
    if (printRef.current) {
      const opt = {
        margin: 0.5,
        filename: `Order-${order?.orderid || "confirmation"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      };
      html2pdf().set(opt).from(printRef.current).save();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-green-700 mb-2">
              Order Confirmed! 🎉
            </CardTitle>
            <p className="text-gray-600">Thank you for choosing ChocoWrap Customizer</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div ref={printRef}>
              <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 section">
                {order && (
                  <>
                    <p className="text-lg font-semibold text-green-800 mb-2 label">
                      Order ID: <span className="order-id">{order.orderid}</span>
                    </p>
                    <p className="text-green-600 mb-2">
                      Placed on: {new Date(order.created_at).toLocaleString()}
                    </p>
                    <p className="text-green-600 mb-2">
                      Product: {order.chocolate_type} ({order.chocolate_size})
                    </p>
                    <p className="text-green-600 mb-2">Quantity: {order.quantity}</p>
                    <p className="text-green-600 mb-2">Total: ₹{order.total_amount}</p>
                  </>
                )}
                <p className="text-green-600">
                  Keep this ID for your records and future reference
                </p>
              </div>
            </div>
              {/* What happens next section */}
              <div className="space-y-4 section">
                <h3 className="text-xl font-semibold text-amber-900 flex items-center space-x-2">
                  <Gift className="w-5 h-5" />
                  <span>What happens next?</span>
                </h3>
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Confirmation Email</h4>
                    <p className="text-blue-600 text-sm">
                      You'll receive a detailed confirmation email within the next few minutes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg">
                  <Phone className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Design Review</h4>
                    <p className="text-amber-600 text-sm">
                      Our design team will review your requirements and image within 24-48 hours.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-800">Production & Delivery</h4>
                    <p className="text-purple-600 text-sm">
                      Once approved, we'll begin production and ship your order.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help section */}
              <div className="border-t pt-6 section">
                <h3 className="text-lg font-semibold text-amber-900 mb-3">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  For any questions or changes, contact us with your order ID.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <span className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>support@chocowrap.com</span>
                  </span>
                  <span className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>1-800-CHOCO-WRAP</span>
                  </span>
                </div>
              </div>
            

            {/* Print and Download Buttons */}
            <div className="flex justify-center gap-4 pt-4 flex-wrap">
              <Button onClick={handlePrint} variant="outline" className="flex items-center space-x-2">
                <Printer className="w-4 h-4" />
                <span>Print Confirmation</span>
              </Button>
              <Button onClick={handleDownloadPDF} variant="secondary" className="flex items-center space-x-2">
                <FileDown className="w-4 h-4" />
                <span>Download as PDF</span>
              </Button>
            </div>

            <div className="flex justify-center pt-6">
              <Link to="/">
                <Button className="bg-gradient-to-r from-amber-600 to-red-600 hover:from-amber-700 hover:to-red-700 flex items-center space-x-2">
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderConfirmation;
