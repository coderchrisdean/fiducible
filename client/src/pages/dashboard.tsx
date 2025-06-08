import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Plus, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { TimeEntry, Conservatee } from "@shared/schema";

interface DashboardStats {
  activeConservatees: number;
  hoursThisWeek: number;
  totalEntries: number;
  dailyAverage: number;
}

export default function Dashboard() {
  const { data: dashboardStats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentTimeEntries, isLoading: entriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/dashboard/recent-entries"],
  });

  const { data: conservatees, isLoading: conservateesLoading } = useQuery<Conservatee[]>({
    queryKey: ["/api/conservatees"],
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Overview of your fiduciary management activities
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/time-tracking">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 shadow-sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Time Entry
            </Button>
          </Link>
          <Link href="/conservatees">
            <Button className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl px-4 py-2" variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Conservatees
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {statsLoading ? <Skeleton className="h-8 w-12" /> : dashboardStats?.activeConservatees || 0}
          </div>
          <p className="text-sm text-gray-600">Active conservatees</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (dashboardStats?.hoursThisWeek || 0).toFixed(1)}
          </div>
          <p className="text-sm text-gray-600">Hours this week</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {statsLoading ? <Skeleton className="h-8 w-12" /> : dashboardStats?.totalEntries || 0}
          </div>
          <p className="text-sm text-gray-600">Total entries</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-semibold text-gray-900 mb-1">
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (dashboardStats?.dailyAverage || 0).toFixed(1)}
          </div>
          <p className="text-sm text-gray-600">Daily average</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Time Entries */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
            <CardDescription>Your most recent conservatorship activities</CardDescription>
          </CardHeader>
          <CardContent>
            {entriesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentTimeEntries && recentTimeEntries.length > 0 ? (
              <div className="space-y-4">
                {recentTimeEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {entry.taskDescription}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), "MMM d, yyyy")}
                      </p>
                      {entry.memo && (
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          {entry.memo}
                        </p>
                      )}
                    </div>
                    <Badge variant="secondary">
                      {parseFloat(entry.timeSpent).toFixed(1)}h
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Clock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No time entries</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by adding your first time entry.
                </p>
                <div className="mt-6">
                  <Link href="/time-tracking">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Time Entry
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Conservatees Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Your Conservatees</CardTitle>
            <CardDescription>
              Active fiduciary cases
            </CardDescription>
          </CardHeader>
          <CardContent>
            {conservateesLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conservatees && conservatees.length > 0 ? (
              <div className="space-y-4">
                {conservatees.slice(0, 5).map((conservatee) => (
                  <div key={conservatee.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {conservatee.name}
                      </p>
                      {conservatee.caseNumber && (
                        <p className="text-xs text-muted-foreground">
                          Case: {conservatee.caseNumber}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
                {conservatees.length > 5 && (
                  <div className="text-center pt-2">
                    <Link href="/conservatees">
                      <Button variant="ghost" size="sm">
                        View all {conservatees.length} conservatees
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">No conservatees</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Add your first conservatee to get started.
                </p>
                <div className="mt-6">
                  <Link href="/conservatees">
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Conservatee
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}