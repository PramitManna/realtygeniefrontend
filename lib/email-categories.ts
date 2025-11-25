// frontend/lib/email-categories.ts

export const EMAIL_CATEGORIES = {
  // Month 1: High Engagement (Days 0, 5, 10, 16, 22)
  MONTH_1: [
    {
      id: 'introduction',
      name: 'Introduction Email',
      prompt: 'Create a warm introduction email that establishes credibility and sets expectations for future communication. Introduce yourself as a real estate professional, highlight your expertise in {{city}}, and explain the value you provide.',
      send_day: 0,
      order: 1,
    },
    {
      id: 'market_insight',
      name: 'Market Insight',
      prompt: 'Provide current market trends and data specific to {{city}} real estate market. Include {{market_trend}} statistics, recent sales data showing {{property_count}} transactions, and what this means for buyers/sellers/investors.',
      send_day: 5,
      order: 2,
    },
    {
      id: 'education_process',
      name: 'Education / Process',
      prompt: 'Educate leads about the buying/selling/investing process with actionable tips. Break down the step-by-step process, common mistakes to avoid, and insider tips that demonstrate your expertise.',
      send_day: 10,
      order: 3,
    },
    {
      id: 'value_offer',
      name: 'Value Offer',
      prompt: 'Present a specific value proposition or exclusive opportunity. Offer a free market analysis, exclusive listing preview, or personalized consultation. Make it time-sensitive to encourage action.',
      send_day: 16,
      order: 4,
    },
    {
      id: 'case_study',
      name: 'Case Study / Credibility',
      prompt: 'Share a success story or case study demonstrating your expertise and results. Tell a compelling story about how you helped a client in {{city}}, including specific numbers and outcomes.',
      send_day: 22,
      order: 5,
    },
  ],
  
  // Months 2-12: Ongoing Nurture (2 emails per month)
  ONGOING: [
    {
      id: 'market_snapshot',
      name: 'Monthly Market Snapshot',
      prompt: 'Provide monthly market update with stats, trends, and predictions for {{city}}. Include year-over-year comparisons, neighborhood spotlights, and what the data means for different buyer/seller personas.',
      frequency: 'monthly', // Sent on day 0 of each month
      order: 1,
    },
    {
      id: 'educational_value',
      name: 'Educational Value Content',
      prompt: 'Share educational content about investing, financing, ROI, selling tips, or market strategies. Provide actionable advice that positions you as a trusted advisor, not just a salesperson.',
      frequency: 'monthly', // Sent on day 15 of each month
      order: 2,
    },
  ],
};

// Helper to get all Month 1 categories
export const getMonth1Categories = () => EMAIL_CATEGORIES.MONTH_1;

// Helper to get ongoing categories
export const getOngoingCategories = () => EMAIL_CATEGORIES.ONGOING;

// Helper to calculate send schedule for 13 months
export const calculateSendSchedule = () => {
  const schedule = [];
  
  // Month 1: 5 emails
  EMAIL_CATEGORIES.MONTH_1.forEach(cat => {
    schedule.push({
      category_id: cat.id,
      category_name: cat.name,
      send_day: cat.send_day,
      month: 1,
    });
  });
  
  // Months 2-12: 2 emails per month
  for (let month = 2; month <= 12; month++) {
    const baseDay = 30 + ((month - 2) * 30); // Start from day 30
    
    // Email A: Market snapshot
    schedule.push({
      category_id: 'market_snapshot',
      category_name: 'Monthly Market Snapshot',
      send_day: baseDay,
      month,
    });
    
    // Email B: Educational value (15 days later)
    schedule.push({
      category_id: 'educational_value',
      category_name: 'Educational Value Content',
      send_day: baseDay + 15,
      month,
    });
  }
  
  return schedule; // 27 emails total
};