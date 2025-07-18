
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Gift, Mail, Phone, Home, ArrowRight } from "lucide-react";

const OrderConfirmation = () => {
  const { orderId } = useParams();

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
            <p className="text-gray-600">
              Thank you for choosing ChocoWrap Customizer
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <p className="text-lg font-semibold text-green-800 mb-2">
                Order ID: <span className="text-2xl font-bold">{orderId}</span>
              </p>
              <p className="text-green-600">
                Keep this ID for your records and future reference
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-amber-900 flex items-center space-x-2">
                <Gift className="w-5 h-5" />
                <span>What happens next?</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <Mail className="w-6 h-6 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Confirmation Email</h4>
                    <p className="text-blue-600 text-sm">
                      You'll receive a detailed confirmation email within the next few minutes with all your order details.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-amber-50 rounded-lg">
                  <Phone className="w-6 h-6 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Design Review</h4>
                    <p className="text-amber-600 text-sm">
                      Our design team will review your requirements and uploaded image within 24-48 hours.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <Gift className="w-6 h-6 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-purple-800">Production & Delivery</h4>
                    <p className="text-purple-600 text-sm">
                      Once approved, we'll begin production and ship your custom wrapped chocolates to your address.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-amber-900 mb-3">
                Need Help?
              </h3>
              <p className="text-gray-600 mb-4">
                If you have any questions about your order or need to make changes, 
                please contact us with your order ID.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>support@chocowrap.com</span>
                </Button>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>1-800-CHOCO-WRAP</span>
                </Button>
              </div>
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
