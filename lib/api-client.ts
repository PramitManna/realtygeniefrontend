/**
 * API Client for RealtyGenie Backend
 * Handles all API calls to the backend server
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Type definitions
export interface DashboardOverview {
  total_leads: number;
  active_campaigns: number;
  response_rate: number;
  conversion_rate: number;
  avg_response_time: number;
  leads_this_month: number;
  leads_this_week: number;
  campaigns_status: {
    active: number;
    paused: number;
    completed: number;
    pending: number;
  };
  recent_activities: Activity[];
  metrics_trend: {
    week_over_week: number;
    month_over_month: number;
    top_performing_campaign: string;
    weakest_campaign: string;
  };
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
}

export interface DashboardMetrics {
  daily_leads: Array<{ date: string; count: number }>;
  response_by_segment: Array<{ segment: string; responses: number; rate: number }>;
  campaign_performance: Array<{
    name: string;
    sent: number;
    opened: number;
    clicked: number;
    converted: number;
  }>;
}

export interface CampaignStats {
  campaign_id: string;
  name: string;
  status: string;
  created_at: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  total_converted: number;
  open_rate: number;
  click_rate: number;
  conversion_rate: number;
  bounce_rate: number;
  unsubscribe_rate: number;
  segments: Array<{ name: string; sent: number; opened: number; converted: number }>;
}

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  throw new Error(error.message || 'An error occurred while fetching data');
};

/**
 * Fetch dashboard overview data
 * @param userEmail - User's email address
 * @returns Dashboard overview data
 */
export const fetchDashboardOverview = async (userEmail: string): Promise<DashboardOverview> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lead-nurture/dashboard/overview?email=${encodeURIComponent(userEmail)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardOverview = await response.json();
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetch dashboard metrics (charts data)
 * @param userEmail - User's email address
 * @returns Dashboard metrics for charts
 */
export const fetchDashboardMetrics = async (userEmail: string): Promise<DashboardMetrics> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lead-nurture/dashboard/metrics?email=${encodeURIComponent(userEmail)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DashboardMetrics = await response.json();
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetch stats for a specific campaign
 * @param campaignId - Campaign ID
 * @returns Campaign statistics
 */
export const fetchCampaignStats = async (campaignId: string): Promise<CampaignStats> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lead-nurture/dashboard/campaign-stats`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaign_id: campaignId }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: CampaignStats = await response.json();
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Check lead nurture tool status
 * @returns Tool status
 */
export const checkLeadNurtureStatus = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/lead-nurture/status`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Generic fetch function for any backend endpoint
 * @param endpoint - API endpoint (without base URL)
 * @param options - Fetch options
 * @returns Response data
 */
export const apiCall = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: T = await response.json();
    return data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};
