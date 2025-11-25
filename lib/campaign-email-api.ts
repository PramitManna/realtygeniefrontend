import API_CONFIG from './api-config';

const API_BASE_URL = API_CONFIG.BACKEND_URL;

export interface EmailCategory {
  id: string;
  name: string;
  prompt: string;
  send_day: number;
  order: number;
}

export interface GeneratedEmail {
  category_id: string;
  category_name: string;
  subject: string;
  body: string;
  send_day: number;
  order: number;
  month_phase: string;
  month_number: number;
}

export interface SavedEmail extends GeneratedEmail {
  id: string;
  campaign_id: string;
  scheduled_send_date: string;
  status: 'draft' | 'approved' | 'queued' | 'sending' | 'sent' | 'failed';
  created_at: string;
}

export const campaignEmailApi = {
  /**
   * Generate 5 Month 1 emails using AI
   * Returns draft emails for review (not saved to DB yet)
   */
  async generateMonth1Emails(
    campaignId: string,
    campaignName: string,
    tone: string,
    objective: string,
    targetCity?: string
  ): Promise<GeneratedEmail[]> {
    const response = await fetch(`${API_BASE_URL}/api/campaign-emails/generate-month-1`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        campaign_name: campaignName,
        tone,
        objective,
        target_city: targetCity || 'your market',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate emails');
    }

    const data = await response.json();
    return data.emails;
  },

  /**
   * Save user-approved emails to database with scheduled send dates
   */
  async saveApprovedEmails(
    campaignId: string,
    userId: string,
    emails: GeneratedEmail[],
    campaignStartDate?: Date
  ): Promise<{ success: boolean; emails_saved: number }> {
    const response = await fetch(`${API_BASE_URL}/api/campaign-emails/save-approved`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_id: campaignId,
        user_id: userId,
        emails,
        campaign_start_date: campaignStartDate?.toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to save emails');
    }

    return await response.json();
  },

  /**
   * Get all emails for a campaign
   */
  async getCampaignEmails(campaignId: string): Promise<SavedEmail[]> {
    const response = await fetch(`${API_BASE_URL}/api/campaign-emails/campaign/${campaignId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to fetch campaign emails');
    }

    const data = await response.json();
    return data.emails;
  },

  /**
   * Update an email's subject or body
   */
  async updateEmail(
    emailId: string,
    updates: { subject?: string; body?: string }
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/campaign-emails/email/${emailId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update email');
    }
  },

  /**
   * Regenerate a single email using AI
   */
  async regenerateEmail(
    emailId: string,
    campaignName: string,
    tone: string,
    objective: string,
    targetCity: string
  ): Promise<{ subject: string; body: string }> {
    const response = await fetch(`${API_BASE_URL}/api/campaign-emails/email/${emailId}/regenerate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaign_name: campaignName,
        tone,
        objective,
        target_city: targetCity,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to regenerate email');
    }

    return await response.json();
  },

  /**
   * Delete a campaign email
   */
  async deleteEmail(emailId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/campaign-emails/email/${emailId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete email');
    }
  },
};
