import { apiClient } from "@/lib/api-client";
import { Workshop } from "@/types";

export const workshopService = {
  getAll: (params?: { category?: string; level?: string }) => {
    return apiClient<Workshop[]>("/workshops", { params });
  },

  getById: (id: string) => {
    return apiClient<Workshop>(`/workshops/${id}`);
  },

  create: (data: Partial<Workshop>) => {
    return apiClient<Workshop>("/workshops", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
