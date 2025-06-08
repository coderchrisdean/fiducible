import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Download, Share, Search, UserPlus, UserMinus, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Document {
  id: number;
  ownerId: number;
  caseId: number;
  title: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  fileSize?: number;
  mimeType?: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function DocumentsPage() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [accessDialogOpen, setAccessDialogOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploadTitle, setUploadTitle] = useState("");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents
  const { data: documentsData, isLoading: documentsLoading } = useQuery({
    queryKey: ["/api/documents", selectedCaseId],
    queryFn: () => apiRequest(`/api/documents?caseId=${selectedCaseId}`),
    enabled: !!selectedCaseId,
  });

  // Fetch users for access control
  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    queryFn: () => apiRequest("/api/users"),
  });

  // Search documents
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ["/api/documents/search", searchQuery, selectedCaseId],
    queryFn: () => apiRequest(`/api/documents/search?query=${searchQuery}&caseId=${selectedCaseId}`),
    enabled: !!searchQuery && searchQuery.length > 2,
  });

  // Upload documents mutation
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Documents uploaded successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      setUploadDialogOpen(false);
      setSelectedFiles(null);
      setUploadTitle("");
    },
    onError: () => {
      toast({ title: "Upload failed", variant: "destructive" });
    },
  });

  // Grant access mutation
  const grantAccessMutation = useMutation({
    mutationFn: async ({ documentId, userId }: { documentId: number; userId: string }) => {
      return apiRequest(`/api/documents/${documentId}/grant-access`, {
        method: "POST",
        body: JSON.stringify({ userId: parseInt(userId) }),
      });
    },
    onSuccess: () => {
      toast({ title: "Access granted successfully" });
      setAccessDialogOpen(false);
      setSelectedUserId("");
    },
    onError: () => {
      toast({ title: "Failed to grant access", variant: "destructive" });
    },
  });

  // Revoke access mutation
  const revokeAccessMutation = useMutation({
    mutationFn: async ({ documentId, userId }: { documentId: number; userId: string }) => {
      return apiRequest(`/api/documents/${documentId}/revoke-access`, {
        method: "POST",
        body: JSON.stringify({ userId: parseInt(userId) }),
      });
    },
    onSuccess: () => {
      toast({ title: "Access revoked successfully" });
    },
    onError: () => {
      toast({ title: "Failed to revoke access", variant: "destructive" });
    },
  });

  const handleUpload = () => {
    if (!selectedFiles || selectedFiles.length === 0) {
      toast({ title: "Please select files to upload", variant: "destructive" });
      return;
    }

    const formData = new FormData();
    formData.append("caseId", selectedCaseId);
    if (uploadTitle) {
      formData.append("title", uploadTitle);
    }
    
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    uploadMutation.mutate(formData);
  };

  const handleDownload = (documentId: number) => {
    window.open(`/api/documents/${documentId}/download`, '_blank');
  };

  const handleGrantAccess = () => {
    if (!selectedDocumentId || !selectedUserId) {
      toast({ title: "Please select a user", variant: "destructive" });
      return;
    }
    grantAccessMutation.mutate({ documentId: selectedDocumentId, userId: selectedUserId });
  };

  const handleRevokeAccess = (documentId: number, userId: string) => {
    revokeAccessMutation.mutate({ documentId, userId });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "Unknown size";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const documents = searchQuery && searchResults ? searchResults.documents : documentsData?.documents || [];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Document Management</h1>
          <p className="text-gray-600 mt-2">Upload, manage, and share case documents</p>
        </div>
        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Documents</DialogTitle>
              <DialogDescription>
                Select files to upload to the case
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="case-select">Case</Label>
                <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Case #1 - John Doe</SelectItem>
                    <SelectItem value="2">Case #2 - Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="Document title"
                />
              </div>
              <div>
                <Label htmlFor="files">Files</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  onChange={(e) => setSelectedFiles(e.target.files)}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCaseId} onValueChange={setSelectedCaseId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Case #1 - John Doe</SelectItem>
            <SelectItem value="2">Case #2 - Jane Smith</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Documents List */}
      <div className="grid gap-4">
        {documentsLoading || searchLoading ? (
          <div className="text-center py-8">Loading documents...</div>
        ) : documents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No documents found</p>
              {searchQuery && (
                <p className="text-sm text-gray-500 mt-2">
                  Try adjusting your search terms
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          documents.map((document: Document) => (
            <Card key={document.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{document.title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {document.fileName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(document.uploadedAt)}
                      </span>
                      {document.fileSize && (
                        <Badge variant="secondary">
                          {formatFileSize(document.fileSize)}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(document.id)}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedDocumentId(document.id)}
                        >
                          <Share className="w-4 h-4 mr-1" />
                          Share
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Manage Document Access</DialogTitle>
                          <DialogDescription>
                            Grant or revoke access to this document
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="user-select">Grant Access to User</Label>
                            <div className="flex gap-2 mt-2">
                              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                                <SelectTrigger className="flex-1">
                                  <SelectValue placeholder="Select a user" />
                                </SelectTrigger>
                                <SelectContent>
                                  {usersData?.users?.map((user: User) => (
                                    <SelectItem key={user.id} value={user.id.toString()}>
                                      {user.name} ({user.email})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button onClick={handleGrantAccess} disabled={grantAccessMutation.isPending}>
                                <UserPlus className="w-4 h-4 mr-1" />
                                Grant
                              </Button>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}