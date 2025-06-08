import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Calendar as CalendarIcon, Plus, Edit, Trash2, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { TimeEntry, Conservatee } from "@shared/schema";

const timeEntrySchema = z.object({
  date: z.string(),
  taskDescription: z.string().min(1, "Task description is required"),
  memo: z.string().optional(),
  timeSpent: z.string().min(1, "Time spent is required"),
  conservateeId: z.string().optional(),
});

type TimeEntryForm = z.infer<typeof timeEntrySchema>;

// Utility function to round time to 10-minute increments (0.1667 hours)
const roundToTenMinutes = (hours: number): number => {
  return Math.round(hours * 6) / 6;
};

export default function TimeTracking() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: conservatees, isLoading: conservateesLoading } = useQuery<Conservatee[]>({
    queryKey: ["/api/conservatees"],
  });

  const form = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      taskDescription: "",
      memo: "",
      timeSpent: "",
      conservateeId: "",
    },
  });

  const editForm = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: TimeEntryForm) => {
      const timeSpentDecimal = roundToTenMinutes(parseFloat(data.timeSpent));
      const payload = {
        ...data,
        timeSpent: timeSpentDecimal.toString(),
        conservateeId: data.conservateeId ? parseInt(data.conservateeId) : null,
      };
      const response = await apiRequest("POST", "/api/time-entries", payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      form.reset({
        date: format(new Date(), "yyyy-MM-dd"),
        taskDescription: "",
        memo: "",
        timeSpent: "",
        conservateeId: "",
      });
      toast({
        title: "Time entry added",
        description: "Your time entry has been successfully recorded.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TimeEntryForm }) => {
      const timeSpentDecimal = roundToTenMinutes(parseFloat(data.timeSpent));
      const payload = {
        ...data,
        timeSpent: timeSpentDecimal.toString(),
        conservateeId: data.conservateeId ? parseInt(data.conservateeId) : null,
      };
      const response = await apiRequest("PUT", `/api/time-entries/${id}`, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      setEditingId(null);
      toast({
        title: "Time entry updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time entry deleted",
        description: "The time entry has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: TimeEntryForm) => {
    createMutation.mutate(data);
  };

  const onEdit = (entry: TimeEntry) => {
    const conservatee = conservatees?.find(c => c.id === entry.conservateeId);
    editForm.reset({
      date: entry.date,
      taskDescription: entry.taskDescription,
      memo: entry.memo || "",
      timeSpent: parseFloat(entry.timeSpent).toString(),
      conservateeId: entry.conservateeId?.toString() || "",
    });
    setEditingId(entry.id);
  };

  const onUpdate = (data: TimeEntryForm) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    }
  };

  const onDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      deleteMutation.mutate(id);
    }
  };

  const totalHours = timeEntries?.reduce((total, entry) => total + parseFloat(entry.timeSpent), 0) || 0;

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Record and manage your conservatorship activities
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2">
          Total: {totalHours.toFixed(1)} hours
        </Badge>
      </div>

      {/* Add Time Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Time Entry
          </CardTitle>
          <CardDescription>
            Record time spent on conservatorship activities (rounded to 10-minute increments)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conservateeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conservatee (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select conservatee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {conservatees?.map((conservatee) => (
                            <SelectItem key={conservatee.id} value={conservatee.id.toString()}>
                              {conservatee.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="taskDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Description</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Court filing preparation, phone consultation..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="timeSpent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Spent (hours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="1.5"
                        {...field}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (!isNaN(value)) {
                            const rounded = roundToTenMinutes(value);
                            field.onChange(rounded.toString());
                          } else {
                            field.onChange(e.target.value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memo (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about the activity..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Time Entry"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Entries
          </CardTitle>
          <CardDescription>
            View and manage your recorded time entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {timeEntriesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : timeEntries && timeEntries.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Conservatee</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map((entry) => {
                    const conservatee = conservatees?.find(c => c.id === entry.conservateeId);
                    const isEditing = editingId === entry.id;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="date"
                              {...editForm.register("date")}
                              className="w-32"
                            />
                          ) : (
                            format(new Date(entry.date), "MMM d, yyyy")
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Select
                              value={editForm.watch("conservateeId")}
                              onValueChange={(value) => editForm.setValue("conservateeId", value)}
                            >
                              <SelectTrigger className="w-40">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">None</SelectItem>
                                {conservatees?.map((c) => (
                                  <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            conservatee?.name || "General"
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="space-y-2">
                              <Input
                                {...editForm.register("taskDescription")}
                                className="w-full"
                              />
                              <Textarea
                                {...editForm.register("memo")}
                                placeholder="Memo..."
                                className="w-full resize-none"
                                rows={2}
                              />
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">{entry.taskDescription}</div>
                              {entry.memo && (
                                <div className="text-sm text-muted-foreground mt-1">
                                  {entry.memo}
                                </div>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.1"
                              min="0.1"
                              {...editForm.register("timeSpent")}
                              className="w-20"
                              onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  const rounded = roundToTenMinutes(value);
                                  editForm.setValue("timeSpent", rounded.toString());
                                }
                              }}
                            />
                          ) : (
                            <Badge variant="secondary">
                              {parseFloat(entry.timeSpent).toFixed(1)}h
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={editForm.handleSubmit(onUpdate)}
                                disabled={updateMutation.isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onEdit(entry)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDelete(entry.id)}
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No time entries</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start tracking your conservatorship activities by adding your first entry.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}