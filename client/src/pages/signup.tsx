import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, AlertCircle, CheckCircle, Mail } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { signupValidationSchema } from "@shared/schema";

type SignupForm = z.infer<typeof signupValidationSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSuccess, setShowSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupValidationSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: Omit<SignupForm, "confirmPassword">) => {
      const response = await apiRequest("POST", "/api/auth/signup", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data.user);
      setUserEmail(form.getValues("email"));
      setShowSuccess(true);
      toast({
        title: "Account created!",
        description: "Welcome to Fiducible. Let's get started.",
      });
      setLocation("/dashboard");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiRequest("POST", "/api/emails/resend", { email });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Email sent",
        description: "Verification email has been resent to your inbox",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send email",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SignupForm) => {
    const { confirmPassword, ...signupData } = data;
    signupMutation.mutate(signupData);
  };

  const handleResendEmail = () => {
    resendMutation.mutate(userEmail);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Mail className="h-16 w-16 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We've sent a verification link to {userEmail}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Account created successfully! Please check your email and click the verification link to activate your account.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-3">
              <Button 
                onClick={handleResendEmail}
                disabled={resendMutation.isPending}
                variant="outline"
                className="w-full"
              >
                {resendMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Resend verification email
              </Button>
              
              <Button 
                onClick={() => setLocation("/login")}
                className="w-full"
              >
                Continue to Login
              </Button>
            </div>

            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <img 
              src="/app-icon.png" 
              alt="Fiducible" 
              className="h-8 w-8"
            />
            <span className="ml-2 text-xl font-bold text-teal-600 dark:text-teal-400">Fiducible</span>
          </div>
          <CardTitle className="text-2xl text-center">Create your account</CardTitle>
          <CardDescription className="text-center">
            Start managing your fiduciary responsibilities professionally
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="John Doe" 
                          {...field}
                          className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.error ? "border-green-500" : ""}
                        />
                        {fieldState.isDirty && !fieldState.error && (
                          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {fieldState.error && (
                          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          {...field}
                          className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.error ? "border-green-500" : ""}
                        />
                        {fieldState.isDirty && !fieldState.error && (
                          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {fieldState.error && (
                          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="password" 
                          placeholder="At least 8 characters"
                          {...field}
                          className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.error ? "border-green-500" : ""}
                        />
                        {fieldState.isDirty && !fieldState.error && (
                          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {fieldState.error && (
                          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="password" 
                          placeholder="Repeat your password"
                          {...field}
                          className={fieldState.error ? "border-red-500" : fieldState.isDirty && !fieldState.error ? "border-green-500" : ""}
                        />
                        {fieldState.isDirty && !fieldState.error && (
                          <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                        )}
                        {fieldState.error && (
                          <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm flex items-center gap-1" />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
              Sign in
            </Link>
          </div>
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm text-gray-600 hover:underline dark:text-gray-400">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}