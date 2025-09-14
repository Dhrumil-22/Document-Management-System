import React, { useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { DocumentService } from "../services/documentService";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import {
  Upload,
  File,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Info,
} from "lucide-react";
import { UploadFile, DocumentCategory } from "../types";

interface DocumentUploadProps {
  onUploadComplete?: () => void;
}

interface DocumentDetails {
  title: string;
  author: string;
  category: DocumentCategory | "";
  date: string;
}

interface FileWithDetails extends UploadFile {
  details?: DocumentDetails;
  showDetailsForm?: boolean;
}

export function DocumentUpload({
  onUploadComplete,
}: DocumentUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<
    FileWithDetails[]
  >([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const { user } = useAuth();

  const getDefaultDetails = (
    fileName: string,
  ): DocumentDetails => ({
    title: fileName.replace(/\.[^/.]+$/, ""), // Remove file extension
    author: user?.username || "Unknown",
    category: "",
    date: new Date().toISOString().split("T")[0], // Today's date
  });

  const handleFileSelect = useCallback(
    (files: FileList) => {
      const newFiles: FileWithDetails[] = Array.from(files).map(
        (file) => ({
          file,
          progress: 0,
          status: "pending",
          details: getDefaultDetails(file.name),
          showDetailsForm: true,
        }),
      );

      setUploadFiles((prev) => [...prev, ...newFiles]);
    },
    [user],
  );

  const processFile = async (uploadFile: FileWithDetails) => {
    if (!uploadFile.details) return;

    try {
      // Update status to uploading
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file
            ? {
                ...f,
                status: "uploading",
                progress: 25,
                showDetailsForm: false,
              }
            : f,
        ),
      );

      // Read file content
      const content = await readFileContent(uploadFile.file);

      // Update progress to processing
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file
            ? { ...f, status: "processing", progress: 50 }
            : f,
        ),
      );

      // Simulate AI processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Add document to service with additional details
      await DocumentService.addDocumentWithDetails(
        uploadFile.file,
        content,
        user!,
        uploadFile.details,
      );

      // Mark as completed
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file
            ? { ...f, status: "completed", progress: 100 }
            : f,
        ),
      );
    } catch (error) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.file === uploadFile.file
            ? {
                ...f,
                status: "error",
                error:
                  error instanceof Error
                    ? error.message
                    : "Upload failed",
              }
            : f,
        ),
      );
    }

    // Call callback after processing
    setTimeout(() => {
      onUploadComplete?.();
    }, 1000);
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;

        if (file.type === "application/pdf") {
          // For PDF files, we'd normally use a PDF parser
          // Here we'll simulate with placeholder content
          resolve(
            `PDF Document: ${file.name}\n\nThis is a simulated extraction of PDF content. In a real implementation, this would use a PDF parsing library like pdf-parse or PDF.js to extract the actual text content from the PDF file.`,
          );
        } else {
          resolve(content);
        }
      };

      reader.onerror = () =>
        reject(new Error("Failed to read file"));

      if (file.type === "application/pdf") {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFileSelect(files);
      }
    },
    [handleFileSelect],
  );

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const clearCompleted = () => {
    setUploadFiles((prev) =>
      prev.filter((f) => f.status !== "completed"),
    );
  };

  const updateFileDetails = (
    file: File,
    updates: Partial<DocumentDetails>,
  ) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.file === file
          ? { ...f, details: { ...f.details!, ...updates } }
          : f,
      ),
    );
  };

  const removeFile = (file: File) => {
    setUploadFiles((prev) =>
      prev.filter((f) => f.file !== file),
    );
  };

  const startProcessing = (uploadFile: FileWithDetails) => {
    processFile(uploadFile);
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return (
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
        );
      case "completed":
        return (
          <CheckCircle className="h-4 w-4 text-green-500" />
        );
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <File className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: UploadFile["status"]) => {
    switch (status) {
      case "uploading":
        return "Uploading...";
      case "processing":
        return "Processing with AI...";
      case "completed":
        return "Completed";
      case "error":
        return "Error";
      default:
        return "Pending";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Upload className="h-5 w-5" />
          <span>Upload Documents</span>
        </CardTitle>
        <CardDescription>
          Upload PDF, DOCX, or TXT files for AI-powered
          classification and indexing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-gray-400"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg mb-2">
            Drag and drop files here
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            or
          </p>
          <Button
            variant="outline"
            onClick={() =>
              document.getElementById("file-upload")?.click()
            }
          >
            Browse Files
          </Button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: PDF, DOCX, TXT (Max 10MB per
            file)
          </p>
        </div>

        {/* File Details Forms and Upload Progress */}
        {uploadFiles.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">
                Document Details & Upload Progress
              </h4>
              {uploadFiles.some(
                (f) => f.status === "completed",
              ) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCompleted}
                >
                  Clear Completed
                </Button>
              )}
            </div>

            {uploadFiles.map((uploadFile, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(uploadFile.status)}
                      <div>
                        <h5 className="font-medium">
                          {uploadFile.file.name}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {(
                            uploadFile.file.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB •{" "}
                          {getStatusText(uploadFile.status)}
                        </p>
                      </div>
                    </div>
                    {uploadFile.status === "pending" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          removeFile(uploadFile.file)
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {uploadFile.showDetailsForm &&
                    uploadFile.details && (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <Info className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            Document Information
                          </span>
                        </div>

                        {/* Simple Form with 4 Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`title-${index}`}>
                              Document Title *
                            </Label>
                            <Input
                              id={`title-${index}`}
                              value={uploadFile.details.title}
                              onChange={(e) =>
                                updateFileDetails(
                                  uploadFile.file,
                                  { title: e.target.value },
                                )
                              }
                              placeholder="Enter document title"
                            />
                          </div>

                          <div>
                            <Label htmlFor={`author-${index}`}>
                              Author
                            </Label>
                            <Input
                              id={`author-${index}`}
                              value={uploadFile.details.author}
                              onChange={(e) =>
                                updateFileDetails(
                                  uploadFile.file,
                                  { author: e.target.value },
                                )
                              }
                              placeholder="Enter author name"
                            />
                          </div>

                          <div>
                            <Label
                              htmlFor={`category-${index}`}
                            >
                              Category *
                            </Label>
                            <Select
                              value={
                                uploadFile.details.category
                              }
                              onValueChange={(
                                value: DocumentCategory,
                              ) =>
                                updateFileDetails(
                                  uploadFile.file,
                                  { category: value },
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Finance">
                                  Finance
                                </SelectItem>
                                <SelectItem value="HR">
                                  HR
                                </SelectItem>
                                <SelectItem value="Legal">
                                  Legal
                                </SelectItem>
                                <SelectItem value="Contracts">
                                  Contracts
                                </SelectItem>
                                <SelectItem value="Technical Reports">
                                  Technical Reports
                                </SelectItem>
                                <SelectItem value="Invoices">
                                  Invoices
                                </SelectItem>
                                <SelectItem value="Other">
                                  Other
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor={`date-${index}`}>
                              Date
                            </Label>
                            <Input
                              id={`date-${index}`}
                              type="date"
                              value={uploadFile.details.date}
                              onChange={(e) =>
                                updateFileDetails(
                                  uploadFile.file,
                                  { date: e.target.value },
                                )
                              }
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() =>
                              removeFile(uploadFile.file)
                            }
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={() =>
                              startProcessing(uploadFile)
                            }
                            disabled={
                              !uploadFile.details.title ||
                              !uploadFile.details.category
                            }
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* Progress Bar */}
                  {uploadFile.status !== "pending" &&
                    uploadFile.status !== "completed" &&
                    uploadFile.status !== "error" && (
                      <Progress
                        value={uploadFile.progress}
                        className="h-2"
                      />
                    )}

                  {uploadFile.error && (
                    <Alert variant="destructive">
                      <AlertDescription className="text-xs">
                        {uploadFile.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Info */}
        <Alert>
          <AlertDescription className="text-sm">
            <strong>Document Upload:</strong> Provide basic
            information about your documents. AI will analyze
            content for entity extraction, summarization, and
            semantic search optimization.
          </AlertDescription>
        </Alert>

        <Alert>
          <AlertDescription className="text-xs text-muted-foreground">
            <strong>Required Fields:</strong> Title and Category
            are required for document organization and
            searchability.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}