import { EmptyPage } from "@/common/components/empty-page";
import PageTitle from "@/common/components/page-title";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { DataTable } from "@/common/components/ui/data-table";
import TableSearch from "@/common/components/ui/table-search";
import { useTableFilters } from "@/common/hooks/use-table-filters";
import { formatFileSize } from "@/common/utils/disksize";
import { useMetrics } from "@/dashboard/services/hooks";
import { ColumnDef } from "@tanstack/react-table";
import { Download, File, FileText, Plus, Trash2, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import DeleteConfirmationDialog from "../components/delete-confirmation-dialog";
import { EmbeddingStatusIndicator } from "../components/embedding-status-indicator";
import UploadDialog from "../components/upload-document";
import { useEmbeddingStatus } from "../hooks/use-embedding-status";
import { documentsUrl } from "../routes";
import { useGetDocuments } from "../services/hooks";

interface Document {
  id: string;
  name: string;
  status: 'pending' | 'embedding' | 'processed' | 'failed';
  createdAt: string;
  fileSize: number;
}

const ViewAllDocumentsPage = () => {
  const navigate = useNavigate();
  const filterConfig = {
    search: "",
  };
  const { savedFilters, updateLocalFilter } = useTableFilters(filterConfig);

  const { data: documents = [], isLoading } = useGetDocuments();
  const { data: metrics, isLoading: isMetricsLoading } = useMetrics();
  
  // State for real-time document status updates
  const [documentStatuses, setDocumentStatuses] = useState<Record<string, 'pending' | 'embedding' | 'processed' | 'failed'>>({});
  
  // Use embedding status hook for general WebSocket connection (without specific document ID)
  const { socket } = useEmbeddingStatus(null);
  const queryClient = useQueryClient();

  // Listen for status updates for all documents
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (update: { documentId: string; status: 'pending' | 'embedding' | 'processed' | 'failed' }) => {
      setDocumentStatuses(prev => ({
        ...prev,
        [update.documentId]: update.status
      }));
      // When embedding finishes (processed/failed), refetch the documents list
      if (update.status === 'processed' || update.status === 'failed') {
        queryClient.invalidateQueries({ queryKey: ["documents"] });
      }
    };

    socket.on('status-update', handleStatusUpdate);

    // Subscribe to all documents when they're loaded
    documents.forEach(doc => {
      socket.emit('subscribe-document', doc.id);
    });

    return () => {
      socket.off('status-update', handleStatusUpdate);
    };
  }, [socket, documents, queryClient]);

  const previewDocument = (document: Document) => {
    navigate(documentsUrl.view(document.id));
  };

  // Filter documents based on search
  const filteredDocuments = useMemo(() => {
    if (!savedFilters.search) return documents;
    return documents.filter((doc) => doc.name.toLowerCase().includes(savedFilters.search.toLowerCase()));
  }, [documents, savedFilters.search]);

  const columns = useMemo<ColumnDef<Document>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <File className="h-4 w-4 text-primary" />
            <span className="text-sm">{row.getValue("name")}</span>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          // Use the original row data for fields that are not defined as columns
          const documentId = (row.original as Document).id;
          const realtimeStatus = documentStatuses[documentId];
          const status = realtimeStatus || row.getValue("status");
          return <EmbeddingStatusIndicator status={status} />;
        },
      },
      {
        accessorKey: "createdAt",
        header: "Modified",
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">
            {new Date(row.getValue("createdAt")).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "fileSize",
        header: "Size",
        cell: ({ row }) => (
          <span className="text-gray-500 dark:text-gray-400">{formatFileSize(row.getValue("fileSize"))}</span>
        ),
      },
    ],
    [documentStatuses]
  );

  const bulkAction = (selectedRows: Document[], clearSelection: () => void) => (
    <>
      <span className="text-sm text-muted-foreground mr-2">{selectedRows.length} selected</span>
      <DeleteConfirmationDialog
        documentIds={selectedRows.map((doc) => doc.id)}
        onSuccess={clearSelection}
        trigger={
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        }
      />
    </>
  );

  const endAction = ({ row }: { row: any }) => (
    <div className="flex items-center justify-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => {}}>
        <Download className="h-4 w-4" />
      </Button>
      <DeleteConfirmationDialog
        documentIds={[row.original.id]}
        trigger={
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );

  if (isMetricsLoading) return <></>;

  if (metrics.totalDocuments === 0) {
    return (
      <EmptyPage
        icon={<FileText className="mx-auto h-16 w-16 text-gray-400 mb-6" />}
        title="No documents found"
        description="Get started by uploading your first document."
        dialog={
          <UploadDialog>
            <Button className="flex items-center gap-2">
              <Plus size={20} />
              Upload Document
            </Button>
          </UploadDialog>
        }
      />
    );
  }

  const emptyState = (
    <div className="flex flex-col items-center justify-center py-12">
      <FileText className="mx-auto h-16 w-16 text-gray-400 mb-6" />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {savedFilters.search ? "No documents match your search" : "No documents found"}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        {savedFilters.search ? "Try adjusting your search criteria." : "Get started by uploading your first document."}
      </p>
      {!savedFilters.search && (
        <UploadDialog>
          <Button className="flex items-center gap-2">
            <Plus size={20} />
            Upload Document
          </Button>
        </UploadDialog>
      )}
    </div>
  );

  return (
    <div className="p-4 h-full w-full overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full min-h-0">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <PageTitle title="Documents" description="Manage your files and folders" />

            <div className="flex items-center gap-4">
              <TableSearch onSearch={(query) => updateLocalFilter("search", query)} debounceDelay={300} />

              <div className="flex-grow" />
              <UploadDialog>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </UploadDialog>
            </div>

            <div className="flex-1 min-h-0">
              <DataTable
                data={filteredDocuments}
                columns={columns}
                onRowClick={previewDocument}
                isLoading={isLoading}
                bulkAction={bulkAction}
                endAction={endAction}
                emptyState={emptyState}
                pagination={true}
                bordered={true}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewAllDocumentsPage;
