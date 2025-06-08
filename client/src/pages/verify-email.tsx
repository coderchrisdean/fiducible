import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function VerifyEmail() {
  console.log('[VerifyEmail] [ROUTE_ENTRY] [' + new Date().toISOString() + '] Entering verify email page');
  
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/verify-email");
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");
  const [showResendForm, setShowResendForm] = useState(false);
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

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
        const response = await fetch(`/api/verify-email?token=${token}`, {
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
    console.log('[VerifyEmail] [NAVIGATE] [' + new Date().toISOString() + '] Navigating to login');
    setLocation("/login");
  };

  const handleResendEmail = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    console.log('[VerifyEmail] [RESEND_EMAIL] [' + new Date().toISOString() + '] Attempting to resend email to:', email);
    setResending(true);

    try {
      const response = await apiRequest("POST", "/api/emails/resend", { email });
      if (response.ok) {
        const data = await response.json();
        console.log('[VerifyEmail] [RESEND_EMAIL] [' + new Date().toISOString() + '] Email resent successfully');
        toast({
          title: "Email Sent",
          description: data.message || "Verification email sent successfully",
        });
        setShowResendForm(false);
        setEmail("");
      } else {
        const errorData = await response.json();
        console.error('[VerifyEmail] [RESEND_EMAIL] [' + new Date().toISOString() + '] Failed to resend email:', errorData.message);
        toast({
          title: "Failed to Send",
          description: errorData.message || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[VerifyEmail] [RESEND_EMAIL] [' + new Date().toISOString() + '] Error:', error);
      toast({
        title: "Error",
        description: "Failed to send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
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
                {!showResendForm ? (
                  <>
                    <Button 
                      onClick={() => setShowResendForm(true)}
                      className="w-full"
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </Button>
                    <Button 
                      onClick={handleContinue}
                      variant="outline"
                      className="w-full"
                    >
                      Go to Login
                    </Button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="resend-email">Email Address</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={resending}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleResendEmail}
                        disabled={resending}
                        className="flex-1"
                      >
                        {resending ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4 mr-2" />
                            Send Email
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={() => setShowResendForm(false)}
                        variant="outline"
                        disabled={resending}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}