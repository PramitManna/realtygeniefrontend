// Session-only step completion service with validation - no persistence
// Steps reset on page reload, users navigate manually or use done buttons for linear progression

import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export class StepCompletionService {
  // In-memory storage for current session
  private static completedSteps: Set<string> = new Set();

  // Validate if step requirements are met
  static async validateStep(stepName: string): Promise<{ valid: boolean; message: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { valid: false, message: 'User not authenticated' };
      }

      switch (stepName) {
        case 'create-batch':
          const { data: batches, error: batchError } = await supabase
            .from('batches')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (batchError) {
            return { valid: false, message: 'Error checking batches' };
          }
          
          if (!batches || batches.length === 0) {
            return { valid: false, message: 'Please create at least one batch first' };
          }
          
          return { valid: true, message: 'Batch created successfully!' };

        case 'import-leads':
          const { data: leads, error: leadsError } = await supabase
            .from('leads')
            .select('id')
            .eq('user_id', user.id)
            .limit(1);
          
          if (leadsError) {
            return { valid: false, message: 'Error checking leads' };
          }
          
          if (!leads || leads.length === 0) {
            return { valid: false, message: 'Please import at least one lead first' };
          }
          
          return { valid: true, message: 'Leads imported successfully!' };

        case 'setup-automations':
          // No validation needed for final step
          return { valid: true, message: 'Automation setup completed!' };

        default:
          return { valid: true, message: 'Step completed!' };
      }
    } catch (error) {
      console.error('Error validating step:', error);
      return { valid: false, message: 'Validation failed' };
    }
  }

  // Mark a step as completed for current session only
  static async completeStep(stepName: string): Promise<{ success: boolean; message: string }> {
    try {
      // Validate step requirements first
      const validation = await this.validateStep(stepName);
      
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }
      
      this.completedSteps.add(stepName);
      return { success: true, message: validation.message };
    } catch (error) {
      console.error('Error completing step:', error);
      return { success: false, message: 'Failed to complete step' };
    }
  }

  // Get all completed steps for current session
  static async getCompletedSteps(): Promise<string[]> {
    return Array.from(this.completedSteps);
  }

  // Check if a specific step is completed in current session
  static async isStepCompleted(stepName: string): Promise<boolean> {
    return this.completedSteps.has(stepName);
  }

  // Mark a step as incomplete (remove from current session)
  static async uncompleteStep(stepName: string): Promise<boolean> {
    try {
      this.completedSteps.delete(stepName);
      return true;
    } catch (error) {
      console.error('Error uncompleting step:', error);
      return false;
    }
  }

  // Reset all steps (useful for testing or manual reset)
  static resetAllSteps(): void {
    this.completedSteps.clear();
  }
}