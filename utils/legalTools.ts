
import { differenceInDays, addYears, addDays, format, isValid, parseISO } from 'date-fns';

export interface LimitationRule {
  id: string;
  label: string;
  article: string; // Article from Limitation Act 1963
  periodYears: number;
  periodDays: number;
  description: string;
}

export const LIMITATION_RULES: LimitationRule[] = [
  { 
    id: 'civil_suit_money', 
    label: 'Civil Suit (Recovery of Money)', 
    article: 'Article 19-25', 
    periodYears: 3, 
    periodDays: 0, 
    description: 'For money lent, breach of contract, or accounts.' 
  },
  { 
    id: 'appeal_hc_civil', 
    label: 'Appeal to High Court (Civil)', 
    article: 'Article 116(a)', 
    periodYears: 0, 
    periodDays: 90, 
    description: 'Under Code of Civil Procedure, 1908.' 
  },
  { 
    id: 'appeal_other_civil', 
    label: 'Appeal to Other Court (Civil)', 
    article: 'Article 116(b)', 
    periodYears: 0, 
    periodDays: 30, 
    description: 'Appeal to District Judge or subordinate courts.' 
  },
  { 
    id: 'specific_performance', 
    label: 'Specific Performance of Contract', 
    article: 'Article 54', 
    periodYears: 3, 
    periodDays: 0, 
    description: 'From the date fixed for performance, or when plaintiff has notice that performance is refused.' 
  },
  { 
    id: 'possession_immovable', 
    label: 'Possession of Immovable Property', 
    article: 'Article 65', 
    periodYears: 12, 
    periodDays: 0, 
    description: 'Based on title (Adverse Possession).' 
  },
  { 
    id: 'execution_decree', 
    label: 'Execution of Decree/Order', 
    article: 'Article 136', 
    periodYears: 12, 
    periodDays: 0, 
    description: 'Execution of any decree (other than mandatory injunction) or order of any Civil Court.' 
  },
  { 
    id: 'review_judgment', 
    label: 'Review of Judgment', 
    article: 'Article 124', 
    periodYears: 0, 
    periodDays: 30, 
    description: 'Review of judgment by a court other than the Supreme Court.' 
  },
  { 
    id: 'revision', 
    label: 'Revision (Civil)', 
    article: 'Article 131', 
    periodYears: 0, 
    periodDays: 90, 
    description: 'To the High Court for exercise of its revisional powers.' 
  },
  { 
    id: 'consumer_complaint', 
    label: 'Consumer Complaint', 
    article: 'Sec 69 CPA, 2019', 
    periodYears: 2, 
    periodDays: 0, 
    description: 'From the date on which the cause of action arises.' 
  },
  { 
    id: 'cheque_bounce', 
    label: 'Cheque Bounce (Complaint)', 
    article: 'NI Act Sec 142', 
    periodYears: 0, 
    periodDays: 30, // Technically 30 days from expiry of 15 day notice
    description: '30 Days from the expiry of the 15-day Notice Period.' 
  }
];

export interface LimitationResult {
  deadlineDate: string;
  isBarred: boolean;
  daysRemaining: number;
  formattedDate: string;
}

export const calculateLimitation = (causeDateStr: string, ruleId: string): LimitationResult | null => {
  if (!causeDateStr || !ruleId) return null;
  
  const causeDate = parseISO(causeDateStr);
  if (!isValid(causeDate)) return null;

  const rule = LIMITATION_RULES.find(r => r.id === ruleId);
  if (!rule) return null;

  let deadline = causeDate;
  if (rule.periodYears > 0) deadline = addYears(deadline, rule.periodYears);
  if (rule.periodDays > 0) deadline = addDays(deadline, rule.periodDays);

  const today = new Date();
  const daysRemaining = differenceInDays(deadline, today);

  return {
    deadlineDate: deadline.toISOString().split('T')[0],
    formattedDate: format(deadline, 'MMMM d, yyyy'),
    isBarred: daysRemaining < 0,
    daysRemaining
  };
};

// --- Court Fee Logic (Ad Valorem Slabs - Simplified Model) ---
export const calculateCourtFee = (amount: number): number => {
  let fee = 0;
  
  if (amount <= 0) return 0;

  // Generic Slab (Example based on common State Court Fees Acts)
  if (amount <= 100000) {
    // 7.5% roughly
    fee = amount * 0.075; 
  } else if (amount <= 500000) {
    // First 1L is 7500, next 4L at 3%
    fee = 7500 + ((amount - 100000) * 0.03);
  } else {
    // First 5L is 19500 (7500 + 12000), rest at 1% with a cap usually
    fee = 19500 + ((amount - 500000) * 0.01);
  }

  // Cap at 2 Lakhs or 3 Lakhs depending on state (using 3L cap as example)
  return Math.min(Math.ceil(fee), 300000);
};
