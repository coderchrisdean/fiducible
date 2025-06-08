import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings, Shield, Users, Mail, Edit2, Save, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  globalRole: z.enum(["admin", "conservator", "attorney", "observer"]).optional(),
});

type ProfileUpdateForm = z.infer<typeof profileUpdateSchema>;

export default function Profile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: true,
  });

  const form = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      name: "",
      email: "",
      globalRole: "conservator",
    },
  });

  // Update form when profile data loads
  if (profileData?.user && !form.formState.isDirty) {
    form.reset({
      name: profileData.user.name || "",
      email: profileData.user.email || "",
      globalRole: profileData.user.globalRole || "conservator",
    });
  }

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateForm) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/profile"], (oldData: any) => ({
        ...oldData,
        user: data.user,
      }));
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileUpdateForm) => {
    updateProfileMutation.mutate(data);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original values
      form.reset({
        name: profileData?.user?.name || "",
        email: profileData?.user?.email || "",
        globalRole: profileData?.user?.globalRole || "conservator",
      });
    }
    setIsEditing(!isEditing);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "conservator": return "default";
      case "attorney": return "secondary";
      case "observer": return "outline";
      default: return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const user = profileData?.user;
  const caseRoles = profileData?.caseRoles || [];
  const cases = profileData?.cases || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and case roles
          </p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="cases" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Cases & Roles
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and preferences
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditToggle}
                className="flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit2 className="h-4 w-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="flex items-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Full Name
                      </label>
                      <p className="text-lg font-medium">{user?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Email Address
                      </label>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-medium">{user?.email}</p>
                        {user?.emailVerified ? (
                          <Badge variant="secondary" className="text-xs">
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Global Role
                      </label>
                      <div className="flex items-center gap-2">
                        <Badge variant={getRoleBadgeVariant(user?.globalRole)}>
                          {user?.globalRole?.charAt(0).toUpperCase() + user?.globalRole?.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Member Since
                      </label>
                      <p className="text-lg font-medium">
                        {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Case Access & Roles</CardTitle>
              <CardDescription>
                View cases you have access to and your roles within each case
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cases.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    You don't have access to any cases yet. Contact an administrator to get invited to a case.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  {cases.map((caseItem: any) => {
                    const userRole = caseRoles.find((role: any) => role.caseId === caseItem.id);
                    return (
                      <div key={caseItem.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{caseItem.name}</h3>
                            {caseItem.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {caseItem.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{caseItem.status}</Badge>
                            {userRole && (
                              <Badge variant="secondary">
                                Role: {userRole.role?.name || "Unknown"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and verification status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">Email Verification</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.emailVerified 
                        ? "Your email address has been verified"
                        : "Please verify your email address"
                      }
                    </p>
                  </div>
                </div>
                {user?.emailVerified ? (
                  <Badge variant="secondary">Verified</Badge>
                ) : (
                  <Badge variant="destructive">Unverified</Badge>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="font-medium">Account Actions</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  For password changes or account deletion, please contact your system administrator.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}