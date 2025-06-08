import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, FileText, Shield, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-900 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Fiducible
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
            Streamline Your
            <span className="text-blue-600 dark:text-blue-400"> Fiduciary </span>
            Management
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Track time, manage conservatees, and maintain detailed records with our comprehensive 
            fiduciary management platform. Built for conservators who need reliable, 
            professional documentation.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg" className="px-8 py-3">
                Start Free Trial
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to manage fiduciary responsibilities
            </h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
              Professional tools designed specifically for fiduciaries
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <CardTitle>Time Tracking</CardTitle>
                <CardDescription>
                  Precise time tracking with 6-minute increments for accurate billing and reporting
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
                <CardTitle>Conservatee Management</CardTitle>
                <CardDescription>
                  Organize and track all conservatee information, case numbers, and contact details
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Maintain detailed records with memos and task descriptions for every activity
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                <CardTitle>Compliance Ready</CardTitle>
                <CardDescription>
                  Generate reports and maintain records that meet legal and regulatory requirements
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-4 text-lg text-blue-100">
              Join fiduciaries who trust Fiducible for their professional practice
            </p>
            <div className="mt-8">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="px-8 py-3">
                  Create Your Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-lg font-semibold text-gray-900 dark:text-white">
                Fiducible
              </span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <Link href="/privacy">Privacy Policy</Link>
              <Link href="/terms">Terms of Service</Link>
              <Link href="/contact">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}