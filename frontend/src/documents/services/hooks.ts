import { dashboardKeys, useDashboardCache } from "@/dashboard/services/hooks";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { documentsApi } from "./api";

const DOCUMENTS_KEY = "documents";

// Queries
export const useGetDocuments = () => {
  return useQuery({
    queryKey: [DOCUMENTS_KEY],
    queryFn: documentsApi.getAll,
  });
};

export const useGetDocument = (id: string) => {
  return useQuery({
    queryKey: [DOCUMENTS_KEY, id],
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
};

// Mutations
export const useUploadDocument = () => {
  const queryClient = useQueryClient();
  const { incrementDocuments } = useDashboardCache();

  return useMutation({
    mutationFn: documentsApi.upload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      // Optimistically update dashboard metrics instead of refetching
      incrementDocuments();
    },
  });
};

export const useUploadMultipleDocuments = () => {
  const queryClient = useQueryClient();
  const { updateMetricsCache } = useDashboardCache();

  return useMutation({
    mutationFn: documentsApi.uploadMultiple,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      // Update metrics based on number of uploaded documents
      const uploadCount = Array.isArray(data) ? data.length : 1;
      updateMetricsCache({
        totalDocuments: (queryClient.getQueryData(dashboardKeys.metrics) as any)?.totalDocuments + uploadCount,
      });
    },
  });
};

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const { decrementDocuments } = useDashboardCache();

  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map((id) => documentsApi.delete(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DOCUMENTS_KEY] });
      // Optimistically update dashboard metrics instead of refetching
      decrementDocuments();
    },
  });
};
