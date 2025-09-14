import React from 'react';
import { Document } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { 
  ArrowLeft, 
  Download, 
  FileText, 
  User, 
  Calendar, 
  Tag,
  Users,
  Building,
  DollarSign,
  CalendarDays,
  Hash
} from 'lucide-react';

interface DocumentViewerProps {
  document: Document;
  onBack: () => void;
}

export function DocumentViewer({ document, onBack }: DocumentViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      'Finance': 'bg-green-100 text-green-800',
      'HR': 'bg-blue-100 text-blue-800',
      'Legal': 'bg-purple-100 text-purple-800',
      'Contracts': 'bg-orange-100 text-orange-800',
      'Technical Reports': 'bg-cyan-100 text-cyan-800',
      'Invoices': 'bg-yellow-100 text-yellow-800',
      'Other': 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleDownload = () => {
    // In a real application, this would download the actual file
    // For demo purposes, we'll create a text file with the content
    const blob = new Blob([document.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Documents
        </Button>
        <Button onClick={handleDownload}>
          <Download className="mr-2 h-4 w-4" />
          Download
        </Button>
      </div>

      {/* Document Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-xl">{document.title}</CardTitle>
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{document.author}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(document.uploadDate)}</span>
                </div>
                <span>{formatFileSize(document.fileSize)}</span>
              </div>
            </div>
            <Badge className={getCategoryColor(document.category)}>
              {document.category}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI-Generated Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{document.summary}</p>
            </CardContent>
          </Card>

          {/* Document Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded border p-4">
                <pre className="text-sm whitespace-pre-wrap font-mono">
                  {document.content}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Metadata Sidebar */}
        <div className="space-y-6">
          {/* Basic Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Document Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Name</label>
                <p className="text-sm mt-1">{document.fileName}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">File Type</label>
                <p className="text-sm mt-1">{document.fileType}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Uploaded By</label>
                <p className="text-sm mt-1">{document.uploader}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Upload Date</label>
                <p className="text-sm mt-1">{formatDate(document.uploadDate)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Entities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extracted Entities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* People */}
              {document.metadata.entities.people.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <label className="text-sm font-medium">People</label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {document.metadata.entities.people.map((person, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {person}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations */}
              {document.metadata.entities.organizations.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="h-4 w-4 text-green-500" />
                    <label className="text-sm font-medium">Organizations</label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {document.metadata.entities.organizations.map((org, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {org}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Amounts */}
              {document.metadata.entities.amounts.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="h-4 w-4 text-yellow-500" />
                    <label className="text-sm font-medium">Amounts</label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {document.metadata.entities.amounts.map((amount, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amount}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Dates */}
              {document.metadata.entities.dates.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <CalendarDays className="h-4 w-4 text-purple-500" />
                    <label className="text-sm font-medium">Dates</label>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {document.metadata.entities.dates.map((date, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {date}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Hash className="h-4 w-4" />
                <span>Keywords</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {document.metadata.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}