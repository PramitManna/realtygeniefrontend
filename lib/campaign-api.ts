import { createClient } from "@/utils/supabase/client";

interface CampaignCreatePayload {
  name: string;
  description: string;
  batch_id: string;
  email_template: string;
  tones: string[];
  objective: string;
}

interface CampaignUpdatePayload {
  name?: string;
  description?: string;
  status?: string;
  tones?: string[];
  objective?: string;
}

const supabase = createClient();

export const campaignApi = {
  /**
   * Create a new campaign
   */
  async createCampaign(
    userId: string,
    payload: CampaignCreatePayload
  ): Promise<{
    success: boolean;
    campaign?: any;
    error?: string;
  }> {
    try {
      // Get leads count for this batch
      const { data: leadsData, error: leadsError } = await supabase
        .from("leads")
        .select("id", { count: "exact" })
        .eq("batch_id", payload.batch_id)
        .eq("user_id", userId);

      if (leadsError) throw leadsError;

      const totalRecipients = leadsData?.length || 0;

      if (totalRecipients === 0) {
        return {
          success: false,
          error: "No leads in this batch. Please add leads before creating a campaign.",
        };
      }

      // Create campaign
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .insert([
          {
            user_id: userId,
            batch_id: payload.batch_id,
            name: payload.name,
            description: payload.description,
            email_template: payload.email_template,
            tones: payload.tones,
            objective: payload.objective,
            total_recipients: totalRecipients,
            status: "draft",
          },
        ])
        .select()
        .single();

      if (campaignError) throw campaignError;

      return {
        success: true,
        campaign: campaignData,
      };
    } catch (error) {
      console.error("Error creating campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create campaign",
      };
    }
  },

  /**
   * Get all campaigns for a user
   */
  async getCampaigns(userId: string): Promise<{
    success: boolean;
    campaigns?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          *,
          batches:batch_id(id, name, lead_count)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return {
        success: true,
        campaigns: data || [],
      };
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch campaigns",
      };
    }
  },

  /**
   * Get campaign by ID with detailed stats
   */
  async getCampaignDetails(campaignId: string): Promise<{
    success: boolean;
    campaign?: any;
    stats?: any;
    recipients?: any[];
    error?: string;
  }> {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Get campaign stats
      const { data: stats, error: statsError } = await supabase
        .from("campaign_stats")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("date", { ascending: false });

      if (statsError) throw statsError;

      // Get recipient status breakdown
      const { data: recipients, error: recipientsError } = await supabase
        .from("campaign_recipients")
        .select("status")
        .eq("campaign_id", campaignId);

      if (recipientsError) throw recipientsError;

      return {
        success: true,
        campaign,
        stats,
        recipients,
      };
    } catch (error) {
      console.error("Error fetching campaign details:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch campaign details",
      };
    }
  },

  /**
   * Update campaign
   */
  async updateCampaign(
    campaignId: string,
    userId: string,
    payload: CampaignUpdatePayload
  ): Promise<{
    success: boolean;
    campaign?: any;
    error?: string;
  }> {
    try {
      // Verify user owns this campaign
      const { data: existing, error: verifyError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

      if (verifyError || !existing) {
        return {
          success: false,
          error: "Campaign not found or access denied",
        };
      }

      const { data, error } = await supabase
        .from("campaigns")
        .update(payload)
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        campaign: data,
      };
    } catch (error) {
      console.error("Error updating campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update campaign",
      };
    }
  },

  /**
   * Delete campaign
   */
  async deleteCampaign(campaignId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Verify user owns this campaign
      const { data: existing, error: verifyError } = await supabase
        .from("campaigns")
        .select("id")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

      if (verifyError || !existing) {
        return {
          success: false,
          error: "Campaign not found or access denied",
        };
      }

      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaignId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete campaign",
      };
    }
  },

  /**
   * Duplicate a campaign
   */
  async duplicateCampaign(
    campaignId: string,
    userId: string
  ): Promise<{
    success: boolean;
    campaign?: any;
    error?: string;
  }> {
    try {
      // Get original campaign
      const { data: original, error: fetchError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !original) {
        return {
          success: false,
          error: "Campaign not found or access denied",
        };
      }

      // Create duplicate
      const newCampaign = {
        ...original,
        id: undefined,
        name: `${original.name} (Copy)`,
        status: "draft",
        emails_sent: 0,
        open_rate: 0,
        click_rate: 0,
        response_rate: 0,
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: duplicated, error: createError } = await supabase
        .from("campaigns")
        .insert([newCampaign])
        .select()
        .single();

      if (createError) throw createError;

      // Duplicate campaign recipients
      const { data: originalRecipients, error: recipientsError } = await supabase
        .from("campaign_recipients")
        .select("*")
        .eq("campaign_id", campaignId);

      if (recipientsError) throw recipientsError;

      const newRecipients = originalRecipients?.map((r) => ({
        ...r,
        id: undefined,
        campaign_id: duplicated.id,
        status: "pending",
        sent_at: null,
        opened_at: null,
        clicked_at: null,
        responded_at: null,
        created_at: new Date().toISOString(),
      })) || [];

      if (newRecipients.length > 0) {
        const { error: insertError } = await supabase
          .from("campaign_recipients")
          .insert(newRecipients);

        if (insertError) throw insertError;
      }

      return {
        success: true,
        campaign: duplicated,
      };
    } catch (error) {
      console.error("Error duplicating campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to duplicate campaign",
      };
    }
  },

  /**
   * Send campaign (would integrate with email service)
   */
  async sendCampaign(campaignId: string, userId: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> {
    try {
      // Verify campaign exists and belongs to user
      const { data: campaign, error: fetchError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .eq("user_id", userId)
        .single();

      if (fetchError || !campaign) {
        return {
          success: false,
          error: "Campaign not found or access denied",
        };
      }

      // Update campaign status to active
      const { error: updateError } = await supabase
        .from("campaigns")
        .update({
          status: "active",
          sent_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      if (updateError) throw updateError;

      // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
      // This would update campaign_recipients status to 'sent'

      return {
        success: true,
        message: "Campaign sent successfully",
      };
    } catch (error) {
      console.error("Error sending campaign:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send campaign",
      };
    }
  },
};

export default campaignApi;
