/**
 * API Configuration
 * Centralized configuration for all API endpoints
 */

export const API_CONFIG = {
  // Backend API
  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL,

  // Endpoints
  LEADS: {
    CLEAN: "/api/leads/clean",
    IMPORT_AND_SAVE: "/api/leads/import-and-save",
    VALIDATE_SINGLE: "/api/leads/validate-single",
    VALIDATE_BATCH: "/api/leads/validate-batch",
  },

  HEALTH: {
    CHECK: "/api/health",
  },

  // Timeouts
  TIMEOUT_DEFAULT: 30000,
  TIMEOUT_UPLOAD: 120000, // 2 minutes for file uploads

  // Retry config
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export default API_CONFIG;
