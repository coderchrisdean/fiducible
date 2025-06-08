import { Switch, Route, useLocation } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyEmail from "@/pages/verify-email";
import Dashboard from "@/pages/dashboard";
import TimeTracking from "@/pages/time-tracking";
import Conservatees from "@/pages/conservatees";
import Documents from "@/pages/documents";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    console.log('[Router] [NAVIGATION] [' + new Date().toISOString() + '] Location changed to:', location);
    
    // Handle browser navigation events
    const handlePopState = () => {
      console.log('[Router] [BACK_BUTTON] [' + new Date().toISOString() + '] Browser back button pressed, invalidating queries');
      // Force query refetch on browser navigation
      queryClient.invalidateQueries();
    };

    window.addEventListener('popstate', handlePopState);
    
    // Ensure proper state management on location change
    console.log('[Router] [REFETCH] [' + new Date().toISOString() + '] Refetching queries for location:', location);
    queryClient.refetchQueries();

    return () => {
      console.log('[Router] [CLEANUP] [' + new Date().toISOString() + '] Cleaning up navigation listeners for:', location);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/verify-email" component={VerifyEmail} />
      <Route path="/dashboard">
        <Layout>
          <Dashboard />
        </Layout>
      </Route>
      <Route path="/time-tracking">
        <Layout>
          <TimeTracking />
        </Layout>
      </Route>
      <Route path="/conservatees">
        <Layout>
          <Conservatees />
        </Layout>
      </Route>
      <Route path="/documents/:caseId">
        <Layout>
          <Documents />
        </Layout>
      </Route>
      <Route path="/profile">
        <Layout>
          <Profile />
        </Layout>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
