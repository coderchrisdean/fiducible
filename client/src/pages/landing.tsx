import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Users, FileText, Shield, CheckCircle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img 
                src="/fiducible-logo.png" 
                alt="Fiducible" 
                className="h-8 w-8"
              />
              <span className="ml-3 text-xl font-semibold text-gray-900">Fiducible</span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-gray-900 rounded-xl">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-20">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-gray-900 sm:text-6xl leading-tight">
            Professional Fiduciary
            <br />
            <span className="text-blue-600">Management</span>
          </h1>
          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Track time, manage conservatees, and maintain detailed records with precision and simplicity.
          </p>
          <div className="mt-12 flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-4 text-lg font-medium shadow-sm">
                Get Started
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-8 py-4 text-lg">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold text-gray-900 sm:text-4xl mb-4">
              Built for Professionals
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Essential tools for fiduciary management, designed with simplicity and precision
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Time Tracking</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Precise time tracking with 6-minute increments for accurate billing and professional reporting
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Conservatee Management</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Organize and track all conservatee information, case numbers, and contact details in one place
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Documentation</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Maintain detailed records with memos and task descriptions for every activity and interaction
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 ml-4">Compliance Ready</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Generate reports and maintain records that meet legal and regulatory requirements
              </p>
            </div>
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
              <img 
                src="/app-icon.png" 
                alt="Fiducible" 
                className="h-8 w-8"
              />
              <span className="ml-2 text-xl font-bold text-teal-600 dark:text-teal-400">Fiducible</span>
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