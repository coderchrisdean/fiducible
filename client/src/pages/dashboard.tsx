import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Users, Plus, FileText, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import type { TimeEntry, Conservatee } from "@shared/schema";

export default function Dashboard() {
  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: conservatees, isLoading: conservateesLoading } = useQuery<Conservatee[]>({
    queryKey: ["/api/conservatees"],
  });

  // Calculate recent activity and totals
  const recentTimeEntries = timeEntries?.slice(0, 5) || [];
  const totalHoursThisWeek = timeEntries?.reduce((total, entry) => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    if (entryDate >= weekAgo) {
      return total + parseFloat(entry.timeSpent);
    }
    return total;
  }, 0) || 0;

  const totalConservatees = conservatees?.length || 0;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your conservatorship management activities
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/time-tracking">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Time Entry
            </Button>
          </Link>
          <Link href="/conservatees">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Manage Conservatees
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conservatees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conservateesLoading ? <Skeleton className="h-8 w-12" /> : totalConservatees}
            </div>
            <p className="text-xs text-muted-foreground">
              Active cases under management
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours This Week</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntriesLoading ? <Skeleton className="h-8 w-16" /> : totalHoursThisWeek.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Billable hours logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntriesLoading ? <Skeleton className="h-8 w-12" /> : timeEntries?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Time entries recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Daily Hours</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeEntriesLoading ? <Skeleton className="h-8 w-16" /> : (totalHoursThisWeek / 7).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Based on this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Time Entries */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Time Entries</CardTitle>
            <CardDescription>
              Your most recent conservatorship activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timeEntriesLoading ? (
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
            ) : recentTimeEntries.length > 0 ? (
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Your Conservatees</CardTitle>
            <CardDescription>
              Active conservatorship cases
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