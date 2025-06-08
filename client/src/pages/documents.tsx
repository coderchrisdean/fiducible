import { useState } from 'react';
import { useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DocumentUpload } from '@/components/document-upload';
import { DocumentList } from '@/components/document-list';
import { Upload, Search, FolderPlus, Filter } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

export default function Documents() {
  const { caseId } = useParams<{ caseId: string }>();
  const [showUpload, setShowUpload] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<number | undefined>();

  const caseIdNum = parseInt(caseId || '0');

  // Fetch case details for breadcrumb
  const { data: caseData } = useQuery({
    queryKey: ['/api/cases', caseIdNum],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseIdNum}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch case');
      return response.json();
    },
    enabled: !!caseIdNum
  });

  if (!caseIdNum) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-destructive">Invalid case ID</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Documents</h1>
          {caseData && (
            <p className="text-muted-foreground">
              Case: {caseData.name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Documents
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Upload Documents</DialogTitle>
              </DialogHeader>
              <DocumentUpload
                caseId={caseIdNum}
                folderId={selectedFolder}
                onUploadComplete={() => setShowUpload(false)}
                onClose={() => setShowUpload(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Quick Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Quick Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search across all documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Document Management */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Folders</CardTitle>
                <Button variant="ghost" size="sm">
                  <FolderPlus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={selectedFolder === undefined ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFolder(undefined)}
              >
                All Documents
              </Button>
              <Button
                variant={selectedFolder === null ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedFolder(undefined)}
              >
                📁 Root Folder
              </Button>
              {/* TODO: Add dynamic folder list */}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Documents</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Size</span>
                <span className="font-medium">--</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Recent Uploads</span>
                <span className="font-medium">--</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Document List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList
                caseId={caseIdNum}
                folderId={selectedFolder}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}