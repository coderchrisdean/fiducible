import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/verify-email");
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('No verification token provided');
        return;
      }

      try {
        const response = await apiRequest(`/api/verify-email?token=${token}`, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          setStatus('success');
          setMessage(data.message || 'Email verified successfully');
        } else {
          const errorData = await response.json();
          setStatus('error');
          setMessage(errorData.message || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, []);

  const handleContinue = () => {
    setLocation("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Email Verification</CardTitle>
          <CardDescription>
            Verifying your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Verifying your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <>
              <div className="text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
              <Button 
                onClick={handleContinue}
                className="w-full"
              >
                Continue to Login
              </Button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    {message}
                  </AlertDescription>
                </Alert>
              </div>
              <div className="space-y-3">
                <Button 
                  onClick={handleContinue}
                  variant="outline"
                  className="w-full"
                >
                  Go to Login
                </Button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  You can request a new verification email from the login page
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}