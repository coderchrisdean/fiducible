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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Edit, Trash2, Save, X, Phone, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Conservatee } from "@shared/schema";

const conservateeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dob: z.string().optional(),
  contactInfo: z.string().optional(),
  caseNumber: z.string().optional(),
  notes: z.string().optional(),
});

type ConservateeForm = z.infer<typeof conservateeSchema>;

export default function Conservatees() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conservatees, isLoading } = useQuery<Conservatee[]>({
    queryKey: ["/api/conservatees"],
  });

  const form = useForm<ConservateeForm>({
    resolver: zodResolver(conservateeSchema),
    defaultValues: {
      name: "",
      dob: "",
      contactInfo: "",
      caseNumber: "",
      notes: "",
    },
  });

  const editForm = useForm<ConservateeForm>({
    resolver: zodResolver(conservateeSchema),
  });

  const createMutation = useMutation({
    mutationFn: async (data: ConservateeForm) => {
      const response = await apiRequest("POST", "/api/conservatees", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conservatees"] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Conservatee added",
        description: "The conservatee has been successfully added to your list.",
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
    mutationFn: async ({ id, data }: { id: number; data: ConservateeForm }) => {
      const response = await apiRequest("PUT", `/api/conservatees/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conservatees"] });
      setEditingId(null);
      toast({
        title: "Conservatee updated",
        description: "The conservatee information has been updated successfully.",
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
      await apiRequest("DELETE", `/api/conservatees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/conservatees"] });
      toast({
        title: "Conservatee removed",
        description: "The conservatee has been removed from your list.",
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

  const onSubmit = (data: ConservateeForm) => {
    createMutation.mutate(data);
  };

  const onEdit = (conservatee: Conservatee) => {
    editForm.reset({
      name: conservatee.name,
      dob: conservatee.dob || "",
      contactInfo: conservatee.contactInfo || "",
      caseNumber: conservatee.caseNumber || "",
      notes: conservatee.notes || "",
    });
    setEditingId(conservatee.id);
  };

  const onUpdate = (data: ConservateeForm) => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data });
    }
  };

  const onDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this conservatee? This action cannot be undone.")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Conservatees</h1>
          <p className="text-muted-foreground">
            Manage your fiduciary cases and contact information
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Conservatee
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Conservatee</DialogTitle>
              <DialogDescription>
                Enter the conservatee information to add them to your management list.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Case #12345" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Phone, address, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional notes about the conservatee..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Adding..." : "Add Conservatee"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Your Conservatees
          </CardTitle>
          <CardDescription>
            Manage information for all conservatees under your care
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : conservatees && conservatees.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Case Number</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conservatees.map((conservatee) => {
                    const isEditing = editingId === conservatee.id;

                    return (
                      <TableRow key={conservatee.id}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              {...editForm.register("name")}
                              className="w-40"
                            />
                          ) : (
                            <div className="font-medium">{conservatee.name}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              {...editForm.register("caseNumber")}
                              className="w-32"
                            />
                          ) : (
                            conservatee.caseNumber ? (
                              <Badge variant="outline">{conservatee.caseNumber}</Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="date"
                              {...editForm.register("dob")}
                              className="w-36"
                            />
                          ) : (
                            conservatee.dob ? (
                              format(new Date(conservatee.dob), "MMM d, yyyy")
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              {...editForm.register("contactInfo")}
                              className="w-48"
                            />
                          ) : (
                            conservatee.contactInfo ? (
                              <div className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                <span className="text-sm">{conservatee.contactInfo}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Textarea
                              {...editForm.register("notes")}
                              className="w-48 resize-none"
                              rows={2}
                            />
                          ) : (
                            conservatee.notes ? (
                              <div className="flex items-start gap-1">
                                <FileText className="h-3 w-3 mt-0.5" />
                                <span className="text-sm line-clamp-2">{conservatee.notes}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )
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
                                onClick={() => onEdit(conservatee)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onDelete(conservatee.id)}
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
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No conservatees</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start by adding your first conservatee to begin managing their case.
              </p>
              <div className="mt-6">
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add First Conservatee
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}