import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "../../supabase/client";

const AuthPage = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const navigate = useNavigate();
  const { toast } = useToast();

  // Splash screen effect
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      if (!error && data.user) {
        toast({
          title: "Signup successful! 🎉",
          description: "Check your email to confirm your account.",
        });
        setIsSignUp(false);
      } else {
        toast({
          title: "Signup failed",
          description: error?.message,
          variant: "destructive",
        });
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (!error && data.user) {
        // Check if the email matches your admin email
        if (data.user.email === "nateshraja1499@gmail.com") {
          toast({
            title: "Login successful! 🎉",
            description: "Welcome, Admin.",
          });
          setTimeout(() => {
            navigate("/admin/dashboard");
          }, 1500);
        } else {
          toast({
            title: "Login successful! 🎉",
            description: "Welcome to your dashboard.",
          });
          setTimeout(() => {
            navigate("/");
          }, 1500);
        }
      } else {
        toast({
          title: "Login failed",
          description: error?.message,
          variant: "destructive",
        });
      }
    }

    setIsLoading(false);
  };

  if (showSplash) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-amber-400 to-amber-700">
        <div className="flex flex-col items-center">
          <Shield className="w-16 h-16 text-white animate-bounce mb-4" />
          <span className="text-3xl font-bold text-white tracking-wide">ChocoWrap</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-none bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-800 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">
              {isSignUp ? "Sign Up" : "Login"}
            </CardTitle>
            <p className="text-gray-600">
              {isSignUp
                ? "Create your ChocoWrap account"
                : "Access the ChocoWrap dashboard"}
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={credentials.email}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="Enter your email"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  placeholder="Enter your password"
                  className="mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-slate-600 to-slate-800 hover:from-slate-700 hover:to-slate-900"
                disabled={isLoading}
              >
                {isLoading
                  ? isSignUp
                    ? "Signing up..."
                    : "Signing in..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                className="text-amber-700 hover:underline"
                onClick={() => setIsSignUp((v) => !v)}
              >
                {isSignUp
                  ? "Already have an account? Login"
                  : "Don't have an account? Sign Up"}
              </button>
            </div>
            <div className="mt-6 pt-6 border-t text-center">
              <Link
                to="/"
                className="inline-flex items-center space-x-2 text-amber-700 hover:text-amber-800"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;