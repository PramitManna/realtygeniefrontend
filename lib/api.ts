import axios, { AxiosInstance, AxiosError } from "axios";

// API base URLs
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface CleanedLeadsResponse {
  original_count: number;
  cleaned_count: number;
  invalid_emails: number;
  duplicates_removed: number;
  empty_rows: number;
  cleaned_leads: Array<{
    email: string;
    name?: string;
    phone?: string;
    address?: string;
  }>;
}

interface ImportAndSaveResponse {
  success: boolean;
  message: string;
  stats: {
    original_count: number;
    cleaned_count: number;
    invalid_emails: number;
    duplicates_removed: number;
    empty_rows: number;
    inserted: number;
  };
  inserted_leads: Array<{
    email: string;
    name?: string;
    phone?: string;
    address?: string;
  }>;
}

// Create axios instance for backend
const backendApi: AxiosInstance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Error handler
const handleApiError = (error: AxiosError): string => {
  if (error.response?.data) {
    const data = error.response.data as any;
    return data.detail || data.message || "An error occurred";
  }
  return error.message || "An unknown error occurred";
};

// ==================== LEADS API ====================

export const leadsApi = {
  /**
   * Clean leads from file without saving to database
   * Used for preview before import
   */
  async cleanLeads(file: File, batchId: string): Promise<CleanedLeadsResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch_id", batchId);

      const response = await backendApi.post<CleanedLeadsResponse>(
        "/api/leads/clean",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Clean leads from file AND save to Supabase
   * Full import flow - uses batch's personas for persona assignment
   */
  async importAndSaveLeads(
    file: File,
    batchId: string,
    userId: string,
    userToken?: string
  ): Promise<ImportAndSaveResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch_id", batchId);
      formData.append("user_id", userId);
      
      // Add JWT token if provided (for authenticated operations)
      if (userToken) {
        formData.append("user_token", userToken);
      }

      const response = await backendApi.post<ImportAndSaveResponse>(
        "/api/leads/import-and-save",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Import leads from Google Sheets URL
   * Converts public Google Sheet to CSV and imports
   * Uses batch's personas for persona assignment
   */
  async importFromGoogleSheets(
    sheetUrl: string,
    batchId: string,
    userId: string,
    userToken?: string
  ): Promise<ImportAndSaveResponse> {
    try {
      const formData = new FormData();
      formData.append("sheet_url", sheetUrl);
      formData.append("batch_id", batchId);
      formData.append("user_id", userId);
      
      if (userToken) {
        formData.append("user_token", userToken);
      }

      const response = await backendApi.post<ImportAndSaveResponse>(
        "/api/leads/import-from-url",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Import leads from photo/document using AI
   * Uses Google Vision API + Gemini to extract contact info
   * Supports JPG, PNG, PDF formats
   */
  async importFromPhoto(
    file: File,
    batchId: string,
    userId: string,
    userToken?: string
  ): Promise<ImportAndSaveResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batch_id", batchId);
      formData.append("user_id", userId);
      
      if (userToken) {
        formData.append("user_token", userToken);
      }

      const response = await backendApi.post<ImportAndSaveResponse>(
        "/api/leads/import-from-photo",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Validate a single email
   */
  async validateEmail(email: string): Promise<{
    email: string;
    is_valid: boolean;
    cleaned_email?: string;
  }> {
    try {
      const response = await backendApi.post("/api/leads/validate-single", null, {
        params: { email },
      });
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Validate batch of leads
   */
  async validateBatch(leads: any[]): Promise<CleanedLeadsResponse> {
    try {
      const response = await backendApi.post<CleanedLeadsResponse>(
        "/api/leads/validate-batch",
        { leads }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Update a lead
   */
  async updateLead(
    leadId: string,
    userId: string,
    updates: {
      email?: string;
      name?: string;
      phone?: string;
      address?: string;
    }
  ): Promise<{ success: boolean; message: string; lead_id: string; data: any }> {
    try {
      const params = new URLSearchParams();
      params.append("user_id", userId);
      if (updates.email) params.append("email", updates.email);
      if (updates.name) params.append("name", updates.name);
      if (updates.phone) params.append("phone", updates.phone);
      if (updates.address) params.append("address", updates.address);

      const response = await backendApi.put(
        `/api/leads/${leadId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Delete a lead
   */
  async deleteLead(
    leadId: string,
    userId: string
  ): Promise<{ success: boolean; message: string; lead_id: string; batch_id: string }> {
    try {
      const params = new URLSearchParams();
      params.append("user_id", userId);

      const response = await backendApi.delete(
        `/api/leads/${leadId}?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Add a single lead manually
   */
  async addSingleLead(
    email: string,
    batchId: string,
    userId: string,
    name?: string,
    phone?: string,
    address?: string
  ): Promise<{ success: boolean; message: string; lead: any }> {
    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("batch_id", batchId);
      formData.append("user_id", userId);
      if (name) formData.append("name", name);
      if (phone) formData.append("phone", phone);
      if (address) formData.append("address", address);

      const response = await backendApi.post(
        "/api/leads/add-single",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// ==================== BATCHES API ====================

export const batchesApi = {
  /**
   * Update batch metadata
   */
  async updateBatch(
    batchId: string,
    userId: string,
    updates: {
      name?: string;
      objective?: string;
      tone_override?: string;
      schedule_cadence?: string;
    }
  ): Promise<{ success: boolean; message: string; batch_id: string; data: any }> {
    try {
      const params = new URLSearchParams();
      params.append("user_id", userId);

      const response = await backendApi.put(
        `/api/batches/${batchId}?${params.toString()}`,
        updates
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },

  /**
   * Get user's communication tones from profile
   */
  async getUserTones(userId: string): Promise<{ tones: string[] }> {
    try {
      const response = await backendApi.get<{ tones: string[] }>(
        `/api/batches/user-tones/${userId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// ==================== HEALTH API ====================

export const healthApi = {
  /**
   * Check if backend is running
   */
  async checkHealth(): Promise<{
    status: string;
    timestamp: string;
    service: string;
  }> {
    try {
      const response = await backendApi.get("/api/health");
      return response.data;
    } catch (error) {
      throw new Error(handleApiError(error as AxiosError));
    }
  },
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if backend is accessible
 */
export async function isBackendAvailable(): Promise<boolean> {
  try {
    await healthApi.checkHealth();
    return true;
  } catch {
    return false;
  }
}

export default {
  leads: leadsApi,
  batches: batchesApi,
  health: healthApi,
  backendApi,
};
